// SPDX-License-Identifier: SEE LICENSE IN LICENSE
library Coin {
  enum Side {
    Head,
    Tail
  }

  uint8 public constant TOTAL_SIDES_COUNT = 2;
}

library Moves {
  struct GameMove {
    address player;
    Coin.Side coinSide;
    bytes32 proofOfChance;
    bytes32 moveHash;
  }

  function newMove(
    Coin.Side coinSide,
    bytes32 moveHash
  ) internal view returns (GameMove memory) {
    return
      GameMove({
        player: msg.sender,
        coinSide: coinSide,
        proofOfChance: '',
        moveHash: moveHash
      });
  }

  function isRevealed(GameMove memory gameMove) internal pure returns (bool) {
    return gameMove.proofOfChance != 0;
  }
}

contract Cointoss {
  type Wager is uint256;
  type GameID is uint256;
  type GameMoveID is uint16;

  enum GameStatus {
    Ongoing,
    Concluded
  }

  struct Game {
    Wager wager;
    Coin.Side result;
    GameStatus status;
    uint16 maxGameMovesCount;
    uint16 gameMovesCount;
    mapping(Coin.Side coinSide => bool) coinSidesSoFar;
    mapping(GameMoveID move_id => Moves.GameMove move) moves;
  }

  mapping(GameID => Game) games;

  uint256 gamesCount;

  modifier mustBeValidGame(GameID gameID) {
    require(GameID.unwrap(gameID) <= gamesCount, 'Non-existent GameID');

    require(
      games[gameID].gameMovesCount <= games[gameID].maxGameMovesCount,
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
    uint16 gameMovesLeft = games[gameID].maxGameMovesCount -
      games[gameID].gameMovesCount;

    if (gameMovesLeft == 1) {
      require(
        games[gameID].coinSidesSoFar[Coin.Side.Head] &&
          games[gameID].coinSidesSoFar[Coin.Side.Tail],
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

    games[newGameID].maxGameMovesCount = maxGameMovesCount;

    gamesCount++;
  }

  function participate(
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
    createGameMove(gameID, coinSide, moveHash);
  }

  function createGameMove(
    GameID gameID,
    Coin.Side coinSide,
    bytes32 moveHash
  ) internal {
    GameMoveID gameMoveID = GameMoveID.wrap(games[gameID].gameMovesCount);

    games[gameID].moves[gameMoveID] = Moves.newMove(coinSide, moveHash);
    games[gameID].coinSidesSoFar[coinSide] = true;

    games[gameID].gameMovesCount = GameMoveID.unwrap(gameMoveID) + 1;
  }
}
