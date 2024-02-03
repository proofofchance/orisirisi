import {
  CoinflipGame,
  CoinflipGameStatus,
  CoinflipHTTPService,
  CoinflipHTTPServiceError,
  FetchCoinflipGameParams,
  FetchCoinflipGamesParams,
} from '@orisirisi/coinflip';
import { FeatureFlags } from '@orisirisi/orisirisi';
import { ChainID } from '@orisirisi/orisirisi-web3-chains';
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
      const chainIdToIgnore = FeatureFlags.showTestnets()
        ? undefined
        : ChainID.SepoliaTestNet;

      const params: FetchCoinflipGamesParams = {
        id_to_ignore: idToIgnore,
        page_size: pageSize,
        chain_id_to_ignore: chainIdToIgnore,
      };

      if (forFilter === 'my_games') {
        params.player_address = currentWeb3Account!.address;
      }
      params.status = statusFilter;

      return params;
    };

    const fetchController = new AbortController();
    setIsLoading(true);
    if (forFilter === 'my_games' && !currentWeb3Account)
      return setIsLoading(false);
    CoinflipHTTPService.fetchGames(buildParams(), fetchController.signal)
      .then((games) => setGames(games))
      .catch((error: unknown) => {
        if (!fetchController.signal.aborted) throw error;
      })
      .finally(() => setIsLoading(false));

    return () => {
      fetchController.abort('STALE_COINFLIP_GAMES_REQUEST');
    };
  }, [forFilter, statusFilter, idToIgnore, pageSize, currentWeb3Account]);

  return { games, isLoading, hasLoaded: games !== null };
}

export function useCoinflipGame(params: FetchCoinflipGameParams | null) {
  const [isLoading, setIsLoading] = useState(false);
  const [game, setGame] = useState<CoinflipGame | null>(null);
  const [error, setError] = useState<CoinflipHTTPServiceError | null>(null);

  useEffect(() => {
    if (params) {
      const fetchController = new AbortController();
      setIsLoading(true);
      CoinflipHTTPService.fetchGame(params, fetchController.signal)
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
  };
}
