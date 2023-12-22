import {
  CoinflipGame,
  CoinflipGameStatus,
  CoinflipRepo,
  CoinflipRepoError,
  CoinflipRepoErrorType,
  FetchCoinflipGameParams,
  FetchCoinflipGamesParams,
} from '@orisirisi/coinflip';
import { useCurrentWeb3Account } from '@orisirisi/orisirisi-web3-ui';
import { useEffect, useState } from 'react';

export type GamesPageForFilter = 'all' | 'my_games';

export interface GamesPageFilter {
  forFilter: GamesPageForFilter;
}

interface UseCoinflipGamesParams {
  forFilter?: GamesPageForFilter;
  statusFilter?: CoinflipGameStatus;
  idToIgnore?: number;
  pageSize?: number;
}

export function useCoinflipGames({
  forFilter,
  statusFilter,
  idToIgnore,
  pageSize,
}: UseCoinflipGamesParams) {
  const { currentWeb3Account } = useCurrentWeb3Account();
  const [isLoading, setIsLoading] = useState(false);
  const [games, setGames] = useState<CoinflipGame[] | null>(null);

  useEffect(() => {
    const buildParams = (): FetchCoinflipGamesParams => {
      const params: FetchCoinflipGamesParams = {
        id_to_ignore: idToIgnore,
        page_size: pageSize,
      };

      if (forFilter === 'my_games') {
        params.player_address = currentWeb3Account!.address;
      }
      params.status = statusFilter;

      return params;
    };

    const fetchController = new AbortController();
    setIsLoading(true);
    CoinflipRepo.fetchGames(buildParams(), fetchController.signal)
      .then((games) => setGames(games))
      .then(() => setIsLoading(false))
      .catch((error: unknown) => {
        if (!fetchController.signal.aborted) throw error;
      });

    return () => {
      fetchController.abort('STALE_COINFLIP_GAMES_REQUEST');
    };
  }, [forFilter, statusFilter, idToIgnore, pageSize, currentWeb3Account]);

  return { games, isLoading, hasLoaded: games !== null };
}

export function useCoinflipGame(params: FetchCoinflipGameParams | null) {
  const [isLoading, setIsLoading] = useState(false);
  const [game, setGame] = useState<CoinflipGame | null>(null);
  const [error, setError] = useState<CoinflipRepoError | null>(null);

  useEffect(() => {
    if (params) {
      const fetchController = new AbortController();
      setIsLoading(true);
      CoinflipRepo.fetchGame(params, fetchController.signal)
        .then((gameResult) => {
          if (gameResult.hasError()) return setError(gameResult.error!);

          setGame(gameResult.ok!);
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
    game,
    isLoading,
    hasLoaded: game !== null && !error,
    error,
    notFound: error?.type === CoinflipRepoErrorType.NotFound,
  };
}
