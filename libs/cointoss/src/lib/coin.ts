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

export function coinSideToString(coinSide: CoinSide): string {
  switch (coinSide) {
    case CoinSide.Head:
      return 'Head';

    case CoinSide.Tail:
      return 'Tail';
  }
}

export function totalCoinSides(): number {
  return Object.keys(CoinSide).length;
}
