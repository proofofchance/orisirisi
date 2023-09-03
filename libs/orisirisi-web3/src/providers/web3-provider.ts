import { Eip1193Provider } from 'ethers';
import { Web3Account } from './web3-account';
import {
  Web3ProviderError,
  Web3ProviderErrorJson,
} from './web3-provider-error';
import { Result } from '@orisirisi/orisirisi-error-handling';
import { Chain } from '../chain';

export type Web3ProviderType = 'MetaMask' | 'WalletConnect';

interface ConnectInfo {
  chainId: string;
}

interface RawProvider extends Eip1193Provider {
  isMetaMask: boolean;
  isConnected: () => boolean;
  networkVersion: string;
  on: (event: string, handler: (data: any) => void) => void;
}

declare global {
  interface Window {
    ethereum?: RawProvider;
  }
}

export class Web3Provider {
  constructor(
    private readonly provider: RawProvider,
    public readonly type: Web3ProviderType
  ) {}

  getChain = () => Chain.fromNetworkVersion(this.provider.networkVersion);

  onAccountsChanged(onAccountsChanged: (accounts: string[]) => void) {
    this.provider.on('accountsChanged', onAccountsChanged);
  }

  listenToDisconnectAndRun(run: () => void) {
    this.onConnect(() => {
      if (!this.provider.isConnected()) {
        run();
      }
    });
    this.onDisconnect(run);
  }

  onConnect(onConnect: (connectInfo: ConnectInfo) => void) {
    this.provider.on('connect', onConnect);
  }

  onDisconnect(onDisconnect: (maybeProviderRpcError: any) => void) {
    this.provider.on('disconnect', onDisconnect);
  }

  listenToChainChangedAndRun(run: () => void) {
    this.onChainChanged(run);
  }

  onChainChanged(onChainChanged: (chainId: string) => void) {
    this.provider.on('chainChanged', onChainChanged);
  }

  async getCurrentAccount() {
    const { ok: addresses, error } = await this.getAccountAddresses();

    return new Web3Account(addresses, error);
  }

  async getAccountAddresses() {
    try {
      const addresses = await this.provider!.request({
        method: 'eth_requestAccounts',
      });

      return new Result(addresses, null);
    } catch (error: unknown) {
      return new Result(
        null,
        new Web3ProviderError(error as Web3ProviderErrorJson)
      );
    }
  }
}
