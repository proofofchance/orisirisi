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

  return (repoError: CoinflipRepoError, message: string) =>
    setRepoErrorToastRequest([repoError, message, new Date()]);
}

export function useCoinflipRepoErrorToastRequest() {
  const [repoErrorToastRequest, setRepoErrorToastRequest] = useAtom(
    coinflipRepoErrorToastRequestAtom
  );

  useEffect(() => {
    if (!repoErrorToastRequest) return;
    const [repoError, message] = repoErrorToastRequest;

    if (repoError.type === CoinflipRepoErrorType.NotFound) {
      toast.error(message, {
        position: 'bottom-right',
      });
    }

    setRepoErrorToastRequest(null);
  }, [repoErrorToastRequest, setRepoErrorToastRequest]);
}
