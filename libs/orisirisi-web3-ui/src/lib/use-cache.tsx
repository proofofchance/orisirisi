import { BrowserStorage } from '@orisirisi/orisirisi-browser';
import { Web3ProviderType } from '@orisirisi/orisirisi-web3';

export class CachedWeb3ProviderType {
  private static key = 'ORISIRISI_CACHED_WEB3_PROVIDER_TYPE_KEY';

  static set(providerType: Web3ProviderType) {
    BrowserStorage.set(this.key, providerType);
  }

  static get() {
    return BrowserStorage.get<Web3ProviderType>(this.key).ok;
  }

  static clear() {
    BrowserStorage.clear(this.key);
  }
}

class CachedWeb3AccountAddress {
  private static key = 'ORISIRISI_CACHED_WEB3_ACCOUNT_ADDRESS';

  static set(address: string) {
    BrowserStorage.set(this.key, address);
  }

  static get() {
    return BrowserStorage.get(this.key).ok;
  }

  static clear() {
    BrowserStorage.clear(this.key);
  }
}

export class Cache {
  static clear() {
    CachedWeb3ProviderType.clear();
    CachedWeb3AccountAddress.clear();
  }
}

export function useCache() {
  const cacheWeb3ProviderType = (providerType: Web3ProviderType) =>
    CachedWeb3ProviderType.set(providerType);

  const cacheWeb3AccountAddress = (address: string | null) =>
    address && CachedWeb3AccountAddress.set(address);

  const cachedWeb3ProviderType = CachedWeb3ProviderType.get();
  const cachedWeb3AccountAddress = CachedWeb3AccountAddress.get();

  return {
    cacheExists: cachedWeb3ProviderType && cachedWeb3AccountAddress,
    cachedWeb3ProviderType,
    cachedWeb3AccountAddress,
    cacheWeb3ProviderType,
    cacheWeb3AccountAddress,
    clearCache: Cache.clear,
  };
}
