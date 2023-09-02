import { BrowserStorage } from '@orisirisi/orisirisi-browser';
import {
  MetaMask,
  Web3Account,
  Web3ProviderType,
} from '@orisirisi/orisirisi-web3';

class CachedWeb3Provider {
  private static key = 'CACHED_WEB3_PROVIDER_TYPE_KEY';

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
  private static key = 'CACHED_WEB3_ACCOUNT_ADDRESS';

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

export function useCache() {
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
