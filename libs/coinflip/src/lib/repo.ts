import { buildQueryString } from '@orisirisi/orisirisi-browser';
import { Game, GameStatus } from './games';

export interface FetchGamesParams {
  creator_address?: string;
  status?: GameStatus;
  id_to_ignore?: number;
  page_size?: number;
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
    id: number,
    fetchController: AbortController
  ): Promise<Game> {
    const response = await fetch(`http://127.0.0.1:4446/coinflip/games/${id}`, {
      signal: fetchController.signal,
    });

    const game = await response.json();

    return Game.fromJSON(game);
  }
}
