import { CoinflipGameActivity, CoinflipRepo } from '@orisirisi/coinflip';
import { useEffect, useState } from 'react';

export function useCoinflipOngoingGameActivities(playerAddress: string | null) {
  const [isLoading, setIsLoading] = useState(false);
  const [gameActivities, setGameActivities] = useState<
    CoinflipGameActivity[] | null
  >(null);

  useEffect(() => {
    if (playerAddress) {
      const fetchController = new AbortController();
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

      return () => {
        fetchController.abort('STALE_COINFLIP_ONGOING_GAME_ACTIVITIES_REQUEST');
      };
    }
  }, [playerAddress]);

  return { gameActivities, isLoading, hasLoaded: gameActivities !== null };
}

export function useCoinflipGameActivities(gameId: number | null) {
  const [isLoading, setIsLoading] = useState(false);
  const [gameActivities, setGameActivities] = useState<
    CoinflipGameActivity[] | null
  >(null);

  useEffect(() => {
    if (gameId) {
      const fetchController = new AbortController();
      setIsLoading(true);
      CoinflipRepo.fetchGameActivities(gameId, fetchController.signal)
        .then((game) => setGameActivities(game))
        .then(() => setIsLoading(false))
        .catch((error: unknown) => {
          if (!fetchController.signal.aborted) throw error;
        });

      return () => {
        fetchController.abort('STALE_COINFLIP_ONGOING_GAME_ACTIVITIES_REQUEST');
      };
    }
  }, [gameId]);

  return { gameActivities, isLoading, hasLoaded: gameActivities !== null };
}
