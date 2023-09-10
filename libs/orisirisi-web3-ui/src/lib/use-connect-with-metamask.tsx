import { Browser } from '@orisirisi/orisirisi-browser';
import {
  MetaMask,
  MetaMaskError,
  Web3Account,
} from '@orisirisi/orisirisi-web3';
import { Cache, useCache } from './use-cache';
import { useCurrentWeb3Account } from './use-current-web3-account';

export const handleMetaMaskConnectionEvents = (
  onAccountsChanged?: (addresses: string[]) => void
) => {
  const provider = MetaMask.getProvider()!;

  provider.on('accountsChanged', async (addresses: string[]) => {
    if (addresses.length === 0) {
      return handleWeb3ProviderDisconnected();
    }

    onAccountsChanged?.(addresses);
  });

  provider.on('connect', () => {
    if (!provider.isConnected()) {
      handleWeb3ProviderDisconnected();
    }
  });
  provider.on('disconnect', handleWeb3ProviderDisconnected);
  provider.on('chainChanged', handleWeb3ProviderDisconnected);
};

const handleWeb3ProviderDisconnected = () => {
  Cache.clear();
  Browser.reloadWindow();
};

export function useConnectWithMetaMask() {
  const { setCurrentWeb3Account } = useCurrentWeb3Account();
  const { cacheWeb3ProviderType } = useCache();

  const connectWithMetaMask = async () => {
    const { ok: provider, error: metaMaskError } =
      await MetaMask.getWeb3Provider();

    switch (metaMaskError) {
      case MetaMaskError.NotInstalled:
        return Browser.openInNewTab(MetaMask.downloadLink);
      case MetaMaskError.UnsupportedChain:
        // TODO: Show Unsupported Chain Toast Here
        console.log('Unsupported chain detected');
        return;
    }

    handleMetaMaskConnectionEvents((addresses) =>
      setCurrentWeb3Account(Web3Account.fromAddresses(addresses))
    );

    cacheWeb3ProviderType(MetaMask.type);
    const currentWeb3Account = await Web3Account.getCurrentAccount(
      MetaMask.type
    );

    await setCurrentWeb3Account(currentWeb3Account.ok!);
  };

  return connectWithMetaMask;
}
