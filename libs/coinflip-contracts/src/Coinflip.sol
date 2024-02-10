// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.20;

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
    mapping(uint gameID => uint wager) wagers;
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
        topUpWallet();
    }

    /// @notice Allow updating Wallets conrtact in case a PPV is ever discovered
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
    function updateMinWagerOfPlayers(uint minWager_) external onlyOwner {
        minWager = minWager_;
    }

    /// @notice Creates a new game
    /// @param wager ether value required paticipating players to pay before playing
    /// @param numberOfPlayers number of participating players
    /// @param expiryTimestamp Expiry timestamp of the game
    /// @param coinSide predicted coin side by you, the creator
    /// @param proofOfChance SHA256 hash of your chance (lucky word[s]) and a random salt combined
    function createGame(
        uint wager,
        uint16 numberOfPlayers,
        uint expiryTimestamp,
        Coin.Side coinSide,
        bytes32 proofOfChance
    ) external payable mustBeOperational {
        if (wager < minWager) {
            revert MinimumWagerNotMet();
        }

        require(numberOfPlayers >= Coin.TOTAL_SIDES_COUNT);

        if (numberOfPlayers > maxNumberOfPlayers) {
            revert MaxNumberOfPlayersError();
        }

        uint newGameID = ++gamesCount;
        maybeTopUpWallet();
        wagers[newGameID] = wager;
        payGameWager(newGameID, wager);
        setNumberOfPlayers(newGameID, numberOfPlayers);
        setGameExpiry(newGameID, expiryTimestamp); 

        emit GameCreated(
            newGameID,
            msg.sender,
            numberOfPlayers,
            expiryTimestamp,
            wager
        );

        createGamePlay(newGameID, coinSide, proofOfChance);
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
        maybeTopUpWallet();
        uint wager = wagers[gameID];
        payGameWager(gameID, wager);
        createGamePlay(gameID, coinSide, proofOfChance);
        maybeSetGameStatusAsAwaitingChancesUpload(gameID);
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
        mustMatchGameStatus(gameID, Game.Status.AwaitingChancesUpload)
    {
        Coin.Side flipOutcome;
        for (uint16 i; i < playCounts[gameID]; ) {
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
                }
                unchecked {
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
        setGameStatusAsConcluded(gameID);
        emit GameCompleted(gameID, flipOutcome, amountForEachWinner);
    }

    /// @notice Batch refunds expired game players
    /// @param gameIDs game IDs of expired games
    function refundExpiredGamePlayersForAllGames(
        uint[] calldata gameIDs
    ) external {
        for (uint8 i; i < gameIDs.length; ) {
            refundExpiredGamePlayers(gameIDs[i]);
            unchecked {
                ++i;
            }
        }
    }

    function adjustExpiryForGame(
        uint gameID,
        uint newExpiryTimestamp
    ) external onlyOwner {
        setGameExpiry(gameID, newExpiryTimestamp);
        emit GameExpiryAdjusted(gameID, newExpiryTimestamp);
    }

    function adjustExpiryForGames(
        uint[] calldata gameIDs,
        uint newExpiryTimestamp
    ) external onlyOwner {
        for (uint8 i; i < gameIDs.length; ) {
            uint gameID = gameIDs[i];

            setGameExpiry(gameID, newExpiryTimestamp);
            emit GameExpiryAdjusted(gameID, newExpiryTimestamp);
            unchecked {
                ++i;
            }
        }
    }

    function refundExpiredGamePlayers(
        uint gameID
    ) private onlyOwner mustMatchGameStatus(gameID, Game.Status.Expired) {
        address[] memory allPlayers = allPlayers[gameID];
        uint16 allPlayersSize = uint16(allPlayers.length);

        uint totalWager =  wagers[gameID] * allPlayersSize;

        uint refundAmountPerPlayer = getSplitAmountAfterServiceChargeDeduction(
            totalWager,
            allPlayersSize
        );

        wallets.creditPlayersAndCreditAppOwnerTheRest(
            gameID,
            allPlayers,
            refundAmountPerPlayer
        );

        setGameStatusAsConcluded(gameID);

        emit ExpiredGameRefunded(gameID, refundAmountPerPlayer);
    }

    function creditGameWinners(
        uint gameID,
        address[] memory winners
    ) private returns (uint amountForEachWinner) {
        uint gameWager = wagers[gameID];
        uint totalWager = gameWager * playCounts[gameID];

        uint amountForEachPlayer = getSplitAmountAfterServiceChargeDeduction(
            totalWager,
            winners.length
        );

        wallets.creditPlayersAndCreditAppOwnerTheRest(
            gameID,
            winners,
            amountForEachPlayer
        );

        return amountForEachPlayer;
    }

    function maybeSetGameStatusAsAwaitingChancesUpload(uint gameID) private {
        uint16 playCount = playCounts[gameID];
        uint16 numberOfPlayers = numberOfPlayersPerGame[gameID];

        if (playCount == numberOfPlayers) {
            setGameStatusAsAwaitingChancesUpload(gameID);
        }
    }

    function payGameWager(uint gameID, uint wager) private {
        wallets.debitForGame(gameID, msg.sender, wager);
    }

    function maybeTopUpWallet() private {
        if (msg.value > 0) {
            topUpWallet();
        }
    }

    function topUpWallet() private {
        wallets.creditPlayer{value: msg.value}(msg.sender);
    }
}
