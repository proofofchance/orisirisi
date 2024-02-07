import { Result } from '@orisirisi/orisirisi-error-handling';

export enum ChainID {
  Ethereum = 1,
  Local = 31337,
  LocalAlt = 1337,
  Polygon = 137,
  SepoliaTestNet = 11155111,
}

export class Chain {
  private constructor(public readonly id: ChainID) {}

  isSupported = () => Chain.isSupportedId(this.id);
  static isSupportedId = (id: number) => id in ChainID;

  getCurrency = () => {
    switch (this.id) {
      case ChainID.Ethereum:
        return 'ETH';
      case ChainID.Local:
      case ChainID.LocalAlt:
        return 'LocalETH';
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
      case 1:
        return 'ethereum';
      case 137:
        return 'polygon';
      case 11155111:
        return 'sepolia';
      case 1337:
        return 'local';
    }

    throw new Error('Invalid Chain Id');
  };

  static fromShortName = (shortName: string | undefined | null) => {
    if (!shortName) return new Result(null, null);

    switch (shortName.toLowerCase()) {
      case 'ethereum':
        return new Result(new Chain(1), null);
      case 'polygon':
        return new Result(new Chain(137), null);
      case 'sepolia':
        return new Result(new Chain(11155111), null);
      case 'local':
      case 'localalt':
        return new Result(new Chain(1337), null);

      default:
        return new Result(null, 'invalid_short_name' as const);
    }
  };

  static fromNetworkVersion = (networkVersion: string) => {
    return new Chain(Chain.maybeNormalizeLocalChainId(+networkVersion));
  };
  private static maybeNormalizeLocalChainId = (chainId: number) =>
    chainId === 31337 ? 1337 : chainId;

  static defaultChain = () => new Chain(ChainID.Local);
}
