import { Result } from '@orisirisi/orisirisi-error-handling';
import { Web3ProviderType } from './web3-provider-type';
import { Chain } from '@orisirisi/orisirisi-web3-chains';
import { MetaMaskProvider } from './window-ethereum-providers';
import { Maybe } from '@orisirisi/orisirisi-data-utils';

export enum MetaMaskError {
  NotInstalled = 0,
  UnsupportedChain = 1,
  Generic,
  UserReject = 4001,
  Unauthorized = 4100,
  UnsupportedMethod = 4200,
  Disconnected = 4900,
  ChainDisconnected = 4901,
}

interface ConnectInfo {
  chainId: string;
}

export class MetaMask {
  static downloadLink = 'https://metamask.io/download/';
  static type = Web3ProviderType.MetaMask;

  static getWeb3Provider() {
    const provider = this.getProvider();

    if (!provider) return new Result(null, MetaMaskError.NotInstalled);

    if (!this.getChain(provider)!.isSupported())
      return new Result(null, MetaMaskError.UnsupportedChain);

    return new Result(provider, null);
  }

  static getProvider() {
    return (
      this.getWhenInstalledAlone() || this.getWhenInstalledWithOtherProviders()
    );
  }

  static getChain(provider: MetaMaskProvider) {
    return Chain.fromNetworkVersion(provider.networkVersion);
  }

  private static getWhenInstalledAlone() {
    const maybeMetamask = window.ethereum;

    if (maybeMetamask?.isMetaMask && !maybeMetamask.overrideIsMetaMask)
      return maybeMetamask as MetaMaskProvider;

    return null;
  }

  private static getWhenInstalledWithOtherProviders() {
    const maybeMetamask = window.ethereum?.providerMap?.get(
      Web3ProviderType.MetaMask
    ) as Maybe<MetaMaskProvider>;

    if (maybeMetamask?.isMetaMask) return maybeMetamask;

    return null;
  }
}
