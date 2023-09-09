import { MetaMask } from './meta-mask';
import { Web3ProviderType } from './web3-provider-type';
import {
  CoinbaseWalletProvider,
  MetaMaskProvider,
} from './window-ethereum-providers';

export class Web3Provider {
  private constructor(
    private readonly provider: MetaMaskProvider | CoinbaseWalletProvider,
    private readonly type: Web3ProviderType
  ) {}

  getChain() {
    switch (this.type) {
      case Web3ProviderType.MetaMask:
        return MetaMask.getChain(this.provider as MetaMaskProvider);
      default:
        throw new Error('Unsupported Web3ProviderType');
    }
  }

  static new(web3ProviderType: Web3ProviderType) {
    switch (web3ProviderType) {
      case Web3ProviderType.MetaMask:
        return new Web3Provider(MetaMask.getProvider()!, web3ProviderType);
      default:
        throw new Error('Unsupported Web3ProviderType');
    }
  }
}
