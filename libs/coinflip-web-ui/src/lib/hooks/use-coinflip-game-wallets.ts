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
  const [isLoading, setIsLoading] = useState(false);
  const [wallet, setWallet] = useState<CoinflipGameWallet | null>(null);
  const [error, setError] = useState<CoinflipHTTPServiceError | null>(null);

  useEffect(() => {
    if (params) {
      const fetchController = new AbortController();
      setIsLoading(true);
      CoinflipHTTPService.fetchGameWallet(params, fetchController.signal)
        .then((result) => {
          if (result.hasError()) return setError(result.error!);

          setWallet(result.ok!);
        })
        .then(() => setIsLoading(false))
        .catch((error: unknown) => {
          if (!fetchController.signal.aborted) throw error;
        });

      return () => {
        fetchController.abort('STALE_COINFLIP_GAME_REQUEST');
      };
    }
  }, [params]);

  return {
    wallet,
    isLoading,
    hasLoaded: wallet !== null && !error,
    error,
  };
}
