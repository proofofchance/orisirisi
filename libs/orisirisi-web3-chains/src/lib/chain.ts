export enum ChainID {
  // Arbitrum = 42161,
  // Avalanche = 43114,
  // BNB = 56,
  Ethereum = 1,
  Local = 31337,
  LocalAlt = 1337,
  // Optimism = 10,
  Polygon = 137,
  // SepoliaTestNet = 11155111,
}

export class Chain {
  private constructor(public readonly id: ChainID) {}

  isSupported = () => this.id in ChainID;

  getCurrency = () => {
    switch (this.id) {
      // case ChainID.Arbitrum:
      //   return 'ARB';
      // case ChainID.Avalanche:
      //   return 'AVAX';
      // case ChainID.BNB:
      //   return 'BNB';
      case ChainID.Ethereum:
        return 'ETH';
      case ChainID.Local:
      case ChainID.LocalAlt:
        return 'LocalETH';
      // case ChainID.Optimism:
      //   return 'OP';
      case ChainID.Polygon:
        return 'MATIC';
      // case ChainID.SepoliaTestNet:
      //   return 'SepoliaETH';
    }
  };

  static fromChainID(chainId?: number) {
    if (!chainId) return this.defaultChain();

    return new Chain(chainId);
  }

  static fromNetworkVersion = (networkVersion: string) =>
    new Chain(+networkVersion);

  static defaultChain = () => new Chain(ChainID.Local);
}
