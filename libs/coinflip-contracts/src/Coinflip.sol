// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.23;

import 'hardhat/console.sol';

import {Coin} from './Coinflip/Coin.sol';
import {Game} from './Coinflip/Game.sol';
import {UsingGamePlays} from './Coinflip/GamePlays.sol';
import {UsingGameWagers} from './Coinflip/GameWagers.sol';
import {UsingGameStatuses} from './Coinflip/GameStatuses.sol';

import {Wallets} from './Wallets.sol';
import {Payments} from './Payments.sol';
import {Ownable} from './Ownable.sol';

contract Coinflip is
    UsingGamePlays,
    UsingGameWagers,
    UsingGameStatuses,
    Ownable
{
    //////////////////////////
    ///      COINFLIP     ///
    ////////////////////////
    mapping(uint => Coin.Side) outcomes;
    uint public gamesCount;

    Wallets public immutable wallets;

    error InsufficientWalletBalance();
    error MinimumPlayCountError();

    event GameCreated(
        uint gameID,
        uint16 numberOfPlayers,
        uint expiryTimestamp,
        address creator,
        uint wager
    );
    event GamePlayChanceRevealed(
        uint gameID,
        uint16 gamePlayID,
        bytes chanceAndSalt
    );
    // Completed means the players completed all the actions
    // required to deduce the game outcome.
    // Whereas GameConcluded means it is either completed or expired
    event GameCompleted(
        uint gameID,
        Coin.Side coinSide,
        uint amountForEachWinner
    );

    event ExpiredGameRefunded(uint gameID, uint refundedAmountPerPlayer);

    uint public minWager;
    uint16 public maxNumberOfPlayers;
    error MaxNumberOfPlayersError();
    error IncompleteChanceAndSaltsError(uint expectedChanceAndSaltSize);

    constructor(
        address payable _wallets,
        uint16 _maxNumberOfPlayers,
        uint _minWager
    ) {
        wallets = Wallets(_wallets);
        maxNumberOfPlayers = _maxNumberOfPlayers;
        minWager = _minWager;
    }

    receive() external payable {
        Payments.pay(address(wallets), msg.value);
    }

    /// @dev Creates a new game
    /// @param proofOfChance sha256 hash of `chance + salt` that would
    /// be later revealed
    function createGame(
        uint wager,
        uint16 numberOfPlayers,
        uint expiryTimestamp,
        Coin.Side coinSide,
        bytes32 proofOfChance
    ) external payable mustBeOperational {
        console.log('Wager %s', wager);

        if (numberOfPlayers < Coin.TOTAL_SIDES_COUNT) {
            revert MinimumPlayCountError();
        }

        console.log('numberOfPlayers %s', numberOfPlayers);

        if (numberOfPlayers > maxNumberOfPlayers) {
            revert MaxNumberOfPlayersError();
        }

        uint newGameID = gamesCount + 1;
        maybeTopUpWallet();
        createGameWager(newGameID, wager);
        payGameWager(newGameID, wager);
        setNumberOfPlayers(newGameID, numberOfPlayers);
        setGameStatusAsOngoing(newGameID, expiryTimestamp);
        gamesCount++;

        emit GameCreated(
            newGameID,
            numberOfPlayers,
            expiryTimestamp,
            msg.sender,
            wager
        );

        createGamePlay(newGameID, coinSide, proofOfChance);
    }

    /// Exposed so that players can play using their wallet instead of paying directly here  */
    function playGame(
        uint gameID,
        Coin.Side coinSide,
        bytes32 proofOfChance
    )
        external
        payable
        mustBeOperational
        mustMatchGameStatus(gameID, Game.Status.Ongoing)
        mustAvoidAllGamePlaysMatching(gameID, coinSide)
        mustAvoidPlayingAgain(gameID)
    {
        maybeTopUpWallet();
        uint wager = getGameWager(gameID);
        payGameWager(gameID, wager);
        createGamePlay(gameID, coinSide, proofOfChance);
        maybeSetGameStatusAsAwaitingChancesUpload(gameID);
    }

    function maybeSetGameStatusAsAwaitingChancesUpload(uint gameID) private {
        uint16 playCount = playCounts[gameID];
        uint16 numberOfPlayers = numberOfPlayersPerGame[gameID];

        if (playCount == numberOfPlayers) {
            setGameStatusAsAwaitingChancesUpload(gameID);
        }
    }

    function revealChancesAndCreditWinners(
        uint gameID,
        uint16[] memory gamePlayIDs,
        bytes[] memory chanceAndSalts
    )
        external
        onlyOwner
        mustMatchGameStatus(gameID, Game.Status.AwaitingChancesUpload)
    {
        if (chanceAndSalts.length != numberOfPlayersPerGame[gameID]) {
            revert IncompleteChanceAndSaltsError(gameID);
        }
        require(gamePlayIDs.length == chanceAndSalts.length);

        uint8 flipOutcome = 0;
        for (uint16 i = 0; i < gamePlayIDs.length; i++) {
            bytes memory chanceAndSalt = chanceAndSalts[i];
            uint16 gamePlayID = gamePlayIDs[i];

            if (sha256(chanceAndSalt) != proofOfChances[gameID][gamePlayID]) {
                revert InvalidPlayChance();
            }

            (bytes16 chance, ) = abi.decode(chanceAndSalt, (bytes16, bytes8));

            for (uint8 j = 0; j < 16; j++) {
                bytes1 chance_character = chance[j];
                if (chance_character == 0) {
                    break;
                }

                flipOutcome++;
                if (flipOutcome == 2) {
                    flipOutcome = 0;
                }
            }

            emit GamePlayChanceRevealed(gameID, gamePlayID, chanceAndSalt);
        }
        Coin.Side outcome = Coin.Side(flipOutcome);
        outcomes[gameID] = outcome;
        address[] memory winners = players[gameID][outcomes[gameID]];
        uint amountForEachWinner = creditGameWinners(gameID, winners);
        setGameStatusAsConcluded(gameID);
        emit GameCompleted(gameID, outcome, amountForEachWinner);
    }

    function refundExpiredGamePlayersForAllGames(
        uint[] memory gameIDs
    ) external {
        console.log('blocktimestamp %s', block.timestamp);
        for (uint8 i = 0; i < gameIDs.length; i++) {
            refundExpiredGamePlayers(gameIDs[i]);
        }
    }

    function refundExpiredGamePlayers(
        uint gameID
    ) private onlyOwner mustMatchGameStatus(gameID, Game.Status.Expired) {
        address[] memory allPlayers = allPlayers[gameID];
        uint16 allPlayersSize = uint16(allPlayers.length);

        uint totalWager = getGameWager(gameID) * allPlayersSize;

        uint refundAmountPerPlayer = getSplitAmountAfterServiceChargeDeduction(
            totalWager,
            allPlayersSize
        );

        wallets.creditPlayersAndCreditAppTheRest(
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
        uint gameWager = getGameWager(gameID);
        uint totalWager = gameWager * playCounts[gameID];

        uint amountForEachPlayer = getSplitAmountAfterServiceChargeDeduction(
            totalWager,
            winners.length
        );

        console.log('amountForEachWinner %s', amountForEachPlayer);

        wallets.creditPlayersAndCreditAppTheRest(
            gameID,
            winners,
            amountForEachPlayer
        );

        return amountForEachPlayer;
    }

    function setMaxNumberOfPlayers(
        uint16 maxNumberOfPlayers_
    ) external onlyOwner {
        maxNumberOfPlayers = maxNumberOfPlayers_;
    }

    function maybeTopUpWallet() private {
        if (msg.value > 0) {
            Payments.pay(address(wallets), msg.value);
            wallets.creditPlayer(msg.sender, msg.value);
        }
    }

    function payGameWager(uint gameID, uint wager) private {
        wallets.transferToGameWallet(gameID, msg.sender, wager);
    }

    //////////////////////////////////
    ///      SERVICE PROVIDER     ///
    ////////////////////////////////
    // due to charges for the minimum wager allowed
    // expected to be high due to the gas fee for the minimum wager
    // initialServiceCharges (at deployment):
    // If transaction fee is $6
    uint8 public serviceChargePercent = 8;

    error InvalidServiceChargePercent();

    function setServiceChargePercent(
        uint8 _serviceChargePercent
    ) external onlyOwner {
        if (_serviceChargePercent >= 100) {
            revert InvalidServiceChargePercent();
        }

        serviceChargePercent = _serviceChargePercent;
    }

    /**
     * @dev Returns the service provider wallet owner
     */
    function getServiceProviderWallet() external view returns (address) {
        return owner();
    }

    function getServiceCharge(uint amount) external view returns (uint) {
        return (amount * serviceChargePercent) / 100;
    }

    function getSplitAmountAfterServiceChargeDeduction(
        uint amount,
        uint places
    ) private view returns (uint) {
        uint splitAmount = amount / places;
        splitAmount =
            splitAmount -
            ((splitAmount * serviceChargePercent) / 100);

        return splitAmount;
    }

    //////////////////////////
    /// MAYBE-OPERATIONAL ///
    ////////////////////////
    bool private operational = true;

    error InOperative();

    /**
     * @dev Modifier that requires the "operational" boolean variable to be "true"
     *      This is used on all state changing functions to pause the contract in
     *      the event there is an issue that needs to be fixed
     */
    modifier mustBeOperational() {
        if (!operational) {
            revert InOperative();
        }
        _; // All modifiers require an "_" which indicates where the function body will be added
    }

    /**
     * @dev Sets contract operations on/off
     *
     * When operational mode is disabled, all write transactions except for this one will fail
     */
    function setOperatingStatus(bool mode) external onlyOwner {
        operational = mode;
    }
}
