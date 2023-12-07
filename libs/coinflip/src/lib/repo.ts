import { buildQueryString } from '@orisirisi/orisirisi-browser';
import { Game, GameActivity, GameStatus } from './games';

export interface FetchGamesParams {
  player_address?: string;
  status?: GameStatus;
  id_to_ignore?: number;
  page_size?: number;
}

export interface FetchGameParams {
  id: number;
  playerAddress?: string;
}

export class Repo {
  static async fetchGames(
    params: FetchGamesParams,
    signal: AbortSignal
  ): Promise<Game[]> {
    const queryString = buildQueryString(params as Record<string, string>);
    const response = await fetch(
      `http://127.0.0.1:4446/coinflip/games${queryString}`,
      { signal: signal }
    );

    const games = await response.json();

    return Game.manyFromJSON(games);
  }
  static async fetchGame(
    params: FetchGameParams,
    signal: AbortSignal
  ): Promise<Game> {
    let endpointUrl = `http://127.0.0.1:4446/coinflip/games/${params.id}`;
    if (params.playerAddress) {
      endpointUrl = endpointUrl + `?player_address=${params.playerAddress}`;
    }

    const response = await fetch(endpointUrl, {
      signal,
    });

    const game = await response.json();

    return Game.fromJSON(game);
  }
  static async fetchOngoingGameActivities(
    publicAddress: string,
    signal: AbortSignal
  ): Promise<GameActivity[]> {
    const endpointUrl = `http://127.0.0.1:4446/coinflip/game_activities/ongoing/${publicAddress}`;
    const response = await fetch(endpointUrl, {
      signal,
    });

    const game_activities = await response.json();

    return GameActivity.manyFromJSON(game_activities);
  }
  static async fetchGameActivities(
    gameId: number,
    signal: AbortSignal
  ): Promise<GameActivity[]> {
    const endpointUrl = `http://127.0.0.1:4446/coinflip/games/${gameId}/activities`;
    const response = await fetch(endpointUrl, {
      signal,
    });

    const game_activities = await response.json();

    return GameActivity.manyFromJSON(game_activities);
  }
}
