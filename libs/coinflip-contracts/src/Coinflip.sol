// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.18;

import './Coin.sol';
import './GameMoves.sol';
import './ServiceCharged.sol';

contract Coinflip is ServiceCharged {
  type Wager is uint256;
  type GameID is uint256;
  type GameMoveID is uint16;

  enum GameStatus {
    Ongoing,
    Concluded
  }

  struct Game {
    GameStatus status;
    // Wager concerns
    Wager wager;
    Wager totalWagersFromPlayers;
    // CoinSide concerns
    Coin.Side outcome;
    mapping(Coin.Side coinSide => GameMoves.Player[]) playedCoinSides;
    // GameMoves Concerns
    GameMoveID proofOfChanceCount;
    GameMoveID gameMovesCount;
    GameMoveID maxGameMovesCount;
    mapping(GameMoveID move_id => GameMoves.GameMove move) moves;
  }

  mapping(GameID => Game) games;

  uint256 gamesCount;

  modifier mustBeValidGame(GameID gameID) {
    require(GameID.unwrap(gameID) <= gamesCount, 'Non-existent GameID');

    require(
      GameMoveID.unwrap(games[gameID].gameMovesCount) <=
        GameMoveID.unwrap(games[gameID].maxGameMovesCount),
      'Game can no longer take new moves'
    );

    _;
  }

  modifier mustBeOngoingGame(GameID gameID) {
    require(
      games[gameID].status == GameStatus.Ongoing,
      'Game needs to be Ongoing'
    );

    _;
  }

  modifier mustPayGameWager(GameID gameID) {
    require(
      Wager.unwrap(games[gameID].wager) <= msg.value,
      'Must pay Game wager'
    );

    _;
  }

  modifier mustAvoidAllGameMovesMatching(GameID gameID, Coin.Side coinSide) {
    uint16 gameMovesLeft = GameMoveID.unwrap(games[gameID].maxGameMovesCount) -
      GameMoveID.unwrap(games[gameID].gameMovesCount);

    if (gameMovesLeft == 1) {
      require(
        games[gameID].playedCoinSides[Coin.Side.Head].length > 0 &&
          games[gameID].playedCoinSides[Coin.Side.Tail].length > 0,
        'At least one move must contain the opposite coin side'
      );
    }

    _;
  }

  /// @dev Creates a new game
  /// @param moveHash Keccak256 hash of `secretLuckProof` that would
  /// be later uploaded
  function createGame(
    uint16 maxGameMovesCount,
    Coin.Side coinSide,
    bytes32 moveHash
  ) external payable {
    require(
      maxGameMovesCount >= Coin.TOTAL_SIDES_COUNT,
      'Game must allow at least total coin sides'
    );

    GameID newGameID = GameID.wrap(gamesCount);
    createGameMove(newGameID, coinSide, moveHash);
    games[newGameID].wager = Wager.wrap(msg.value);
    updateTotalWagers(newGameID);
    games[newGameID].maxGameMovesCount = GameMoveID.wrap(maxGameMovesCount);
    gamesCount++;
  }

  function play(
    GameID gameID,
    Coin.Side coinSide,
    bytes32 moveHash
  )
    external
    payable
    mustBeValidGame(gameID)
    mustBeOngoingGame(gameID)
    mustPayGameWager(gameID)
    mustAvoidAllGameMovesMatching(gameID, coinSide)
  {
    updateTotalWagers(gameID);

    createGameMove(gameID, coinSide, moveHash);
  }

  /// @dev Uploads the proof of chance to prove a game move
  /// @param proofOfChance should contain 32 words. First 24 should be
  /// from the user system's entropy + Last 8 digits of current
  /// timestamp.
  function proveGameMove(
    GameID gameID,
    GameMoveID gameMoveID,
    bytes32 proofOfChance
  ) external {
    require(
      keccak256(abi.encodePacked(proofOfChance)) ==
        games[gameID].moves[gameMoveID].moveHash,
      'Invalid Proof of chance'
    );

    createProofOfChance(gameID, gameMoveID, proofOfChance);

    updateGameOutcome(gameID, proofOfChance);

    maybeConcludeGame(gameID);
  }

  function createGameMove(
    GameID gameID,
    Coin.Side coinSide,
    bytes32 moveHash
  ) private {
    GameMoveID gameMoveID = games[gameID].gameMovesCount;
    games[gameID].moves[gameMoveID] = GameMoves.newMove(coinSide, moveHash);
    games[gameID].playedCoinSides[coinSide].push(
      GameMoves.Player.wrap(msg.sender)
    );
    games[gameID].gameMovesCount = GameMoveID.wrap(
      GameMoveID.unwrap(games[gameID].gameMovesCount) + 1
    );
  }

  function updateTotalWagers(GameID gameID) private {
    games[gameID].totalWagersFromPlayers = Wager.wrap(msg.value);
  }

  function createProofOfChance(
    GameID gameID,
    GameMoveID gameMoveID,
    bytes32 proofOfChance
  ) private {
    games[gameID].moves[gameMoveID].proofOfChance = proofOfChance;
    games[gameID].proofOfChanceCount = GameMoveID.wrap(
      GameMoveID.unwrap(games[gameID].proofOfChanceCount) + 1
    );
  }

  function updateGameOutcome(GameID gameID, bytes32 proofOfChance) private {
    uint16 entropy = getEntropyFromProofOfChance(proofOfChance);

    games[gameID].outcome = Coin.flip(entropy);
  }

  function getEntropyFromProofOfChance(
    bytes32 proofOfChance
  ) private pure returns (uint16) {
    uint16 sum = 0;

    for (uint8 i = 0; i < 32; i++) {
      sum += uint8(proofOfChance[i]);
    }

    return sum;
  }

  function maybeConcludeGame(GameID gameID) private {
    assert(games[gameID].status == GameStatus.Ongoing);

    bool allProofsAreUploaded = GameMoveID.unwrap(
      games[gameID].proofOfChanceCount
    ) == GameMoveID.unwrap(games[gameID].gameMovesCount);

    if (allProofsAreUploaded) {
      games[gameID].status = GameStatus.Concluded;

      payPlayersThatPlayedOutcome(gameID);
    }
  }

  function payPlayersThatPlayedOutcome(GameID gameID) private {
    GameMoves.Player[] memory playersThatPlayedOutcome = games[gameID]
      .playedCoinSides[games[gameID].outcome];

    // TODO: Remove charges before this
    // Solidity rounds towards zero. So implicit 'floor' happens here
    uint256 amountToPayEachPlayer = Wager.unwrap(games[gameID].wager) /
      playersThatPlayedOutcome.length;

    for (uint16 i = 0; i <= playersThatPlayedOutcome.length; i++) {
      GameMoves.Player player = playersThatPlayedOutcome[i];

      pay(payable(GameMoves.Player.unwrap(player)), amountToPayEachPlayer);
    }
  }

  function pay(address payable to, uint256 amount) private {
    (bool sent, ) = to.call{value: amount}('');
    require(sent, 'Failed to send payment');
  }
}
