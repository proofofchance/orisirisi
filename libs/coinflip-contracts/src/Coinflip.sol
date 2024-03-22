// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity 0.8.25;

import {Coin} from './Coinflip/Coin.sol';
import {Game} from './Coinflip/Game.sol';
import {UsingGamePlays} from './Coinflip/GamePlays.sol';
import {UsingGameStatuses} from './Coinflip/GameStatuses.sol';

import {Wallets} from './Wallets.sol';
import {Ownable} from './Ownable.sol';
import {MaybeOperational} from './MaybeOperational.sol';
import {UsingServiceProvider} from './ServiceProvider.sol';

contract Coinflip is
    UsingGamePlays,
    UsingGameStatuses,
    Ownable,
    MaybeOperational,
    UsingServiceProvider
{
    uint public minWager;
    mapping(uint gameID => uint wager) public wagers;
    uint16 public maxNumberOfPlayers;
    uint public gamesCount;
    Wallets public wallets;

    event GameCreated(
        uint indexed gameID,
        address indexed creator,
        uint16 numberOfPlayers,
        uint expiryTimestamp,
        uint wager
    );
    event GamePlayChanceRevealed(
        uint indexed gameID,
        uint16 indexed gamePlayID,
        bytes chanceAndSalt
    );
    event GameCompleted(
        uint indexed gameID,
        Coin.Side coinSide,
        uint amountForEachWinner
    );
    event ExpiredGameRefunded(
        uint indexed gameID,
        uint refundedAmountPerPlayer
    );
    event GameExpiryAdjusted(uint indexed gameID, uint expiryTimestamp);

    error IncorrectGameWager();
    error MinimumWagerNotMet();
    error InvalidProofOfChance();
    error MaxNumberOfPlayersError();

    constructor(
        address payable wallets_,
        uint16 maxNumberOfPlayers_,
        uint minWager_
    ) {
        wallets = Wallets(wallets_);
        maxNumberOfPlayers = maxNumberOfPlayers_;
        minWager = minWager_;
    }

    /// @notice Coinflip tops up your wallet balance when it receives any ether value
    receive() external payable {
        wallets.creditAccount{value: msg.value}(msg.sender);
    }

    /// @notice Allow updating Wallets contract in case a PPV is ever discovered
    function updateWallets(address payable wallets_) external onlyOwner {
        wallets = Wallets(wallets_);
    }

    /// @notice Updates max number of players to avoid concluding games with very high gas fee
    function updateMaxNumberOfPlayers(
        uint16 maxNumberOfPlayers_
    ) external onlyOwner {
        maxNumberOfPlayers = maxNumberOfPlayers_;
    }

    /// @notice Updates min wager allowed
    function updateMinWager(uint minWager_) external onlyOwner {
        minWager = minWager_;
    }

    /// @notice Creates a new game
    /// @param numberOfPlayers number of participating players
    /// @param expiryTimestamp Expiry timestamp of the game
    /// @param coinSide predicted coin side by you, the creator
    /// @param proofOfChance SHA256 hash of your chance (lucky word[s]) and a random salt combined
    function createGame(
        uint16 numberOfPlayers,
        uint expiryTimestamp,
        Coin.Side coinSide,
        bytes32 proofOfChance
    ) external payable mustBeOperational {
        uint wager = msg.value;
        if (wager < minWager) {
            revert MinimumWagerNotMet();
        }

        require(numberOfPlayers >= Coin.TOTAL_SIDES_COUNT);

        if (numberOfPlayers > maxNumberOfPlayers) {
            revert MaxNumberOfPlayersError();
        }

        uint newGameID = ++gamesCount;
        wagers[newGameID] = wager;
        setNumberOfPlayers(newGameID, numberOfPlayers);
        setGameExpiry(newGameID, expiryTimestamp);

        address player = msg.sender;
        emit GameCreated(
            newGameID,
            player,
            numberOfPlayers,
            expiryTimestamp,
            wager
        );
        createGamePlay(player, newGameID, coinSide, proofOfChance);
    }

    /// @notice Allows playing an already created game
    /// @param gameID already created game ID
    /// @param coinSide coin side outcome prediction
    /// @param proofOfChance SHA256 hash of your chance (lucky word[s]) and a random salt combined
    function playGame(
        uint gameID,
        Coin.Side coinSide,
        bytes32 proofOfChance
    )
        external
        payable
        mustBeOperational
        mustMatchGameStatus(gameID, Game.Status.AwaitingPlayers)
        mustAvoidAllGamePlaysMatching(gameID, coinSide)
        mustAvoidPlayingAgain(gameID)
    {
        uint wager = wagers[gameID];
        if (msg.value != wager) {
            revert IncorrectGameWager();
        }
        createGamePlay(msg.sender, gameID, coinSide, proofOfChance);
        maybeSetGameStatusAsAwaitingChancesReveal(gameID);
    }

    /// @notice Reveals the chances (lucky words) of all plays for a given game.
    /// After, it computes and stores the coinflip outcome for the given game.
    /// Then, it credits players that predicted the coinflip outcome correctly with the combined
    /// wager shared equally (after service charge deduction)
    /// @param gameID already created game ID
    /// @param chanceAndSalts list of the chance and salts combined in the order of their respecitive play IDs
    function revealChancesAndCreditWinners(
        uint gameID,
        bytes[] calldata chanceAndSalts
    )
        external
        onlyOwner
        mustMatchGameStatus(gameID, Game.Status.AwaitingChancesReveal)
    {
        Coin.Side flipOutcome;
        for (uint16 i; i < numberOfPlayersForGameWith[gameID]; ) {
            bytes calldata chanceAndSalt = chanceAndSalts[i];

            uint16 gamePlayID = i + 1;

            if (sha256(chanceAndSalt) != proofOfChances[gameID][gamePlayID]) {
                revert InvalidProofOfChance();
            }

            (bytes16 chance, ) = abi.decode(chanceAndSalt, (bytes16, bytes8));

            for (uint8 j; j < 16; ) {
                bytes1 chance_character = chance[j];
                if (chance_character == 0) {
                    break;
                }

                unchecked {
                    if (flipOutcome == Coin.Side.Head) {
                        flipOutcome = Coin.Side.Tail;
                    } else {
                        flipOutcome = Coin.Side.Head;
                    }

                    ++j;
                }
            }
            emit GamePlayChanceRevealed(gameID, gamePlayID, chanceAndSalt);
            unchecked {
                ++i;
            }
        }

        address[] memory winners = players[gameID][flipOutcome];
        uint amountForEachWinner = creditGameWinners(gameID, winners);
        setGameStatus(gameID, Game.Status.Concluded);
        emit GameCompleted(gameID, flipOutcome, amountForEachWinner);
    }

    /// @notice Batch refunds expired game players
    /// @param gameIDs game IDs of expired games
    /// @dev Everyone's authorized to remove the possibility of locking
    /// wagers forever if an owner loses access to their private keys
    function refundExpiredGamePlayersForGames(
        uint[] calldata gameIDs
    ) external {
        for (uint8 i; i < gameIDs.length; ) {
            _refundExpiredGamePlayers(gameIDs[i]);
            unchecked {
                ++i;
            }
        }
    }

    /// @notice Refund wagers of an expired game to its players
    /// @param gameID game ID of expired game
    function refundExpiredGamePlayers(uint gameID) external {
        _refundExpiredGamePlayers(gameID);
    }

    function adjustExpiryForGame(
        uint gameID,
        uint newExpiryTimestamp
    ) external onlyOwner {
        _adjustExpiryForGame(gameID, newExpiryTimestamp);
    }

    function adjustExpiryForGames(
        uint[] calldata gameIDs,
        uint newExpiryTimestamp
    ) external onlyOwner {
        for (uint8 i; i < gameIDs.length; ) {
            uint gameID = gameIDs[i];

            _adjustExpiryForGame(gameID, newExpiryTimestamp);

            unchecked {
                ++i;
            }
        }
    }

    function _adjustExpiryForGame(
        uint gameID,
        uint newExpiryTimestamp
    ) private {
        Game.Status gameStatus = getGameStatus(gameID);
        require(
            gameStatus == Game.Status.AwaitingPlayers ||
                gameStatus == Game.Status.AwaitingChancesReveal
        );

        setGameExpiry(gameID, newExpiryTimestamp);
        emit GameExpiryAdjusted(gameID, newExpiryTimestamp);
    }

    /// @notice returns the ether balance of this contract i.e. total wagers staked
    function getTotalBalance() external view returns (uint) {
        return address(this).balance;
    }

    function creditGameWinners(
        uint gameID,
        address[] memory winners
    ) private returns (uint amountForEachWinner) {
        uint gameWager = wagers[gameID];
        uint totalWager = gameWager * playCountsSoFar[gameID];
        (
            uint amountForEachPlayer,
            uint serviceChargeAmount
        ) = getSplitAndServiceChargeAmounts(totalWager, winners.length);
        wallets.creditManyAndOne{value: totalWager}(
            winners,
            amountForEachPlayer,
            owner(),
            serviceChargeAmount
        );
        return amountForEachPlayer;
    }

    function _refundExpiredGamePlayers(
        uint gameID
    ) private mustMatchGameStatus(gameID, Game.Status.Expired) {
        address[] memory allPlayers = allPlayers[gameID];
        uint16 allPlayersLength = uint16(allPlayers.length);
        uint totalWager = wagers[gameID] * allPlayersLength;
        (
            uint refundAmountPerPlayer,
            uint serviceChargeAmount
        ) = getSplitAndServiceChargeAmounts(totalWager, allPlayersLength);
        wallets.creditManyAndOne{value: totalWager}(
            allPlayers,
            refundAmountPerPlayer,
            owner(),
            serviceChargeAmount
        );
        setGameStatus(gameID, Game.Status.Concluded);
        emit ExpiredGameRefunded(gameID, refundAmountPerPlayer);
    }

    function maybeSetGameStatusAsAwaitingChancesReveal(uint gameID) private {
        uint16 playCount = playCountsSoFar[gameID];
        uint16 numberOfPlayers = numberOfPlayersForGameWith[gameID];

        if (playCount == numberOfPlayers) {
            setGameStatus(gameID, Game.Status.AwaitingChancesReveal);
        }
    }
}
