import { Browser } from '@orisirisi/orisirisi-browser';
import {
  MetaMask,
  MetaMaskError,
  Web3Account,
} from '@orisirisi/orisirisi-web3';
import { useCache } from './use-cache';
import { useCurrentWeb3Account } from './use-current-web3-account';
import {
  handleWeb3ProviderDisconnected,
  useCurrentWeb3ProviderType,
} from './use-current-web3-provider';

export function useConnectWithMetaMask() {
  const { setCurrentWeb3Account } = useCurrentWeb3Account();
  const { setCurrentWeb3ProviderType } = useCurrentWeb3ProviderType();
  const { cacheWeb3ProviderType } = useCache();

  const connectWithMetaMask = async () => {
    const { error: metaMaskError } = MetaMask.getWeb3Provider();

    switch (metaMaskError) {
      case MetaMaskError.NotInstalled:
        return Browser.openInNewTab(MetaMask.downloadLink);
      case MetaMaskError.UnAvailable:
        console.log('MetaMask is loading. Show a toast feedback to try again');
        return;
      case MetaMaskError.UnsupportedChain:
        // TODO: Show Unsupported Chain Toast Here
        console.log('Unsupported chain detected');
        return;
    }

    MetaMask.handleConnectionEvents(
      handleWeb3ProviderDisconnected,
      (addresses) =>
        setCurrentWeb3Account(
          Web3Account.fromAddresses(addresses, MetaMask.type)
        )
    );

    setCurrentWeb3ProviderType(MetaMask.type);
    cacheWeb3ProviderType(MetaMask.type);
    const currentWeb3Account = await Web3Account.getCurrentAccount(
      MetaMask.type
    );

    await setCurrentWeb3Account(currentWeb3Account.ok!);
  };

  return connectWithMetaMask;
}
