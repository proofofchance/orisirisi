// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.23;

import {Coin} from './Coinflip/Coin.sol';
import {Game} from './Coinflip/Game.sol';
import {UsingGamePlays} from './Coinflip/GamePlays.sol';
import {UsingGameWagers} from './Coinflip/GameWagers.sol';
import {UsingGameStatuses} from './Coinflip/GameStatuses.sol';

import {MaybeOperational} from './MaybeOperational.sol';
import {ServiceProvider} from './ServiceProvider.sol';
import {Wallets} from './Wallets.sol';
import {Payments} from './Payments.sol';

contract Coinflip is
    UsingGamePlays,
    UsingGameWagers,
    UsingGameStatuses,
    MaybeOperational
{
    mapping(Game.ID => Coin.Side) outcomes;
    uint public gamesCount;

    Wallets public immutable wallets;
    ServiceProvider public immutable serviceProvider;

    error InsufficientWalletBalance();
    error MinimumPlayCountError();

    event GameCreated(
        Game.ID gameID,
        uint16 maxPlayCount,
        uint expiryTimestamp,
        address creator,
        uint wager
    );

    constructor(address payable _wallets, address _serviceProvider) {
        wallets = Wallets(_wallets);
        serviceProvider = ServiceProvider(_serviceProvider);
    }

    receive() external payable {
        payGameWager();
    }

    /// @dev Creates a new game
    /// @param playHash Keccak256 hash of `secretLuckProof` that would
    /// be later uploaded
    function createGame(
        uint wager,
        uint16 maxGamePlayCount,
        uint expiryTimestamp,
        Coin.Side coinSide,
        bytes32 playHash
    ) external payable mustBeOperational {
        if (maxGamePlayCount < Coin.TOTAL_SIDES_COUNT) {
            revert MinimumPlayCountError();
        }
        maybePayGameWager();
        debitGameWager(wager);
        Game.ID newGameID = Game.ID.wrap(gamesCount + 1);
        createGameWager(newGameID, wager);
        setMaxGamePlayCount(newGameID, maxGamePlayCount);
        setGameStatusAsOngoing(newGameID, expiryTimestamp);
        gamesCount++;

        emit GameCreated(
            newGameID,
            maxGamePlayCount,
            expiryTimestamp,
            msg.sender,
            wager
        );

        createGamePlay(newGameID, coinSide, playHash);
    }

    /// Exposed so that players can play using their wallet instead of paying directly here  */
    function playGame(
        Game.ID gameID,
        Coin.Side coinSide,
        bytes32 playHash
    )
        external
        payable
        mustBeOperational
        mustBeOngoingGame(gameID)
        mustAvoidGameWithMaxedOutPlays(gameID)
        mustAvoidAllGamePlaysMatching(gameID, coinSide)
        mustAvoidPlayingAgain(gameID)
    {
        maybePayGameWager();
        debitGameWager(getGameWager(gameID));
        createGamePlay(gameID, coinSide, playHash);
    }

    /// @dev Uploads the proof of chance to prove a game move
    /// @param proofOfChance should contain 32 words. First 24 should be
    /// from the user system's entropy + Last 8 digits of current
    /// timestamp.
    function uploadGamePlayProof(
        Game.ID gameID,
        Game.PlayID gamePlayID,
        bytes32 proofOfChance
    ) external mustBeOperational mustBeOngoingGame(gameID) {
        createGamePlayProof(gameID, gamePlayID, proofOfChance);
        updateGameOutcome(gameID, proofOfChance);

        if (allProofsAreUploaded(gameID)) {
            setGameStatusAsWinnersUnresolved(gameID);
        }
    }

    function creditGamePlayers(
        Game.ID gameID
    ) external mustBeOperational mustBeWinnersUnresolvedOrExpiredGame(gameID) {
        Game.Status gameStatus = getGameStatus(gameID);

        if (gameStatus == Game.Status.WinnersUnresolved) {
            creditGameWinners(gameID);
        } else if (gameStatus == Game.Status.Expired) {
            creditExpiredGamePlayers(gameID);
        }
    }

    function creditGameWinners(
        Game.ID gameID
    ) public mustBeWinnersUnresolvedGame(gameID) {
        Game.Player[] memory winners = players[gameID][outcomes[gameID]];
        uint totalWagerAmount = getGameWager(gameID) * winners.length;

        (uint amountForEachWinner, uint serviceChargeAmount) = serviceProvider
            .getAmountForEachAndServiceCharge(totalWagerAmount, winners.length);

        payServiceCharge(serviceChargeAmount);
        creditPlayers(winners, amountForEachWinner);
        setGameStatusAsConcluded(gameID);
    }

    function creditExpiredGamePlayers(
        Game.ID gameID
    ) public mustBeExpiredGame(gameID) {
        Game.Player[] memory headPlayers = players[gameID][Coin.Side.Head];
        Game.Player[] memory tailPlayers = players[gameID][Coin.Side.Tail];

        uint16 playCount = Game.PlayID.unwrap(playCounts[gameID]);
        assert(headPlayers.length + tailPlayers.length == playCount);
        uint totalWagerAmount = getGameWager(gameID) * playCount;

        (uint amountForEachPlayer, uint serviceChargeAmount) = serviceProvider
            .getAmountForEachAndServiceCharge(totalWagerAmount, playCount);

        payServiceCharge(serviceChargeAmount);
        creditPlayers(headPlayers, amountForEachPlayer);
        creditPlayers(tailPlayers, amountForEachPlayer);
        setGameStatusAsConcluded(gameID);
    }

    function maybePayGameWager() private {
        if (msg.value > 0) {
            payGameWager();
        }
    }

    function payGameWager() private {
        Payments.pay(address(wallets), msg.value);
        wallets.transfer(msg.sender, msg.value);
    }

    function debitGameWager(uint wager) private {
        if (wager > wallets.getBalance(msg.sender)) {
            revert InsufficientWalletBalance();
        }

        bool debited = wallets.debit(msg.sender, wager);

        require(debited);
    }

    function updateGameOutcome(Game.ID gameID, bytes32 proofOfChance) private {
        outcomes[gameID] = Coin.flip(Game.getEntropy(proofOfChance));
    }

    function payServiceCharge(uint serviceChargeAmount) private {
        wallets.transfer(
            serviceProvider.getServiceProviderWallet(),
            serviceChargeAmount
        );
    }

    function creditPlayers(Game.Player[] memory players, uint amount) private {
        for (uint16 i = 0; i <= players.length; i++) {
            wallets.transfer(Game.Player.unwrap(players[i]), amount);
        }
    }
}
