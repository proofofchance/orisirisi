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
    string secret;
    Coin.Side coinSide;
    bytes32 moveHash;
  }

  function newMove(
    Coin.Side coinSide,
    bytes32 moveHash
  ) internal pure returns (GameMove memory) {
    return GameMove({secret: '', coinSide: coinSide, moveHash: moveHash});
  }

  function isRevealed(GameMove memory gameMove) internal pure returns (bool) {
    return bytes(gameMove.secret).length > 0;
  }
}

contract Cointoss {
  type GameID is uint256;
  type GameMoveID is uint16;

  struct Game {
    mapping(GameMoveID move_id => Moves.GameMove move) moves;
    Coin.Side result;
    GameMoveID maxGameMoves;
    GameMoveID gameMovesCount;
  }

  uint256 gamesCount;
  mapping(GameID => Game) games;

  function createGame(
    GameMoveID maxGameMoves,
    Coin.Side coinSide,
    bytes32 moveHash
  ) external {
    require(
      GameMoveID.unwrap(maxGameMoves) >= Coin.TOTAL_SIDES_COUNT,
      'Game must allow at least total coin sides moves'
    );

    GameID newGameId = GameID.wrap(gamesCount);
    GameMoveID creatorFirstGameMoveID = GameMoveID.wrap(0);

    games[newGameId].moves[creatorFirstGameMoveID] = Moves.newMove(
      coinSide,
      moveHash
    );

    games[newGameId].maxGameMoves = maxGameMoves;
    games[newGameId].gameMovesCount = GameMoveID.wrap(
      GameMoveID.unwrap(creatorFirstGameMoveID) + 1
    );

    gamesCount++;
  }
}
