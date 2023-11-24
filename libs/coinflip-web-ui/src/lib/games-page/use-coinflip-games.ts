import {
  CoinflipGame,
  CoinflipGameStatus,
  CoinflipRepo,
  FetchCoinflipGamesParams,
} from '@orisirisi/coinflip';
import { useCurrentWeb3Account } from '@orisirisi/orisirisi-web3-ui';
import { useEffect, useState } from 'react';

export type GamesPageForFilter = 'all' | 'my_games';

export interface GamesPageFilter {
  forFilter: GamesPageForFilter;
}

export function useCoinflipGames({
  forFilter,
  statusFilter,
}: {
  forFilter?: GamesPageForFilter;
  statusFilter?: CoinflipGameStatus;
}) {
  const { currentWeb3Account } = useCurrentWeb3Account();
  const [isLoading, setIsLoading] = useState(false);
  const [games, setGames] = useState<CoinflipGame[]>([]);

  useEffect(() => {
    const buildParams = (): FetchCoinflipGamesParams => {
      const params: FetchCoinflipGamesParams = {};

      if (forFilter === 'my_games') {
        params.creator_address = currentWeb3Account!.address;
      }
      params.status = statusFilter;

      return params;
    };

    const fetchController = new AbortController();
    setIsLoading(true);
    CoinflipRepo.fetchGames(buildParams(), fetchController)
      .then((games) => setGames(games))
      .then(() => setIsLoading(false))
      .catch((error: unknown) => {
        if (!fetchController.signal.aborted) throw error;
      });

    return () => {
      fetchController.abort('STALE_COINFLIP_GAMES_REQUEST');
    };
  }, [forFilter, statusFilter, currentWeb3Account]);

  return { games, isLoading };
}

export function useCoinflipGame(id: number | null) {
  const [isLoading, setIsLoading] = useState(false);
  const [game, setGame] = useState<CoinflipGame | null>(null);

  useEffect(() => {
    if (id) {
      const fetchController = new AbortController();
      setIsLoading(true);
      CoinflipRepo.fetchGame(id, fetchController)
        .then((game) => setGame(game))
        .then(() => setIsLoading(false))
        .catch((error: unknown) => {
          if (!fetchController.signal.aborted) throw error;
        });

      return () => {
        fetchController.abort('STALE_COINFLIP_GAMES_REQUEST');
      };
    }
  }, [id]);

  return { game, isLoading, hasLoaded: game !== null };
}
