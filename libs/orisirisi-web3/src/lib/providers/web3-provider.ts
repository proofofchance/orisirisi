import { BrowserProvider } from 'ethers';
import { MetaMask } from './meta-mask';
import { Web3ProviderType } from './web3-provider-type';
import {
  CoinbaseWalletProvider,
  MetaMaskProvider,
} from './window-ethereum-providers';

/** Raw Error from MetaMask, CoinbaseWallet and WalletConnect */
interface Web3ProviderRawError {
  info: { error: Web3ProviderError };
}

export enum Web3ProviderErrorCode {
  UserRejected = 4001,
  Unauthorized = 4100,
  UnsupportedMethod = 4200,
  Disconnected = 4900,
  ChainDisconnected = 4901,
}

export class Web3ProviderError {
  constructor(public code: Web3ProviderErrorCode, public message: string) {}

  static from = (e: unknown) => {
    const error = e as Web3ProviderRawError;

    return error.info.error;
  };
}

export class Web3Provider {
  private constructor(
    private readonly provider: MetaMaskProvider | CoinbaseWalletProvider,
    public readonly type: Web3ProviderType
  ) {}

  toBrowserProvider() {
    return new BrowserProvider(this.provider);
  }

  isConnected() {
    switch (this.type) {
      case Web3ProviderType.MetaMask:
        return (this.provider as MetaMaskProvider).isConnected();
      default:
        throw 'Unsupported Web3ProviderType';
    }
  }

  getChain() {
    switch (this.type) {
      case Web3ProviderType.MetaMask:
        return MetaMask.getChain(this.provider as MetaMaskProvider).ok;
      default:
        throw 'Unsupported Web3ProviderType';
    }
  }

  static new(web3ProviderType: Web3ProviderType) {
    switch (web3ProviderType) {
      case Web3ProviderType.MetaMask:
        return new Web3Provider(MetaMask.getProvider()!, web3ProviderType);
      default:
        throw 'Unsupported Web3ProviderType';
    }
  }
}
