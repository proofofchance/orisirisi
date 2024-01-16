import { getRandomInteger } from '@orisirisi/orisirisi-data-utils';

export enum CoinSide {
  Head = 0,
  Tail = 1,
}

export function oppositeCoinSide(coinSide: CoinSide): CoinSide {
  switch (coinSide) {
    case CoinSide.Head:
      return CoinSide.Tail;

    case CoinSide.Tail:
      return CoinSide.Head;
  }
}

export function coinSideToString(coinSide: CoinSide | null): string | null {
  switch (coinSide) {
    case null:
      return null;

    case CoinSide.Head:
      return 'Head';

    case CoinSide.Tail:
      return 'Tail';
  }
}

export function totalCoinSides() {
  return Object.keys(CoinSide).length / 2;
}

export function getRandomCoinSide(): CoinSide {
  return getRandomInteger(1);
}

export class Coin {
  static flip = (entropy: number) => entropy % 2;
}
