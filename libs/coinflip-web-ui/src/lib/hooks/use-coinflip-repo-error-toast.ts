import { CoinflipRepoError, CoinflipRepoErrorType } from '@orisirisi/coinflip';
import { atom, useAtom, useSetAtom } from 'jotai';
import { useEffect } from 'react';
import toast from 'react-hot-toast';

const coinflipRepoErrorToastRequestAtom = atom<
  [CoinflipRepoError, string, Date] | null
>(null);

export function useDispatchCoinflipRepoErrorToastRequest() {
  const setRepoErrorToastRequest = useSetAtom(
    coinflipRepoErrorToastRequestAtom
  );

  return (repoError: CoinflipRepoError, resourceName: string) =>
    setRepoErrorToastRequest([repoError, resourceName, new Date()]);
}

export function useCoinflipRepoErrorToastRequest() {
  const [repoErrorToastRequest, setRepoErrorToastRequest] = useAtom(
    coinflipRepoErrorToastRequestAtom
  );

  useEffect(() => {
    if (!repoErrorToastRequest) return;
    const [repoError, resourceName] = repoErrorToastRequest;

    if (repoError.type === CoinflipRepoErrorType.NotFound) {
      toast.error(`${resourceName} not found!`, {
        position: 'bottom-right',
      });
    }

    setRepoErrorToastRequest(null);
  }, [repoErrorToastRequest, setRepoErrorToastRequest]);
}
