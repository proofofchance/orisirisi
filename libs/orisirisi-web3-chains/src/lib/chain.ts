import { Result } from '@orisirisi/orisirisi-error-handling';

export enum ChainID {
  // Arbitrum = 42161,
  // Avalanche = 43114,
  BNB = 56,
  // Ethereum = 1,
  Local = 31337,
  LocalAlt = 1337,
  // Optimism = 10,
  Polygon = 137,
  SepoliaTestNet = 11155111,
}

export class Chain {
  private constructor(public readonly id: ChainID) {}

  isSupported = () => Chain.isSupportedId(this.id);
  static isSupportedId = (id: number) => id in ChainID;

  getCurrency = () => {
    switch (this.id) {
      // case ChainID.Arbitrum:
      //   return 'ARB';
      // case ChainID.Avalanche:
      //   return 'AVAX';
      case ChainID.BNB:
        return 'BNB';
      // case ChainID.Ethereum:
      // return 'ETH';
      case ChainID.Local:
      case ChainID.LocalAlt:
        return 'LocalETH';
      // case ChainID.Optimism:
      //   return 'OP';
      case ChainID.Polygon:
        return 'MATIC';
      case ChainID.SepoliaTestNet:
        return 'SepoliaETH';
    }
  };

  static fromChainID(chainId?: number) {
    if (!chainId) return this.defaultChain();

    return new Chain(chainId);
  }

  getShortName = () => Chain.shortNameFromChainId(this.id);

  static shortNameFromChainId = (chainId: number) => {
    switch (chainId) {
      case 56:
        return 'binance';
      case 1337:
        return 'local';
      case 137:
        return 'polygon';
      case 11155111:
        return 'sepolia';
    }

    throw new Error('Invalid Chain Id');
  };

  static fromShortName = (shortName: string | undefined | null) => {
    if (!shortName) return new Result(null, null);

    switch (shortName.toLowerCase()) {
      case 'binance':
        return new Result(new Chain(56), null);
      case 'local':
      case 'localalt':
        return new Result(new Chain(1337), null);
      case 'polygon':
        return new Result(new Chain(137), null);
      case 'sepolia':
        return new Result(new Chain(11155111), null);
      default:
        return new Result(null, 'invalid_short_name' as const);
    }
  };

  static fromNetworkVersion = (networkVersion: string) =>
    new Chain(+networkVersion);

  static defaultChain = () => new Chain(ChainID.Local);
}
