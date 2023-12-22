import {
  CoinflipRepo,
  CoinflipRepoError,
  UpdateMyCoinflipGamePlayParams,
} from '@orisirisi/coinflip';
import { useEffect, useState } from 'react';

export function useUpdateCoinflipGamePlay(
  params: UpdateMyCoinflipGamePlayParams | null
) {
  const [isLoading, setIsLoading] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [error, setError] = useState<CoinflipRepoError | null>(null);

  useEffect(() => {
    if (params) {
      const fetchController = new AbortController();
      setIsLoading(true);
      CoinflipRepo.updateMyGamePlay(params, fetchController.signal)
        .then((gameResult) => {
          if (gameResult.hasError()) return setError(gameResult.error!);

          setIsDone(gameResult.ok!);
        })
        .then(() => setIsLoading(false))
        .catch((error: unknown) => {
          if (!fetchController.signal.aborted) throw error;
        });

      return () => {
        fetchController.abort('STALE_UPDATE_MY_COINFLIP_GAME_PLAY_REQUEST');
      };
    }
  }, [params]);

  return {
    isLoading,
    hasLoaded: isDone,
    error,
  };
}
