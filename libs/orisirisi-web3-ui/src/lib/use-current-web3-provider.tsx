import { atom, useAtom } from 'jotai';
import { Browser } from '@orisirisi/orisirisi-browser';
import { Web3Account, Web3Provider } from '@orisirisi/orisirisi-web3';
import { useCache } from './use-cache';

const currentWeb3ProviderAtom = atom<Web3Provider | null>(null);
const isWeb3ConnectedAtom = atom((get) => !!get(currentWeb3ProviderAtom));
const currentChainAtom = atom((get) =>
  get(currentWeb3ProviderAtom)?.getChain()
);
const currentWeb3AccountAtom = atom<Web3Account | null>(null);

export function useCurrentWeb3Account() {
  const [currentWeb3Account, setCurrentWeb3AccountValue] = useAtom(
    currentWeb3AccountAtom
  );

  return { currentWeb3Account, setCurrentWeb3AccountValue };
}

export function useIsWeb3Connected() {
  const [isWeb3Connected] = useAtom(isWeb3ConnectedAtom);

  return isWeb3Connected;
}

export function useCurrentChain() {
  const [currentChain] = useAtom(currentChainAtom);

  return currentChain;
}

export function useCurrentWeb3Provider() {
  const [currentWeb3Provider, setCurrentWeb3ProviderValue] = useAtom(
    currentWeb3ProviderAtom
  );

  const { currentWeb3Account, setCurrentWeb3AccountValue } =
    useCurrentWeb3Account();

  const {
    cacheExists,
    cachedWeb3Provider,
    cachedWeb3Account,
    cacheWeb3Provider,
    cacheWeb3Account,
    clearCache,
  } = useCache();

  const setWeb3ProviderForTheFirstTime = async (web3Provider: Web3Provider) => {
    setCurrentWeb3ProviderValue(web3Provider);
    cacheWeb3Provider(web3Provider.type);
    handleEvents(web3Provider);

    const currentWeb3Account = await web3Provider!.getCurrentAccount();
    cacheWeb3Account(currentWeb3Account.address);
    setCurrentWeb3AccountValue(currentWeb3Account);
  };

  const handleEvents = (web3Provider: Web3Provider | null) => {
    if (!web3Provider) return;

    const handleWeb3ProviderDisconnected = () => {
      clearCache();
      Browser.reloadWindow();
    };

    web3Provider.onAccountsChanged((addresses: string[]) => {
      if (addresses.length === 0) {
        return handleWeb3ProviderDisconnected();
      }

      const currentWeb3Account = Web3Account.fromAddresses(addresses);

      cacheWeb3Account(currentWeb3Account.address);
      setCurrentWeb3AccountValue(currentWeb3Account);
    });

    web3Provider.listenToDisconnectAndRun(handleWeb3ProviderDisconnected);
    web3Provider.listenToChainChangedAndRun(handleWeb3ProviderDisconnected);
  };

  if (!currentWeb3Provider && cacheExists) {
    setCurrentWeb3ProviderValue(cachedWeb3Provider);
    handleEvents(cachedWeb3Provider);
  }

  if (!currentWeb3Account && cacheExists) {
    setCurrentWeb3AccountValue(cachedWeb3Account);
  }

  return {
    currentWeb3Provider,
    setWeb3ProviderForTheFirstTime,
  };
}
