// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.18;

import {Coin} from './Coinflip/Coin.sol';
import {Game} from './Coinflip/Game.sol';
import {UsingGamePlays} from './Coinflip/GamePlays.sol';
import {UsingGameWagers} from './Coinflip/GameWagers.sol';
import {UsingGameStatuses} from './Coinflip/GameStatuses.sol';

import {MaybeOperational} from './MaybeOperational.sol';
import {ServiceProvider} from './ServiceProvider.sol';
import {Wallets, UsingCanPayWallet} from './Wallets.sol';

contract Coinflip is
    UsingGamePlays,
    UsingGameWagers,
    UsingGameStatuses,
    UsingCanPayWallet,
    MaybeOperational
{
    mapping(Game.ID => Coin.Side) outcomes;
    uint gamesCount;

    Wallets private wallets;
    ServiceProvider private serviceProvider;

    constructor(address payable _wallets, address _serviceProvider) {
        wallets = Wallets(_wallets);
        serviceProvider = ServiceProvider(_serviceProvider);
    }

    receive() external payable {
        payWallet(payable(address(wallets)), msg.value);

        wallets.creditWallet(msg.sender, msg.value);
    }

    modifier mustHaveGameWager(Game.ID gameID) {
        require(
            getGameWager(gameID) <= wallets.getWalletBalance(msg.sender),
            'Must pay Game wager'
        );

        _;
    }

    /// @dev Creates a new game
    /// @param playHash Keccak256 hash of `secretLuckProof` that would
    /// be later uploaded
    function createGame(
        uint wager,
        uint16 maxGameMovesCount,
        uint expiryTimestamp,
        Coin.Side coinSide,
        bytes32 playHash
    ) external payable mustBeOperational {
        maybePayGameWager();
        require(
            maxGameMovesCount >= Coin.TOTAL_SIDES_COUNT,
            'Game must allow at least total coin sides'
        );
        require(wager <= myBalance(), 'Must pay Game wager');
        debitGameWager(wager);
        Game.ID newGameID = Game.ID.wrap(gamesCount);
        createGamePlay(newGameID, coinSide, playHash);
        createGameWager(newGameID, wager);
        setMaxGamePlayCount(newGameID, maxGameMovesCount);
        setGameStatusAsOngoing(newGameID, expiryTimestamp);
        gamesCount++;
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
        mustHaveGameWager(gameID)
        mustAvoidAllGamePlaysMatching(gameID, coinSide)
    {
        maybePayGameWager();
        require(getGameWager(gameID) <= myBalance(), 'Must pay Game wager');
        debitGameWager(getGameWager(gameID));
        createGamePlay(gameID, coinSide, playHash);
    }

    /// @dev Uploads the proof of chance to prove a game move
    /// @param proofOfChance should contain 32 words. First 24 should be
    /// from the user system's entropy + Last 8 digits of current
    /// timestamp.
    function proveGamePlay(
        Game.ID gameID,
        Game.PlayID gamePlayID,
        bytes32 proofOfChance
    ) external mustBeOperational mustBeOngoingGame(gameID) {
        require(
            keccak256(abi.encodePacked(proofOfChance)) ==
                plays[gameID][gamePlayID].playHash,
            'Invalid Proof of chance'
        );

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
            payWallet(msg.sender, msg.value);
        }
    }

    function myBalance() private view returns (uint) {
        return wallets.getWalletBalance(msg.sender);
    }

    function debitGameWager(uint wager) private {
        bool debited = wallets.debitWallet(msg.sender, wager);

        require(debited, 'GameWager debit failed');
    }

    function updateGameOutcome(Game.ID gameID, bytes32 proofOfChance) private {
        outcomes[gameID] = Coin.flip(Game.getEntropy(proofOfChance));
    }

    function payServiceCharge(uint serviceChargeAmount) private {
        wallets.creditWallet(
            serviceProvider.getServiceProviderWallet(),
            serviceChargeAmount
        );
    }

    function creditPlayers(Game.Player[] memory players, uint amount) private {
        for (uint16 i = 0; i <= players.length; i++) {
            wallets.creditWallet(Game.Player.unwrap(players[i]), amount);
        }
    }
}
