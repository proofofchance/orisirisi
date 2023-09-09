import { Browser } from '@orisirisi/orisirisi-browser';
import {
  Web3Account,
  MetaMask,
  MetaMaskProvider,
  MetaMaskError,
} from '@orisirisi/orisirisi-web3';
import { useCache } from './use-cache';
import { useCurrentWeb3Account } from './use-current-web3-account';

export function useConnectWithMetaMask() {
  const { setCurrentWeb3Account } = useCurrentWeb3Account();

  const { cacheWeb3ProviderType, cacheWeb3AccountAddress, clearCache } =
    useCache();

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

    cacheWeb3ProviderType(MetaMask.type);
    handleEvents(provider!);

    const currentWeb3Account = await Web3Account.getCurrentAccount(provider!);
    cacheWeb3AccountAddress(currentWeb3Account.address);
    setCurrentWeb3Account(currentWeb3Account);
  };

  const handleEvents = (provider: MetaMaskProvider) => {
    const handleWeb3ProviderDisconnected = () => {
      clearCache();
      Browser.reloadWindow();
    };

    provider.on('accountsChanged', (addresses: string[]) => {
      if (addresses.length === 0) {
        return handleWeb3ProviderDisconnected();
      }

      const currentWeb3Account = Web3Account.fromAddresses(addresses);

      cacheWeb3AccountAddress(currentWeb3Account.address);
      setCurrentWeb3Account(currentWeb3Account);
    });

    provider.on('connect', () => {
      if (!provider.isConnected()) {
        handleWeb3ProviderDisconnected();
      }
    });
    provider.on('disconnect', handleWeb3ProviderDisconnected);
    provider.on('chainChanged', handleWeb3ProviderDisconnected);
  };

  return connectWithMetaMask;
}
