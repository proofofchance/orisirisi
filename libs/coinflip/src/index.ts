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
  formatUSD,
  GameStatus as CoinflipGameStatus,
} from './lib/games';

export {
  Repo as CoinflipRepo,
  FetchGamesParams as FetchCoinflipGamesParams,
} from './lib/repo';
