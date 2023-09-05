import { CoinSide } from './coin';

export interface CreateGameParams {
  wager: string;
  numberOfPlayers: string;
  expiry: string;
  coinSide: CoinSide;
}

export type CreateGameParamsKey = keyof CreateGameParams;

export const wagerParamKey: 'wager' = 'wager';
export const numberOfPlayersFieldParamKey: 'numberOfPlayers' =
  'numberOfPlayers';
