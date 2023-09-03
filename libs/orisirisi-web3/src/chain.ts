export enum ChainID {
  Arbitrum = 42161,
  Avalanche = 43114,
  BNB = 56,
  Ethereum = 1,
  Optimism = 10,
  Polygon = 137,
  SepoliaTestNet = 11155111,
}

export class Chain {
  private constructor(public readonly id: ChainID) {}

  isSupported = () => this.id in ChainID;

  static fromNetworkVersion = (networkVersion: string) =>
    new Chain(+networkVersion);

  static getAll = () => [];
}
