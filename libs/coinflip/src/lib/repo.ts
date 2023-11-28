import { buildQueryString } from '@orisirisi/orisirisi-browser';
import { Game, GameActivity, GameStatus } from './games';

export interface FetchGamesParams {
  creator_address?: string;
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
    fetchController: AbortController
  ): Promise<Game[]> {
    const queryString = buildQueryString(params as Record<string, string>);
    const response = await fetch(
      `http://127.0.0.1:4446/coinflip/games${queryString}`,
      { signal: fetchController.signal }
    );

    const games = await response.json();

    return Game.manyFromJSON(games);
  }
  static async fetchGame(
    params: FetchGameParams,
    fetchController: AbortController
  ): Promise<Game> {
    let endpointUrl = `http://127.0.0.1:4446/coinflip/games/${params.id}`;
    if (params.playerAddress) {
      endpointUrl = endpointUrl + `?player_address=${params.playerAddress}`;
    }

    const response = await fetch(endpointUrl, {
      signal: fetchController.signal,
    });

    const game = await response.json();

    return Game.fromJSON(game);
  }
  static async fetchOngoingGameActivities(
    publicAddress: string,
    fetchController: AbortController
  ): Promise<GameActivity[]> {
    const endpointUrl = `http://127.0.0.1:4446/coinflip/game_activities/ongoing/${publicAddress}`;
    const response = await fetch(endpointUrl, {
      signal: fetchController.signal,
    });

    const game_activities = await response.json();

    return GameActivity.manyFromJSON(game_activities);
  }
}
