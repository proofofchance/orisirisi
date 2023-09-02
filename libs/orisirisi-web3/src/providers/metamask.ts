import { Result } from '@orisirisi/orisirisi-error-handling';
import { Web3Provider, Web3ProviderType } from './web3-provider';

export class MetamaskError {
  constructor(public notInstalled: boolean) {}

  static notInstalled = () => new MetamaskError(true);
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
