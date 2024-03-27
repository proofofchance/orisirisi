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

  isSupported = () => this.id in ChainID;
  isLocal = () => [ChainID.Local, ChainID.LocalAlt].includes(this.id);

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
        return 'ETH'; // TODO: Revert
    }
  };

  static fromChainID(chainId?: number) {
    if (!chainId) return this.defaultChain();

    return new Chain(chainId);
  }

  getName = () => Chain.nameFromChainId(this.id);

  equals = (chain: Chain) => this.id == chain.id;

  static nameFromChainId = (chainId: number) => {
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

  static fromName = (name: string | undefined | null) => {
    if (!name) return new Result(null, null);

    switch (name.toLowerCase()) {
      case 'ethereum':
        return new Result(new Chain(1), null);
      case 'polygon':
        return new Result(new Chain(137), null);
      case 'sepolia':
        return new Result(new Chain(11155111), null);
      case 'local':
      case 'localhost':
      case 'localalt':
        return new Result(new Chain(1337), null);

      default:
        return new Result(null, 'invalid_name' as const);
    }
  };

  static fromNetworkVersion = (networkVersion: string) => {
    return new Chain(Chain.maybeNormalizeLocalChainId(+networkVersion));
  };
  private static maybeNormalizeLocalChainId = (chainId: number) =>
    chainId === 31337 ? 1337 : chainId;

  static defaultChain = () => new Chain(ChainID.Local);
}

export class ChainExplorer {
  private static ETHERSCAN_BASE_URL = 'https://etherscan.io';
  private static SEPOLIA_ETHERSCAN_BASE_URL = 'https://sepolia.etherscan.io';
  private static POLYGONSCAN_BASE_URL = 'https://polygonscan.com';

  public static getTransactionLink(chainId: ChainID, transactionHash: string) {
    switch (chainId) {
      case ChainID.Local:
      case ChainID.LocalAlt:
      case ChainID.Ethereum:
        return `${ChainExplorer.ETHERSCAN_BASE_URL}/tx/${transactionHash}`;
      case ChainID.SepoliaTestNet:
        return `${ChainExplorer.SEPOLIA_ETHERSCAN_BASE_URL}/tx/${transactionHash}`;
      case ChainID.Polygon:
        return `${ChainExplorer.POLYGONSCAN_BASE_URL}/tx/${transactionHash}`;
    }
  }
}
