// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.18;

import {Coin} from './Coinflip/Coin.sol';
import {Game} from './Coinflip/Game.sol';
import {UsingGamePlays} from './Coinflip/GamePlays.sol';
import {UsingGameWagers} from './Coinflip/GameWagers.sol';
import {UsingGameStatuses} from './Coinflip/GameStatuses.sol';

import {WalletEnabled} from './WalletEnabled.sol';
import {ServiceCharged} from './ServiceCharged.sol';

contract Coinflip is
  UsingGamePlays,
  UsingGameWagers,
  UsingGameStatuses,
  WalletEnabled,
  ServiceCharged
{
  mapping(Game.ID => Coin.Side) outcomes;
  uint gamesCount;

  modifier mustBeValidGame(Game.ID gameID) {
    require(Game.ID.unwrap(gameID) <= gamesCount, 'Non-existent GameID');

    require(
      Game.PlayID.unwrap(playCounts[gameID]) <=
        Game.PlayID.unwrap(maxPlayCounts[gameID]),
      'Game can no longer take new plays'
    );

    _;
  }

  /// @dev Creates a new game
  /// @param playHash Keccak256 hash of `secretLuckProof` that would
  /// be later uploaded
  function createGame(
    uint16 maxGameMovesCount,
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
    gamesCount++;
  }

  function playGame(
    Game.ID gameID,
    Coin.Side coinSide,
    bytes32 playHash
  )
    external
    payable
    mustBeValidGame(gameID)
    mustBeOngoingGame(gameID)
    mustPayGameWager(gameID)
    mustAvoidAllGamePlayMatching(gameID, coinSide)
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
  ) external {
    require(
      keccak256(abi.encodePacked(proofOfChance)) ==
        plays[gameID][gamePlayID].playHash,
      'Invalid Proof of chance'
    );

    createProofOfChance(gameID, gamePlayID, proofOfChance);

    updateGameOutcome(gameID, proofOfChance);

    maybeConcludeGame(gameID);
  }

  function createProofOfChance(
    Game.ID gameID,
    Game.PlayID gamePlayID,
    bytes32 proofOfChance
  ) private {
    playProofs[gameID][gamePlayID] = proofOfChance;
    playProofCounts[gameID] = Game.PlayID.wrap(
      Game.PlayID.unwrap(playProofCounts[gameID]) + 1
    );
  }

  function updateGameOutcome(Game.ID gameID, bytes32 proofOfChance) private {
    uint16 entropy = Game.getEntropy(proofOfChance);

    outcomes[gameID] = Coin.flip(entropy);
  }

  function maybeConcludeGame(Game.ID gameID) private {
    assert(statuses[gameID] == Game.Status.Ongoing);

    bool allProofsAreUploaded = Game.PlayID.unwrap(playProofCounts[gameID]) ==
      Game.PlayID.unwrap(playCounts[gameID]);

    if (allProofsAreUploaded) {
      statuses[gameID] = Game.Status.Concluded;

      creditPlayersThatPlayedOutcome(gameID);
    }
  }

  function creditPlayersThatPlayedOutcome(Game.ID gameID) private {
    Game.Player[] memory playersThatPlayedOutcome = players[gameID][
      outcomes[gameID]
    ];

    // TODO: Remove charges before this
    // Solidity rounds towards zero. So implicit 'floor' happens here
    uint totalWagerAmount = Game.Wager.unwrap(totalWagers[gameID]);

    uint serviceChargeAmount = (totalWagerAmount * getServiceChargePercent()) /
      100;

    uint totalWagerLeft = totalWagerAmount - serviceChargeAmount;

    uint amountToPayEachPlayer = totalWagerLeft /
      playersThatPlayedOutcome.length;

    uint maybeLeftOver = totalWagerLeft -
      (amountToPayEachPlayer * playersThatPlayedOutcome.length);

    creditWallet(serviceProvider(), serviceChargeAmount + maybeLeftOver);

    for (uint16 i = 0; i <= playersThatPlayedOutcome.length; i++) {
      Game.Player player = playersThatPlayedOutcome[i];

      creditWallet(Game.Player.unwrap(player), amountToPayEachPlayer);
    }
  }
}
