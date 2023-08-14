import {
  CoinSide,
  coinSideToString,
  oppositeCoinSide,
  totalCoinSides,
} from './coin';
import { Move, Moves } from './moves';

export { CoinSide } from './coin';

export enum Chain {
  Ethereum = 1,
  Polygon = 137,
  BnbSmartChain = 56,
  BnbTestNet = 97,
  SepoliaTestNet = 11155111,
}

export class Address {
  constructor(public readonly value: string, public readonly chain: Chain) {}
}
export class Player {
  constructor(public readonly address: Address) {}
}

class Game {
  private moves: Moves;
  private result: CoinSide | null = null;

  constructor(
    private readonly numberOfPlayers: number,
    private readonly chain: Chain
  ) {
    this.moves = new Moves(this.numberOfPlayers);
  }

  play(player: Player, coinSide: CoinSide) {
    if (player.address.chain !== this.chain) {
      throw new Error(
        `Player:${player.address} cannot play game in ChainID:${this.chain}`
      );
    }

    if (this.moves.allMatch(coinSide) && this.moves.oneMoveLeft()) {
      throw new Error(
        `Player:${player.address} has to pick CoinSide:${coinSideToString(
          oppositeCoinSide(coinSide)
        )}`
      );
    }

    const move = new Move(player, coinSide);

    this.moves.make(move);

    return move;
  }

  revealMove(move: Move): Game {
    this.moves = this.moves.revealMove(move);

    return this;
  }

  withResult(): Game {
    if (!this.moves.allRevelead())
      throw new Error('All moves must be proven before populating result');

    this.result = this.moves.totalSizeOfSecrets() % totalCoinSides();

    return this;
  }

  getWinners(): Player[] {
    if (this.result === null)
      throw new Error('Game result must be ready before getting winners');

    return this.moves.playersWithCoinSide(this.result);
  }

  getLosers(): Player[] {
    if (this.result === null)
      throw new Error('Game result must be ready before getting winners');

    return this.moves.playersWithCoinSide(oppositeCoinSide(this.result));
  }
}

/**
 * A game where players toss coin and the side shown determines
 * the winner of the game. The winner takes all the wagers.
 *
 * In simple terms, a player makes a move with their revealable secret and the coin side.
 * The other player does the same. The coin toss output is then determined by both players'
 * secrets lengths when added. Players need to reveal their secrets. If they don't, we will
 * have to auto-return their wagers (minus our charges)
 *
 * Multi players feature: the winners takes all.
 *
 * In the case of tie breakers (0 losers), the game will be replayed. When we support rounds, an
 * extra round will be played instead.
 */
export { Game as CoinToss };
