import {
  MetaMask,
  Web3Account,
  Web3ProviderType,
} from '@orisirisi/orisirisi-web3';
import { atom, useAtom, useAtomValue } from 'jotai';
import { CachedWeb3ProviderType, useCache } from './use-cache';
import { handleWeb3ProviderDisconnected } from './use-current-web3-provider';

const currentWeb3AccountAtom = atom<Web3Account | null>(null);

export function useCurrentWeb3Account() {
  const { cacheExists, cachedWeb3AccountAddress, cacheWeb3AccountAddress } =
    useCache();
  const [currentWeb3Account, setCurrentWeb3AccountValue] = useAtom(
    currentWeb3AccountAtom
  );

  const setCurrentWeb3Account = async (account: Web3Account) => {
    setCurrentWeb3AccountValue(account);
    cacheWeb3AccountAddress(account.address);
  };

  const handleWeb3ProviderEvents = () => {
    switch (CachedWeb3ProviderType.get()) {
      case null:
        break;
      case Web3ProviderType.MetaMask:
        return MetaMask.handleConnectionEvents(
          handleWeb3ProviderDisconnected,
          (addresses) =>
            setCurrentWeb3Account(
              Web3Account.fromAddresses(addresses, MetaMask.type)
            )
        );
      default:
        throw new Error('Unsupported Web3Provider');
    }
  };

  if (!currentWeb3Account && cacheExists) {
    const cachedWeb3Account = Web3Account.fromAddress(
      cachedWeb3AccountAddress,
      CachedWeb3ProviderType.get()!
    );

    setCurrentWeb3Account(cachedWeb3Account);

    handleWeb3ProviderEvents();
  }

  return { currentWeb3Account, setCurrentWeb3Account };
}

const isWeb3AccountConnectedAtom = atom((get) => !!get(currentWeb3AccountAtom));
export const useIsWeb3AccountConnected = () =>
  useAtomValue(isWeb3AccountConnectedAtom);
