// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.18;

import {Coin} from './Coinflip/Coin.sol';
import {Game} from './Coinflip/Game.sol';
import {UsingGamePlays} from './Coinflip/GamePlays.sol';
import {UsingGameWagers} from './Coinflip/GameWagers.sol';
import {UsingGameStatuses} from './Coinflip/GameStatuses.sol';

import {AfterCreditWalletCallback, Wallets, UsingCanPayWallet} from './Wallets.sol';
import {UsingServiceProvider} from './ServiceProvider.sol';

contract Coinflip is
  UsingGamePlays,
  UsingGameWagers,
  UsingGameStatuses,
  UsingServiceProvider,
  UsingCanPayWallet,
  AfterCreditWalletCallback
{
  mapping(Game.ID => Coin.Side) outcomes;
  uint gamesCount;

  Wallets public wallets;

  constructor(address payable _wallets) {
    wallets = Wallets(_wallets);
  }

  receive() external payable {
    payWallet(payable(address(wallets)), msg.value);

    wallets.creditWallet(msg.sender, msg.value);
  }

  modifier mustHaveGameWager(Game.ID gameID, Game.Player player) {
    require(
      getGameWager(gameID) <=
        wallets.getWalletBalance(Game.Player.unwrap(player)),
      'Must pay Game wager'
    );

    _;
  }

  uint8 constant CREATE_GAME_FUNCTION_ID = 1;
  uint8 constant PLAY_GAME_FUNCTION_ID = 2;

  mapping(bytes32 callbackID => Game.CreateParams createParams) createGameParamsList;
  mapping(bytes32 callbackID => Game.PlayParams playParams) playGameParamsList;

  function afterCreditWallet(uint8 functionID, bytes32 callBackID) external {
    if (functionID == CREATE_GAME_FUNCTION_ID) {
      Game.CreateParams memory createParams = createGameParamsList[callBackID];

      createGame(
        createParams.player,
        createParams.wager,
        createParams.maxGameMovesCount,
        createParams.expiryTimestamp,
        createParams.coinSide,
        createParams.playHash
      );
    } else if (functionID == PLAY_GAME_FUNCTION_ID) {
      Game.PlayParams memory playParams = playGameParamsList[callBackID];

      playGame(
        playParams.player,
        playParams.gameID,
        playParams.coinSide,
        playParams.playHash
      );
    }
  }

  function createGameForMe(
    uint wager,
    uint16 maxGameMovesCount,
    uint expiryTimestamp,
    Coin.Side coinSide,
    bytes32 playHash
  ) external payable mustBeValidWager {
    bytes32 callbackID = keccak256(
      abi.encode(
        msg.sender,
        wager,
        maxGameMovesCount,
        expiryTimestamp,
        coinSide,
        playHash,
        block.timestamp
      )
    );

    createGameParamsList[callbackID] = Game.CreateParams({
      player: Game.Player.wrap(msg.sender),
      wager: wager,
      maxGameMovesCount: maxGameMovesCount,
      expiryTimestamp: expiryTimestamp,
      coinSide: coinSide,
      playHash: playHash
    });

    AfterCreditWalletCallback callback = this;
    wallets.creditWallet(
      msg.sender,
      msg.value,
      CREATE_GAME_FUNCTION_ID,
      callbackID,
      callback
    );
  }

  /// @dev Creates a new game
  /// @param playHash Keccak256 hash of `secretLuckProof` that would
  /// be later uploaded
  /// Exposed so that players can play using their wallet instead of paying directly here  */
  function createGame(
    Game.Player player,
    uint wager,
    uint16 maxGameMovesCount,
    uint expiryTimestamp,
    Coin.Side coinSide,
    bytes32 playHash
  ) public {
    require(
      maxGameMovesCount >= Coin.TOTAL_SIDES_COUNT,
      'Game must allow at least total coin sides'
    );

    Game.ID newGameID = Game.ID.wrap(gamesCount);
    createGamePlay(player, newGameID, coinSide, playHash);
    createGameWager(newGameID, wager);
    setMaxGamePlayCount(newGameID, maxGameMovesCount);
    setGameStatusAsOngoing(newGameID, expiryTimestamp);
    payGameWager(player, wager);
    gamesCount++;
  }

  function playGameForMe(
    Game.ID gameID,
    Coin.Side coinSide,
    bytes32 playHash
  ) external payable {
    bytes32 callbackID = keccak256(
      abi.encode(msg.sender, gameID, coinSide, playHash, block.timestamp)
    );

    playGameParamsList[callbackID] = Game.PlayParams({
      player: Game.Player.wrap(msg.sender),
      gameID: gameID,
      coinSide: coinSide,
      playHash: playHash
    });

    AfterCreditWalletCallback callback = this;
    wallets.creditWallet(
      msg.sender,
      msg.value,
      PLAY_GAME_FUNCTION_ID,
      callbackID,
      callback
    );
  }

  /// Exposed so that players can play using their wallet instead of paying directly here  */
  function playGame(
    Game.Player player,
    Game.ID gameID,
    Coin.Side coinSide,
    bytes32 playHash
  )
    public
    mustBeOngoingGame(gameID)
    mustAvoidGameWithMaxedOutPlays(gameID)
    mustHaveGameWager(gameID, player)
    mustAvoidAllGamePlaysMatching(gameID, coinSide)
  {
    createGamePlay(player, gameID, coinSide, playHash);
    payGameWager(player, getGameWager(gameID));
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
    uint totalWagerAmount = getGameWager(gameID) * winners.length;

    (
      uint amountForEachWinner,
      uint serviceChargeAmount
    ) = getAmountForEachAndServiceCharge(totalWagerAmount, winners.length);

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

    (
      uint amountForEachPlayer,
      uint serviceChargeAmount
    ) = getAmountForEachAndServiceCharge(totalWagerAmount, playCount);

    payServiceCharge(serviceChargeAmount);
    creditPlayers(headPlayers, amountForEachPlayer);
    creditPlayers(tailPlayers, amountForEachPlayer);
    setGameStatusAsConcluded(gameID);
  }

  function payGameWager(Game.Player player, uint wager) private {
    address owner = Game.Player.unwrap(player);

    wallets.debitWallet(owner, wager);
  }

  function updateGameOutcome(Game.ID gameID, bytes32 proofOfChance) private {
    outcomes[gameID] = Coin.flip(Game.getEntropy(proofOfChance));
  }

  function payServiceCharge(uint serviceChargeAmount) private {
    wallets.creditWallet(getServiceProviderWallet(), serviceChargeAmount);
  }

  function creditPlayers(Game.Player[] memory players, uint amount) private {
    for (uint16 i = 0; i <= players.length; i++) {
      wallets.creditWallet(Game.Player.unwrap(players[i]), amount);
    }
  }
}
