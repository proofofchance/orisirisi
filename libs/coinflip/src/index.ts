export * from './lib/coin';

export enum Chain {
  Ethereum = 1,
  Polygon = 137,
  BnbSmartChain = 56,
  BnbTestNet = 97,
  SepoliaTestNet = 11155111,
}

export {
  Game as CoinflipGame,
  GameActivity as CoinflipGameActivity,
  formatUSD,
  GameStatus as CoinflipGameStatus,
} from './lib/games';

export {
  Repo as CoinflipRepo,
  RepoError as CoinflipRepoError,
  RepoErrorType as CoinflipRepoErrorType,
  FetchGamesParams as FetchCoinflipGamesParams,
  FetchGameParams as FetchCoinflipGameParams,
  UpdateMyGamePlayParams as UpdateMyCoinflipGamePlayParams,
} from './lib/repo';

export const COINFLIP_INDEX_GRACE_PERIOD = 8000;
