import { Result } from '@orisirisi/orisirisi-error-handling';
import { buildQueryString } from '@orisirisi/orisirisi-browser';
import {
  Game,
  GameActivity,
  GameStatus,
  GameWallet,
  PaginatedGames,
} from './games';
import { NextEnvironments } from '@orisirisi/orisirisi';

export interface FetchGamesParams {
  player_address?: string;
  status?: GameStatus;
  id_to_ignore?: number;
  page_size?: number;
  chain_id_to_ignore?: number;
  offset?: number;
}

export interface FetchGameParams {
  id: number;
  chain_id: number;
  player_address?: string;
}

export interface UpdateMyGamePlayParams {
  game_id: number;
  chain_id: number;
  public_address: string;
  chance_and_salt: string;
}

export interface FetchGameWalletParams {
  chain_id: number;
  owner_address: string;
}

export enum HTTPServiceErrorType {
  NotFound = 'not found',
  UnprocessableEntity = 'unprocessable entity',
  Generic = 'generic',
}
export class HTTPServiceError extends Error {
  constructor(public readonly type: HTTPServiceErrorType, message?: string) {
    super(message || type);
  }
  isNotFoundError = () => this.type === HTTPServiceErrorType.NotFound;
  isUnprocessableEntityError = () =>
    this.type === HTTPServiceErrorType.UnprocessableEntity;
  isGenericError = () => this.type === HTTPServiceErrorType.Generic;
}

export class HTTPService {
  private static baseHost =
    NextEnvironments.getCurrent() === 'production'
      ? 'https://ark.proofofchance.com'
      : 'http://127.0.0.1:4446';
  private static baseUrl = `${HTTPService.baseHost}/coinflip`;

  static async fetchGames(
    params: FetchGamesParams,
    signal: AbortSignal
  ): Promise<PaginatedGames> {
    const queryString = buildQueryString(params as Record<string, string>);
    const response = await fetch(
      HTTPService.appendBaseUrl(`/games${queryString}`),
      {
        signal: signal,
      }
    );

    const paginatedGames = await response.json();

    return PaginatedGames.fromJSON(paginatedGames);
  }
  static async fetchGame(params: FetchGameParams, signal: AbortSignal) {
    let endpointPath = `/games/${params.id}/${params.chain_id}`;
    if (params.player_address) {
      endpointPath = endpointPath + `?player_address=${params.player_address}`;
    }

    const response = await fetch(HTTPService.appendBaseUrl(endpointPath), {
      signal,
    });

    return this.maybeReturnHTTPServiceError(response, Game.fromJSON);
  }
  static async updateMyGamePlay(
    {
      game_id,
      chain_id,
      public_address,
      chance_and_salt,
    }: UpdateMyGamePlayParams,
    signal?: AbortSignal
  ) {
    const body = JSON.stringify({
      public_address,
      chance_and_salt,
    });

    const response = await fetch(
      HTTPService.appendBaseUrl(
        `/game_plays/${game_id}/${chain_id}/my_game_play`
      ),
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body,
        signal,
      }
    );

    if (response.status === 422)
      return new Result(
        null,
        new HTTPServiceError(HTTPServiceErrorType.UnprocessableEntity)
      );

    if (!response.ok)
      return new Result(
        null,
        new HTTPServiceError(
          HTTPServiceErrorType.Generic,
          await response.text()
        )
      );

    return new Result(true, null);
  }
  static async fetchAllGamesActivities(
    _publicAddress: string,
    _status: GameStatus,
    _signal: AbortSignal
  ): Promise<GameActivity[]> {
    // TODO: Uncomment after notification feature
    // const response = await fetch(
    //   HTTPService.appendBaseUrl(`/game_activities/${status}/${publicAddress}`),
    //   {
    //     signal,
    //   }
    // );

    // const game_activities = await response.json();

    return GameActivity.manyFromJSON([]);
  }
  static async fetchGameActivities(
    gameId: number,
    chainId: number,
    signal: AbortSignal
  ) {
    const response = await fetch(
      HTTPService.appendBaseUrl(`/games/${gameId}/${chainId}/activities`),
      {
        signal,
      }
    );

    return this.maybeReturnHTTPServiceError(
      response,
      GameActivity.manyFromJSON
    );
  }

  static async fetchGameWallet(
    { owner_address, chain_id }: FetchGameWalletParams,
    signal: AbortSignal
  ) {
    const endpointPath = `${HTTPService.baseHost}/wallets/${owner_address}/${chain_id}`;

    const response = await fetch(endpointPath, {
      signal,
    });

    if (response.ok) {
      const json = await response.json();

      return new Result(GameWallet.fromJSON(json), null);
    }

    if (response.status === 404) {
      return new Result(GameWallet.newEmpty(owner_address), null);
    }

    throw new Error(await response.text());
  }

  static async keepIndexingActive() {
    const endpointPath = `${HTTPService.baseHost}/keep_indexing_active_request/refresh`;

    await fetch(endpointPath, {
      method: 'POST',
    });
  }

  private static maybeReturnHTTPServiceError = async <Resource>(
    response: Response,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    parseJSON: (resource: any) => Resource
  ) => {
    if (response.ok) {
      const json = await response.json();

      return new Result(parseJSON(json), null);
    }

    if (response.status === 404) {
      return new Result(
        null,
        new HTTPServiceError(HTTPServiceErrorType.NotFound)
      );
    }

    throw new Error(await response.text());
  };

  private static appendBaseUrl = (path: string) => HTTPService.baseUrl + path;
}
