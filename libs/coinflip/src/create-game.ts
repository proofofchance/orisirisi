import { CoinSide } from './coin';

export interface CreateGameParams {
  wager: string;
  numberOfPlayers: string;
  expiryTimestamp: string;
  coinSide: CoinSide;
}

export type CreateGameParamsKey = keyof CreateGameParams;

export const wagerParamKey: CreateGameParamsKey = 'wager';
export const numberOfPlayersFieldParamKey: CreateGameParamsKey =
  'numberOfPlayers';
