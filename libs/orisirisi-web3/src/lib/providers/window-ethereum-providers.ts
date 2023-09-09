import { Eip1193Provider } from 'ethers';
import { Web3ProviderType } from './web3-provider-type';

export interface CoinbaseWalletProvider extends Eip1193Provider {
  isCoinbaseWallet: true;
  overrideIsMetaMask?: boolean;
  getChainId: () => number;
}

export interface MetaMaskProvider extends Eip1193Provider {
  isMetaMask: true;
  isConnected: () => boolean;
  networkVersion: string;
  on: (
    event: 'connect' | 'disconnect' | 'accountsChanged' | 'chainChanged',
    handler: (data: any) => void
  ) => void;
}

export interface WindowEthereumProvider
  extends Partial<CoinbaseWalletProvider>,
    Partial<MetaMaskProvider> {
  providerMap?: Map<
    Web3ProviderType,
    CoinbaseWalletProvider | MetaMaskProvider
  >;
}

declare global {
  interface Window {
    ethereum?: WindowEthereumProvider;
  }
}
