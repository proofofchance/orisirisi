export * from './lib/coin';

export {
  Game as CoinflipGame,
  GameActivity as CoinflipGameActivity,
  formatUSD,
  type GameStatus as CoinflipGameStatus,
  type ConcludedGameStatus as CoinflipConcludedGameStatus,
  GamePlay as CoinflipGamePlay,
  type GamePlayStatus as CoinflipGamePlayStatus,
  GameWallet as CoinflipGameWallet,
} from './lib/games';

export {
  HTTPService as CoinflipHTTPService,
  HTTPServiceError as CoinflipHTTPServiceError,
  type HTTPServiceErrorType as CoinflipHTTPServiceErrorType,
  type FetchGamesParams as FetchCoinflipGamesParams,
  type FetchGameParams as FetchCoinflipGameParams,
  type FetchGameWalletParams as FetchCoinflipGameWalletParams,
  type UpdateMyGamePlayParams as UpdateMyCoinflipGamePlayParams,
} from './lib/http-service';

export const COINFLIP_INDEXING_RATE_MS = 16_000;
