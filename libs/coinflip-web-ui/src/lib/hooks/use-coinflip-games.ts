import {
  CoinflipGame,
  CoinflipGameStatus,
  CoinflipHTTPService,
  CoinflipHTTPServiceError,
  CoinflipPaginatedGames,
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

export function useCoinflipPaginatedGames({
  forFilter,
  statusFilter,
  idToIgnore,
  pageSize,
}: UseCoinflipGamesParams) {
  const { currentWeb3Account } = useCurrentWeb3Account();

  const [shouldLoad, setShouldLoad] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [paginatedGames, setPaginatedGames] =
    useState<CoinflipPaginatedGames | null>(null);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    setPaginatedGames(null);
    setShouldLoad(true);
    setHasMore(false);
  }, [forFilter, statusFilter, idToIgnore, pageSize]);

  useEffect(() => {
    if (!shouldLoad) return;

    const buildParams = (): FetchCoinflipGamesParams => {
      const chainIdToIgnore = FeatureFlags.showTestnets()
        ? undefined
        : ChainID.SepoliaTestNet;

      const params: FetchCoinflipGamesParams = {
        id_to_ignore: idToIgnore,
        page_size: pageSize,
        chain_id_to_ignore: chainIdToIgnore,
        offset: paginatedGames ? paginatedGames.nextOffset() : 0,
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
      .then((newPaginatedGames) => {
        setShouldLoad(false);
        if (!newPaginatedGames) return;
        if (!paginatedGames) {
          setPaginatedGames(newPaginatedGames);
        } else {
          setPaginatedGames(paginatedGames.appendWith(newPaginatedGames));
        }
        setHasMore(!newPaginatedGames.isEmpty());
      })
      .catch((error: unknown) => {
        if (!fetchController.signal.aborted) throw error;
      })
      .finally(() => setIsLoading(false));

    return () => {
      fetchController.abort('STALE_COINFLIP_GAMES_REQUEST');
    };
  }, [
    shouldLoad,
    paginatedGames,
    forFilter,
    statusFilter,
    idToIgnore,
    pageSize,
    currentWeb3Account,
  ]);

  return {
    paginatedGames,
    isLoading,
    hasLoaded: paginatedGames !== null,
    hasMore,
    loadNextPage: () => paginatedGames && setShouldLoad(true),
  };
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
