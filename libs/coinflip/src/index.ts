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
  formatGameWagerUSD,
  getGameExpiryCountdown,
  Games as CoinflipGames,
  GameStatus as CoinflipGameStatus,
  FetchGamesParams as FetchCoinflipGamesParams,
} from './lib/games';
