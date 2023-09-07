export enum ChainID {
  Arbitrum = 42161,
  Avalanche = 43114,
  BNB = 56,
  Ethereum = 1,
  Localhost = 5777,
  Optimism = 10,
  Polygon = 137,
  SepoliaTestNet = 11155111,
}

export class Chain {
  private constructor(public readonly id: ChainID) {}

  isSupported = () => this.id in ChainID;

  getCurrency = () => {
    switch (this.id) {
      case ChainID.Arbitrum:
        return 'ARB';
      case ChainID.Avalanche:
        return 'AVAX';
      case ChainID.BNB:
        return 'BNB';
      case ChainID.Ethereum:
      case ChainID.Localhost:
        return 'ETH';
      case ChainID.Optimism:
        return 'OP';
      case ChainID.Polygon:
        return 'MATIC';
      case ChainID.SepoliaTestNet:
        return 'SepoliaETH';
    }
  };

  static fromNetworkVersion = (networkVersion: string) =>
    new Chain(+networkVersion);
}
