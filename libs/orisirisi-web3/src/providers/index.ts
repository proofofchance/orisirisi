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

declare global {
  interface Window {
    ethereum?: Eip1193Provider & { isMetaMask: boolean };
  }
}

export class Web3Provider {
  constructor(private provider: Eip1193Provider) {}

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

  static getWeb3Provider() {
    if (!this.isInstalled()) {
      return new Result(null, MetamaskError.notInstalled());
    }

    const web3Provider = new Web3Provider(window.ethereum!);

    return new Result(web3Provider, null);
  }

  static isInstalled() {
    return !!window.ethereum && this.isMetaMaskProvider();
  }

  private static isMetaMaskProvider() {
    return window.ethereum!.isMetaMask;
  }
}
