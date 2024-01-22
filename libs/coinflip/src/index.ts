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
  ConcludedGameStatus as CoinflipConcludedGameStatus,
  GamePlay as CoinflipGamePlay,
  GamePlayStatus as CoinflipGamePlayStatus,
} from './lib/games';

export {
  HTTPService as CoinflipHTTPService,
  HTTPServiceError as CoinflipHTTPServiceError,
  HTTPServiceErrorType as CoinflipHTTPServiceErrorType,
  FetchGamesParams as FetchCoinflipGamesParams,
  FetchGameParams as FetchCoinflipGameParams,
  UpdateMyGamePlayParams as UpdateMyCoinflipGamePlayParams,
} from './lib/http-service';

export const COINFLIP_INDEX_GRACE_PERIOD = 8000;
