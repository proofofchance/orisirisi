// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.18;

import {Coin} from './Coinflip/Coin.sol';
import {Game} from './Coinflip/Game.sol';
import {UsingGamePlays} from './Coinflip/GamePlays.sol';
import {UsingGameWagers} from './Coinflip/GameWagers.sol';
import {UsingGameStatuses} from './Coinflip/GameStatuses.sol';

import {Wallets} from './Wallets.sol';
import {ServiceCharged} from './ServiceCharged.sol';

contract Coinflip is
  UsingGamePlays,
  UsingGameWagers,
  UsingGameStatuses,
  ServiceCharged
{
  mapping(Game.ID => Coin.Side) outcomes;
  uint gamesCount;

  Wallets public wallets;

  constructor(address _wallets) {
    wallets = Wallets(_wallets);
  }

  /// @dev Creates a new game
  /// @param playHash Keccak256 hash of `secretLuckProof` that would
  /// be later uploaded
  function createGame(
    uint16 maxGameMovesCount,
    uint expiry_timestamp,
    Coin.Side coinSide,
    bytes32 playHash
  ) external payable {
    require(
      maxGameMovesCount >= Coin.TOTAL_SIDES_COUNT,
      'Game must allow at least total coin sides'
    );

    Game.ID newGameID = Game.ID.wrap(gamesCount);
    createGamePlay(newGameID, coinSide, playHash);
    createGameWager(newGameID, msg.value);
    updateTotalWagers(newGameID, msg.value);
    setMaxGamePlayCount(newGameID, maxGameMovesCount);
    setGameStatusAsOngoing(newGameID, expiry_timestamp);
    gamesCount++;
  }

  function playGame(
    Game.ID gameID,
    Coin.Side coinSide,
    bytes32 playHash
  )
    external
    payable
    mustBeOngoingGame(gameID)
    mustAvoidGameWithMaxedOutPlays(gameID)
    mustPayGameWager(gameID)
    mustAvoidAllGamePlaysMatching(gameID, coinSide)
  {
    updateTotalWagers(gameID, msg.value);
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
  ) external mustBeOngoingGame(gameID) {
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
  ) external mustBeWinnersUnresolvedOrExpiredGame(gameID) {
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

    (
      uint amountForEachWinner,
      uint serviceChargeAmount
    ) = getAmountForEachAndServiceCharge(
        getTotalWagerAmount(gameID),
        winners.length
      );

    wallets.creditWallet(serviceProvider(), serviceChargeAmount);
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

    (
      uint amountForEachPlayer,
      uint serviceChargeAmount
    ) = getAmountForEachAndServiceCharge(
        getTotalWagerAmount(gameID),
        playCount
      );

    wallets.creditWallet(serviceProvider(), serviceChargeAmount);
    creditPlayers(headPlayers, amountForEachPlayer);
    creditPlayers(tailPlayers, amountForEachPlayer);
    setGameStatusAsConcluded(gameID);
  }

  function updateGameOutcome(Game.ID gameID, bytes32 proofOfChance) private {
    outcomes[gameID] = Coin.flip(Game.getEntropy(proofOfChance));
  }

  function creditPlayers(Game.Player[] memory players, uint amount) private {
    for (uint16 i = 0; i <= players.length; i++) {
      wallets.creditWallet(Game.Player.unwrap(players[i]), amount);
    }
  }
}
