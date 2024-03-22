export * from './lib/coin';

export {
  Game as CoinflipGame,
  PaginatedGames as CoinflipPaginatedGames,
  GameActivity as CoinflipGameActivity,
  formatCurrency,
  type GameStatus as CoinflipGameStatus,
  GameStatusEnum as CoinflipGameStatusEnum,
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

export const COINFLIP_INDEXING_RATE_MS = 24_000;
