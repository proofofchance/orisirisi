import { Result } from '@orisirisi/orisirisi-error-handling';
import { Web3ProviderType } from './web3-provider-type';
import { Chain } from '@orisirisi/orisirisi-web3-chains';
import { MetaMaskProvider } from './window-ethereum-providers';
import { Maybe } from '@orisirisi/orisirisi-data-utils';

export enum MetaMaskError {
  NotInstalled = 0,
  UnsupportedChain = 1,
  // THis error happens when MetaMask is loading while doing some work
  // and therefore unavailable for web client Proxy gets
  UnAvailable = 2,
  Generic,
  UserReject = 4001,
  Unauthorized = 4100,
  UnsupportedMethod = 4200,
  Disconnected = 4900,
  ChainDisconnected = 4901,
}

export class MetaMask {
  static downloadLink = 'https://metamask.io/download/';
  static type = Web3ProviderType.MetaMask;

  static async getWeb3Provider() {
    const provider = this.getProvider();

    if (!provider) return new Result(null, MetaMaskError.NotInstalled);

    const { ok: chain, error } = await this.getChain(provider);

    if (error) return new Result(null, error);

    if (!chain!.isSupported())
      return new Result(null, MetaMaskError.UnsupportedChain);

    return new Result(provider, null);
  }

  static getProvider() {
    return (
      this.getWhenInstalledAlone() || this.getWhenInstalledWithOtherProviders()
    );
  }

  static async getChain(provider: MetaMaskProvider) {
    const networkVersion = await provider.request({ method: 'net_version' });
    if (!networkVersion) return new Result(null, MetaMaskError.UnAvailable);

    return new Result(Chain.fromNetworkVersion(networkVersion), null);
  }

  static handleConnectionEvents = (
    onDisconnected: () => void,
    onAccountsChanged?: (addresses: string[]) => void
  ) => {
    const provider = MetaMask.getProvider()!;

    provider.on('accountsChanged', async (addresses: string[]) => {
      if (addresses.length === 0) {
        return onDisconnected();
      }

      onAccountsChanged?.(addresses);
    });

    provider.on('connect', () => {
      if (!provider.isConnected()) {
        onDisconnected();
      }
    });
    provider.on('disconnect', onDisconnected);
    provider.on('chainChanged', onDisconnected);
  };

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
