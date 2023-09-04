import { CoinSide } from './coin';

export interface CreateGameParams {
  wager: string;
  numberOfPlayers: string;
  expiryTimestamp: string;
  coinSide: CoinSide;
}

export type CreateGameParamsField = keyof CreateGameParams;
