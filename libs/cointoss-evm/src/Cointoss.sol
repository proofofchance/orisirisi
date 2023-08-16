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
    string secret;
    Coin.Side coinSide;
    bytes32 moveHash;
  }

  function newMove(
    Coin.Side coinSide,
    bytes32 moveHash
  ) internal view returns (GameMove memory) {
    return
      GameMove({
        secret: '',
        player: msg.sender,
        coinSide: coinSide,
        moveHash: moveHash
      });
  }

  function isRevealed(GameMove memory gameMove) internal pure returns (bool) {
    return bytes(gameMove.secret).length > 0;
  }
}

contract Cointoss {
  type GameID is uint256;
  type Wager is uint256;
  type GameMoveID is uint16;

  enum GameStatus {
    Ongoing,
    Concluded
  }

  struct Game {
    Wager wager;
    Coin.Side result;
    GameStatus status;
    GameMoveID maxGameMoves;
    GameMoveID gameMovesCount;
    mapping(GameMoveID move_id => Moves.GameMove move) moves;
  }

  mapping(GameID => Game) games;

  uint256 gamesCount;

  modifier mustBeValidGame(GameID gameID) {
    require(GameID.unwrap(gameID) <= gamesCount, 'Non-existent GameID');

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

  GameMoveID constant FIRST_GAME_MOVE_ID = GameMoveID.wrap(0);

  function createGame(
    GameMoveID maxGameMoves,
    Coin.Side coinSide,
    bytes32 moveHash
  ) external payable {
    require(
      GameMoveID.unwrap(maxGameMoves) >= Coin.TOTAL_SIDES_COUNT,
      'Game must allow at least total coin sides moves'
    );

    GameID newGameID = GameID.wrap(gamesCount);

    games[newGameID].moves[FIRST_GAME_MOVE_ID] = Moves.newMove(
      coinSide,
      moveHash
    );

    games[newGameID].wager = Wager.wrap(msg.value);
    games[newGameID].maxGameMoves = maxGameMoves;

    incrementGameMovesCount(newGameID, FIRST_GAME_MOVE_ID);
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
  {
    GameMoveID gameMoveID = games[gameID].gameMovesCount;

    games[gameID].moves[gameMoveID] = Moves.newMove(coinSide, moveHash);

    incrementGameMovesCount(gameID, gameMoveID);
  }

  function incrementGameMovesCount(
    GameID gameID,
    GameMoveID latestGameMoveID
  ) internal {
    games[gameID].gameMovesCount = GameMoveID.wrap(
      GameMoveID.unwrap(latestGameMoveID) + 1
    );
  }
}
