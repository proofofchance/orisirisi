import { Web3Account } from '@orisirisi/orisirisi-web3';
import { atom, useAtom } from 'jotai';
import { useCache } from './use-cache';

const currentWeb3AccountAtom = atom<Web3Account | null>(null);
const isWeb3AccountConnectedAtom = atom((get) => !!get(currentWeb3AccountAtom));

export function useCurrentWeb3Account() {
  const { cacheExists, cachedWeb3AccountAddress } = useCache();
  const [currentWeb3Account, setCurrentWeb3Account] = useAtom(
    currentWeb3AccountAtom
  );

  if (!currentWeb3Account && cacheExists) {
    const cachedWeb3Account = Web3Account.fromAddress(cachedWeb3AccountAddress);

    setCurrentWeb3Account(cachedWeb3Account);
  }

  return { currentWeb3Account, setCurrentWeb3Account };
}

export function useIsWeb3AccountConnected() {
  const [isWeb3AccountConnected] = useAtom(isWeb3AccountConnectedAtom);
  return isWeb3AccountConnected;
}
