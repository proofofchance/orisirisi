import { atom, useAtom, useAtomValue } from 'jotai';
import { Web3Provider, Web3ProviderType } from '@orisirisi/orisirisi-web3';
import { Cache, CachedWeb3ProviderType, useCache } from './use-cache';
import { Browser } from '@orisirisi/orisirisi-browser';

const currentWeb3ProviderTypeAtom = atom<Web3ProviderType | null>(
  CachedWeb3ProviderType.get() || null
);
export function useCurrentWeb3ProviderType() {
  const { cacheExists, cachedWeb3ProviderType } = useCache();
  const [currentWeb3ProviderType, setCurrentWeb3ProviderType] = useAtom(
    currentWeb3ProviderTypeAtom
  );

  if (!currentWeb3ProviderType && cacheExists) {
    setCurrentWeb3ProviderType(cachedWeb3ProviderType);
  }

  return {
    currentWeb3ProviderType,
    setCurrentWeb3ProviderType,
  };
}

const currentWeb3ProviderAtom = atom<Web3Provider | null>((get) => {
  const currentWeb3ProviderType = get(currentWeb3ProviderTypeAtom);

  if (!currentWeb3ProviderType) return null;

  return Web3Provider.new(currentWeb3ProviderType);
});
export const useCurrentWeb3Provider = () =>
  useAtomValue(currentWeb3ProviderAtom);

const currentChainAtom = atom(
  async (get) => await get(currentWeb3ProviderAtom)?.getChain()
);
export const useCurrentChain = () => useAtomValue(currentChainAtom);

export function useDisconnectForUnsupportedChain() {
  const currentChain = useCurrentChain();

  if (currentChain && !currentChain!.isSupported()) {
    disconnect();
  }
}

export const disconnect = () => {
  Cache.clear();
  Browser.reloadWindow();
};
