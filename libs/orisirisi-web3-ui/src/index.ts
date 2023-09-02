import { Browser, BrowserStorage } from '@orisirisi/orisirisi-browser';
import {
  MetaMask,
  Web3Account,
  Web3Provider,
  Web3ProviderType,
} from '@orisirisi/orisirisi-web3';
import { atom, useAtom } from 'jotai';

class CachedWeb3Provider {
  private static key = 'PREVIOUSLY_USED_WEB3_PROVIDER_TYPE_KEY';

  static setType(providerType: Web3ProviderType) {
    BrowserStorage.set(CachedWeb3Provider.key, providerType);
  }

  private static getType() {
    return BrowserStorage.get(this.key);
  }

  static get() {
    const { ok: previouslyUsedWeb3ProviderType } = this.getType();

    return MetaMask.match(previouslyUsedWeb3ProviderType)
      ? MetaMask.getWeb3Provider().ok
      : null;
  }

  static clear() {
    BrowserStorage.clear(CachedWeb3Provider.key);
  }
}

class CachedWeb3Account {
  private static key = 'PREVIOUSLY_USED_WEB3_ACCOUNT_ADDRESS';

  static setAddress(address: string) {
    BrowserStorage.set(this.key, address);
  }

  private static getAddress() {
    return BrowserStorage.get(this.key);
  }

  static get() {
    const { ok: previouslyUsedWeb3AccountAddress } = this.getAddress();

    return Web3Account.fromAddress(previouslyUsedWeb3AccountAddress);
  }

  static clear() {
    BrowserStorage.clear(this.key);
  }
}

function useCache() {
  const cacheWeb3Provider = (providerType: Web3ProviderType) =>
    CachedWeb3Provider.setType(providerType);

  const cacheWeb3Account = (address: string | null) =>
    address && CachedWeb3Account.setAddress(address);

  const clearCache = () => {
    CachedWeb3Provider.clear();
    CachedWeb3Account.clear();
  };

  const cachedWeb3Provider = CachedWeb3Provider.get();
  const cachedWeb3Account = CachedWeb3Account.get();

  return {
    cacheExists: cachedWeb3Provider && cachedWeb3Account,
    cachedWeb3Provider,
    cachedWeb3Account,
    cacheWeb3Provider,
    cacheWeb3Account,
    clearCache,
  };
}

const currentWeb3ProviderAtom = atom<Web3Provider | null>(null);
const currentWeb3AccountAtom = atom<Web3Account | null>(null);

export function useCurrentWeb3Account() {
  const [currentWeb3Account, setCurrentWeb3AccountValue] = useAtom(
    currentWeb3AccountAtom
  );

  return { currentWeb3Account, setCurrentWeb3AccountValue };
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
