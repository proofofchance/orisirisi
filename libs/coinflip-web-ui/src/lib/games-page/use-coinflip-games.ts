import {
  CoinflipGame,
  CoinflipGameStatus,
  CoinflipGames,
  FetchCoinflipGamesParams,
} from '@orisirisi/coinflip';
import { useCurrentWeb3Account } from '@orisirisi/orisirisi-web3-ui';
import { useEffect, useState } from 'react';

export type GamesPageForFilter = 'all' | 'my_games';

export interface GamesPageFilter {
  forFilter: GamesPageForFilter;
  statusFilter: CoinflipGameStatus;
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

    const fetchController = CoinflipGames.getFetchController();
    setIsLoading(true);
    CoinflipGames.fetch(buildParams(), fetchController)
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
