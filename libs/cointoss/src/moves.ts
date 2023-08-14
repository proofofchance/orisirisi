import { SHA256 } from 'crypto-js';
import { CoinSide } from './coin';
import { Player } from './';

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

export class Moves {
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
