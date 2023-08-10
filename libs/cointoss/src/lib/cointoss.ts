export enum CoinSide {
  Head = 0,
  Tail = 1,
}

function oppositeCoinSide(coinSide: CoinSide): CoinSide {
  switch (coinSide) {
    case CoinSide.Head:
      return CoinSide.Tail;

    case CoinSide.Tail:
      return CoinSide.Head;
  }
}

function coinSideToString(coinSide: CoinSide): string {
  switch (coinSide) {
    case CoinSide.Head:
      return 'Head';

    case CoinSide.Tail:
      return 'Tail';
  }
}

function totalCoinSides(): number {
  return Object.keys(CoinSide).length;
}

import { SHA256 } from 'crypto-js';

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

export class Move {
  private revealedSecret: string | null = null;
  public readonly hashedValue: string;

  constructor(
    public readonly player: Player,
    public readonly coinSide: CoinSide,
    readonly revealableSecret: string
  ) {
    this.hashedValue = this.hash(revealableSecret, coinSide);
  }

  prove(secret: string): Move {
    if (this.hash(secret, this.coinSide) !== this.hashedValue)
      throw new Error('Secret mismatch');

    this.revealedSecret = secret;

    return this;
  }

  secret = () => this.revealedSecret;

  isProven = () => !!this.revealableSecret;

  private hash = (secret: string, coinSide: CoinSide) =>
    SHA256(secret + coinSide).toString();
}

class Moves {
  private value: Move[] = [];
  private readonly maxAllowed: number;

  constructor(private readonly numberOfPlayers: number) {
    // This will evolve if we support multiple rounds
    this.maxAllowed = this.numberOfPlayers;
  }

  make(move: Move) {
    if (this.isFull())
      throw new Error('ArgumentError: Maximum allowed moves exceeded');

    this.value.push(move);
  }

  proveMove(move: Move, secret: string) {
    this.value = this.value.map((_move) => {
      if (_move.hashedValue == move.hashedValue) {
        return move.prove(secret);
      }

      return _move;
    });

    return this;
  }

  public oneMoveLeft = () => this.remainingMovesLeft() === 1;

  public allMatch = (coinSide: CoinSide) =>
    this.value.every((move) => move.coinSide === coinSide);

  public allProven = () => this.value.every((move) => move.isProven());

  public playersWithCoinSide = (coinSide: CoinSide) =>
    this.value
      .filter((move) => move.coinSide == coinSide)
      .map((move) => move.player);

  public totalSizeOfSecrets = () =>
    this.value.reduce(
      (sizeSoFar, move) => sizeSoFar + move.secret()!.length,
      0
    );

  private remainingMovesLeft = () => this.maxAllowed - this.value.length;
  private isFull = () => this.maxAllowed == this.value.length;
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

  play(player: Player, coinSide: CoinSide, secret: string) {
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

    const move = new Move(player, coinSide, secret);

    this.moves.make(move);

    return move;
  }

  proveMove(move: Move, secret: string): Game {
    this.moves = this.moves.proveMove(move, secret);

    return this;
  }

  withResult(): Game {
    console.log('Moves ', this.moves);

    if (!this.moves.allProven())
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
