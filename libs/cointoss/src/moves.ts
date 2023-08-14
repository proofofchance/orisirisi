import { SHA256 } from 'crypto-js';
import { CoinSide } from './coin';
import { Player } from './';

export class Move {
  public revealedSecret: string | null = null;
  private revealableSecret: string;
  public readonly hashedValue: string;

  constructor(
    public readonly player: Player,
    public readonly coinSide: CoinSide
  ) {
    this.revealableSecret =
      'to be computed using Systems random generator. e.g https://developer.mozilla.org/en-US/docs/Web/API/Crypto/getRandomValues for web browsers, + DateTime in User timezone + public address of player + coinSide';

    this.hashedValue = Move.hash(this.revealableSecret, coinSide);
  }

  reveal(): Move {
    this.revealedSecret = this.revealableSecret;

    return this;
  }

  secret = () => this.revealedSecret;

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
    this.value.reduce(
      (sizeSoFar, move) => sizeSoFar + move.secret()!.length,
      0
    );

  private remainingMovesLeft = () => this.maxAllowed - this.value.length;
  private isFull = () => this.maxAllowed == this.value.length;
}
