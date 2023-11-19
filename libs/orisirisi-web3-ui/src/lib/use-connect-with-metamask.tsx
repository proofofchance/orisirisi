import { Browser } from '@orisirisi/orisirisi-browser';
import {
  MetaMask,
  MetaMaskError,
  Web3Account,
  Web3ProviderErrorCode,
} from '@orisirisi/orisirisi-web3';
import { useCache } from './use-cache';
import { useCurrentWeb3Account } from './use-current-web3-account';
import {
  handleWeb3ProviderDisconnected,
  useCurrentWeb3ProviderType,
} from './use-current-web3-provider';
import toast from 'react-hot-toast';

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
        return toast.error(
          'Something went wrong. Please try again in some minutes.',
          {
            position: 'bottom-right',
          }
        );
      case MetaMaskError.UnsupportedChain:
        return toast.error(
          'Unsupported network. Please connect with a supported network like Ethereum, Polygon, ...',
          {
            position: 'bottom-right',
          }
        );
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
    const { ok: currentWeb3Account, error } =
      await Web3Account.getCurrentAccount(MetaMask.type);

    if (error) {
      switch (error.code) {
        case Web3ProviderErrorCode.UserRejected:
          return toast.error(
            'Could not connect to Metamask because you have rejected!',
            {
              position: 'bottom-right',
            }
          );
        default:
          return;
      }
    }

    return await setCurrentWeb3Account(currentWeb3Account!);
  };

  return connectWithMetaMask;
}
