import { SHA256 } from 'crypto-js';
import { CoinSide } from './coin';
import { Player } from './';

/** Coinflip Move Crypto */
class Crypto {
  static getRandomString(): string {
    const array = new Uint8Array(24);
    return window!.crypto.getRandomValues(array).toString();
  }
}
export class Move {
  public revealedSecret: string | null = null;
  private revealableSecret: string;
  public readonly hashedValue: string;

  constructor(
    public readonly player: Player,
    public readonly coinSide: CoinSide
  ) {
    // TODO: Update to be input from user
    this.revealableSecret = Crypto.getRandomString();

    this.hashedValue = Move.hash(this.revealableSecret, coinSide);
  }

  reveal(): Move {
    this.revealedSecret = this.revealableSecret;

    return this;
  }

  secret = () => this.revealedSecret;

  secret_size = () =>
    this.revealedSecret!.split('').reduce(
      (size, secret_char) => size + secret_char.charCodeAt(0),
      0
    );

  isRevealed = () => !!this.revealedSecret;

  private static hash = (secret: string, coinSide: CoinSide) =>
    SHA256(secret + coinSide).toString();
}

export class Moves {
  private value: Move[] = [];

  constructor(private readonly maxAllowed: number) {}

  make(move: Move) {
    if (this.isFull())
      throw new Error('ArgumentError: Maximum allowed moves exceeded');

    this.value.push(move);
  }

  revealMove(move: Move) {
    this.value = this.value.map((_move) => {
      if (_move.hashedValue == move.hashedValue) {
        return move.reveal();
      }

      return _move;
    });

    return this;
  }

  public oneMoveLeft = () => this.remainingMovesLeft() === 1;

  public allMatch = (coinSide: CoinSide) =>
    this.value.every((move) => move.coinSide === coinSide);

  public allRevelead = () => this.value.every((move) => move.isRevealed());

  public playersWithCoinSide = (coinSide: CoinSide) =>
    this.value
      .filter((move) => move.coinSide == coinSide)
      .map((move) => move.player);

  public totalSizeOfSecrets = () =>
    this.value.reduce((sizeSoFar, move) => sizeSoFar + move.secret_size(), 0);

  private remainingMovesLeft = () => this.maxAllowed - this.value.length;
  private isFull = () => this.maxAllowed == this.value.length;
}
