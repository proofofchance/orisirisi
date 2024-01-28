import {
  CoinflipGameActivity,
  CoinflipGameStatus,
  CoinflipHTTPService,
  CoinflipHTTPServiceError,
} from '@orisirisi/coinflip';
import { useEffect, useState } from 'react';

export function useAllCoinflipGameActivities(
  playerAddress: string | null,
  gameStatus: CoinflipGameStatus,
  interval?: number
) {
  const [isLoading, setIsLoading] = useState(false);
  const [gameActivities, setGameActivities] = useState<
    CoinflipGameActivity[] | null
  >(null);

  useEffect(() => {
    if (playerAddress) {
      const fetchController = new AbortController();

      const fetchAndSetGameActivities = () => {
        setIsLoading(true);
        CoinflipHTTPService.fetchAllGamesActivities(
          playerAddress,
          gameStatus,
          fetchController.signal
        )
          .then((game) => setGameActivities(game))
          .catch((error: unknown) => {
            if (!fetchController.signal.aborted) throw error;
          })
          .finally(() => setIsLoading(false));
      };

      if (interval) {
        setInterval(() => {
          fetchAndSetGameActivities();
        }, interval);
      } else {
        fetchAndSetGameActivities();
      }

      return () => {
        fetchController.abort('STALE_COINFLIP_GAME_ACTIVITIES_REQUEST');
      };
    }
  }, [playerAddress, gameStatus, interval]);

  return { gameActivities, isLoading, hasLoaded: gameActivities !== null };
}

export function useCoinflipGameActivities(
  gameId: number | null,
  chainId: number | null
) {
  const [isLoading, setIsLoading] = useState(false);
  const [gameActivities, setGameActivities] = useState<
    CoinflipGameActivity[] | null
  >(null);
  const [error, setError] = useState<CoinflipHTTPServiceError | null>(null);

  useEffect(() => {
    if (gameId && chainId) {
      const fetchController = new AbortController();
      setIsLoading(true);
      CoinflipHTTPService.fetchGameActivities(
        gameId,
        chainId,
        fetchController.signal
      )
        .then((gameActivitiesResult) => {
          if (gameActivitiesResult.hasError()) {
            return setError(gameActivitiesResult.error!);
          }
          return setGameActivities(gameActivitiesResult.ok);
        })
        .then(() => setIsLoading(false))
        .catch((error: unknown) => {
          if (!fetchController.signal.aborted) throw error;
        });

      return () => {
        fetchController.abort('STALE_COINFLIP_GAME_ACTIVITIES_REQUEST');
      };
    }
  }, [gameId, chainId]);

  return {
    gameActivities,
    isLoading,
    error,
    hasLoaded: gameActivities !== null && !error,
  };
}
