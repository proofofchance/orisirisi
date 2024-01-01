import { buildQueryString } from '@orisirisi/orisirisi-browser';
import { Game, GameActivity, GameStatus } from './games';
import { Result } from '@orisirisi/orisirisi-error-handling';

export interface FetchGamesParams {
  player_address?: string;
  status?: GameStatus;
  id_to_ignore?: number;
  page_size?: number;
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
  game_play_proof: string;
}

export enum RepoErrorType {
  NotFound = 'not found',
  UnprocessableEntity = 'unprocessable entity',
  Generic = 'generic',
}
export class RepoError extends Error {
  constructor(public readonly type: RepoErrorType, message?: string) {
    super(message || type);
  }
  isNotFoundError = () => this.type === RepoErrorType.NotFound;
  isUnprocessableEntityError = () =>
    this.type === RepoErrorType.UnprocessableEntity;
  isGenericError = () => this.type === RepoErrorType.Generic;
}

// TODO: Rename to HTTPRepo or HTTPService or CoinflipService
export class Repo {
  private static baseUrl = 'http://127.0.0.1:4446/coinflip';

  static async fetchGames(
    params: FetchGamesParams,
    signal: AbortSignal
  ): Promise<Game[]> {
    const queryString = buildQueryString(params as Record<string, string>);
    const response = await fetch(
      Repo.appendPathWithBaseUrl(`/games${queryString}`),
      { signal: signal }
    );

    const games = await response.json();

    return Game.manyFromJSON(games);
  }
  static async fetchGame(params: FetchGameParams, signal: AbortSignal) {
    let endpointPath = `/games/${params.id}/${params.chain_id}`;
    if (params.player_address) {
      endpointPath = endpointPath + `?player_address=${params.player_address}`;
    }

    const response = await fetch(Repo.appendPathWithBaseUrl(endpointPath), {
      signal,
    });

    return this.maybeReturnRepoError(response, Game.fromJSON);
  }
  static async updateMyGamePlay(
    {
      game_id,
      chain_id,
      public_address,
      game_play_proof,
    }: UpdateMyGamePlayParams,
    signal?: AbortSignal
  ) {
    const body = JSON.stringify({
      public_address,
      game_play_proof,
    });

    const response = await fetch(
      Repo.appendPathWithBaseUrl(
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
      return new Result(null, new RepoError(RepoErrorType.UnprocessableEntity));

    if (!response.ok)
      return new Result(
        null,
        new RepoError(RepoErrorType.Generic, await response.text())
      );

    return new Result(true, null);
  }
  static async fetchOngoingGameActivities(
    publicAddress: string,
    signal: AbortSignal
  ): Promise<GameActivity[]> {
    const response = await fetch(
      Repo.appendPathWithBaseUrl(`/game_activities/ongoing/${publicAddress}`),
      {
        signal,
      }
    );

    const game_activities = await response.json();

    return GameActivity.manyFromJSON(game_activities);
  }
  static async fetchGameActivities(
    gameId: number,
    chainId: number,
    signal: AbortSignal
  ) {
    const response = await fetch(
      Repo.appendPathWithBaseUrl(`/games/${gameId}/${chainId}/activities`),
      {
        signal,
      }
    );

    return this.maybeReturnRepoError(response, GameActivity.manyFromJSON);
  }

  private static maybeReturnRepoError = async <Resource>(
    response: Response,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    parseJSON: (resource: any) => Resource
  ) => {
    if (response.ok) {
      const json = await response.json();

      return new Result(parseJSON(json), null);
    }

    if (response.status === 404) {
      return new Result(null, new RepoError(RepoErrorType.NotFound));
    }

    throw new Error(await response.text());
  };

  private static appendPathWithBaseUrl = (path: string) => Repo.baseUrl + path;
}
