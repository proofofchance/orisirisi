/* eslint-disable @typescript-eslint/no-explicit-any */
import { mustBeMutuallyExclusive } from '@orisirisi/orisirisi-data-utils';
import { Result } from '@orisirisi/orisirisi-error-handling';
import { Eip1193Provider } from 'ethers';

export class Web3Account {
  public address: string | null = null;

  constructor(
    addresses: string[] | null,
    public error: Web3ProviderError | null
  ) {
    mustBeMutuallyExclusive(addresses, error);

    if (addresses) {
      this.address = Web3Account.pickCurrentAccountAddress(addresses);
    }
  }

  isWithoutError = () => !this.hasError();
  hasError = () => !!this.error;
  isEmpty = () => this.address === null;

  static fromAddress(address: string | null) {
    if (!address) return null;

    return Web3Account.fromAddresses([address]);
  }

  static fromAddresses(addresses: string[]) {
    return new Web3Account(addresses, null);
  }

  private static pickCurrentAccountAddress = (addresses: string[]) =>
    addresses[0];
}
export class MetamaskError {
  constructor(public notInstalled: boolean) {}

  static notInstalled = () => new MetamaskError(true);
}

interface Web3ProviderErrorJson {
  code: number;
  message: string;
}
class Web3ProviderError {
  private code: number;
  public message: string;

  constructor({ code, message }: Web3ProviderErrorJson) {
    this.code = code;
    this.message = message;
  }

  isUserRejectedError = () => this.code === 4001;
  isUnauthorizedError = () => this.code === 4100;
  isUnsupportedMethodError = () => this.code === 4200;
  isDisconnectedError = () => this.code === 4900;
  isChainDisconnectedError = () => this.code === 4901;
}

interface ConnectInfo {
  chainId: string;
}

interface RawProvider extends Eip1193Provider {
  isMetaMask: boolean;
  isConnected: () => boolean;
  on: (event: string, handler: (data: any) => void) => void;
}

declare global {
  interface Window {
    ethereum?: RawProvider;
  }
}

export type Web3ProviderType = 'MetaMask' | 'WalletConnect';
export class Web3Provider {
  constructor(private provider: RawProvider, public type: Web3ProviderType) {}

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
      const accounts = await this.provider!.request({
        method: 'eth_requestAccounts',
      });
      return new Result(accounts, null);
    } catch (error: unknown) {
      return new Result(
        null,
        new Web3ProviderError(error as Web3ProviderErrorJson)
      );
    }
  }
}

export class MetaMask {
  static downloadLink = 'https://metamask.io/download/';
  static providerType: Web3ProviderType = 'MetaMask';

  static getWeb3Provider() {
    if (!this.isInstalled()) {
      return new Result(null, MetamaskError.notInstalled());
    }

    const web3Provider = new Web3Provider(window.ethereum!, this.providerType);

    return new Result(web3Provider, null);
  }

  static match = (providerType: Web3ProviderType) =>
    providerType == this.providerType;

  static isInstalled() {
    return !!window.ethereum && this.isMetaMaskProvider();
  }

  private static isMetaMaskProvider() {
    return window.ethereum!.isMetaMask;
  }
}
