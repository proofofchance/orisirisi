import { Browser } from '@orisirisi/orisirisi-browser';
import { Web3Account, Web3Provider } from '@orisirisi/orisirisi-web3';
import { atom, useAtom } from 'jotai';

const currentWeb3ProviderAtom = atom<Web3Provider | null>(null);
const currentWeb3AccountAtom = atom<Web3Account | null>(null);

export function useCurrentWeb3Account() {
  const [currentWeb3Account, setCurrentWeb3Account] = useAtom(
    currentWeb3AccountAtom
  );

  return { currentWeb3Account, setCurrentWeb3Account };
}
export function useCurrentWeb3Provider() {
  const [currentWeb3Provider, setCurrentWeb3ProviderAtom] = useAtom(
    currentWeb3ProviderAtom
  );

  const { setCurrentWeb3Account } = useCurrentWeb3Account();

  const setCurrentWeb3Provider = async (web3Provider: Web3Provider) => {
    setCurrentWeb3ProviderAtom(web3Provider);
    const currentWeb3Account = await web3Provider!.getCurrentAccount();

    setCurrentWeb3Account(currentWeb3Account);

    web3Provider.onAccountsChanged((addresses: string[]) => {
      if (addresses.length === 0) {
        return Browser.reloadWindow();
      }

      const currentWeb3Account = Web3Account.fromAddresses(addresses);

      setCurrentWeb3Account(currentWeb3Account);
    });

    web3Provider.listenToDisconnectAndReloadWindow();
    web3Provider.listenToChainChangedAndReloadWindow();
  };

  return {
    currentWeb3Provider,
    setCurrentWeb3Provider,
  };
}
