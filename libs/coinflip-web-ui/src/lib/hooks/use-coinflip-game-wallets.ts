import {
  CoinflipGameWallet,
  CoinflipHTTPService,
  CoinflipHTTPServiceError,
  FetchCoinflipGameWalletParams,
} from '@orisirisi/coinflip';
import { useEffect, useState } from 'react';

export function useCoinflipGameWallet(
  params: FetchCoinflipGameWalletParams | null
) {
  const [shouldRefresh, setShouldRefresh] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [wallet, setWallet] = useState<CoinflipGameWallet | null>(null);
  const [error, setError] = useState<CoinflipHTTPServiceError | null>(null);

  const refresh = () => setShouldRefresh(true);

  useEffect(() => {
    if (params && wallet) refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  useEffect(() => {
    if (params && shouldRefresh) {
      const fetchController = new AbortController();
      setIsLoading(true);
      CoinflipHTTPService.fetchGameWallet(params, fetchController.signal)
        .then((result) => {
          if (result.hasError()) return setError(result.error!);

          setWallet(result.ok!);
        })
        .catch((error: unknown) => {
          if (!fetchController.signal.aborted) throw error;
        })
        .finally(() => {
          setIsLoading(false);
          setShouldRefresh(false);
        });

      return () => {
        fetchController.abort('STALE_COINFLIP_GAME_REQUEST');
      };
    }
  }, [params, shouldRefresh]);

  return {
    wallet,
    refresh,
    isLoading,
    hasLoaded: wallet !== null && !error,
    error,
  };
}
