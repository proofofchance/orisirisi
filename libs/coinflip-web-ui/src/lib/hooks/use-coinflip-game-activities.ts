import {
  CoinflipGameActivity,
  CoinflipRepo,
  CoinflipRepoError,
  CoinflipRepoErrorType,
} from '@orisirisi/coinflip';
import { useEffect, useState } from 'react';

export function useCoinflipOngoingGameActivities(
  playerAddress: string | null,
  interval?: number
) {
  const [isLoading, setIsLoading] = useState(false);
  const [gameActivities, setGameActivities] = useState<
    CoinflipGameActivity[] | null
  >(null);

  useEffect(() => {
    if (playerAddress) {
      const fetchController = new AbortController();

      const fetchAndSetOngoingGameActivities = () => {
        setIsLoading(true);
        CoinflipRepo.fetchOngoingGameActivities(
          playerAddress,
          fetchController.signal
        )
          .then((game) => setGameActivities(game))
          .then(() => setIsLoading(false))
          .catch((error: unknown) => {
            if (!fetchController.signal.aborted) throw error;
          });
      };

      if (interval) {
        setInterval(() => {
          fetchAndSetOngoingGameActivities();
        }, interval);
      } else {
        fetchAndSetOngoingGameActivities();
      }

      return () => {
        fetchController.abort('STALE_COINFLIP_ONGOING_GAME_ACTIVITIES_REQUEST');
      };
    }
  }, [playerAddress, interval]);

  return { gameActivities, isLoading, hasLoaded: gameActivities !== null };
}

export function useCoinflipGameActivities(gameId: number | null) {
  const [isLoading, setIsLoading] = useState(false);
  const [gameActivities, setGameActivities] = useState<
    CoinflipGameActivity[] | null
  >(null);
  const [error, setError] = useState<CoinflipRepoError | null>(null);

  useEffect(() => {
    if (gameId) {
      const fetchController = new AbortController();
      setIsLoading(true);
      CoinflipRepo.fetchGameActivities(gameId, fetchController.signal)
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
        fetchController.abort('STALE_COINFLIP_ONGOING_GAME_ACTIVITIES_REQUEST');
      };
    }
  }, [gameId]);

  return {
    gameActivities,
    isLoading,
    error,
    hasLoaded: gameActivities !== null && !error,
    notFound: error?.type === CoinflipRepoErrorType.NotFound,
  };
}
