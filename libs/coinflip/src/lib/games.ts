import { buildQueryString } from '@orisirisi/orisirisi-browser';

export interface Game {
  id: number;
  chain_id: number;
  wager_usd: number;
  total_possible_win_usd: number;
  view_count: number;
  players_left: number;
  total_players_required: number;
  max_play_count: number;
  expiry_timestamp: number;
}

export type GameStatus = 'ongoing' | 'completed';

export interface FetchGamesParams {
  creator_address?: string;
  status?: GameStatus;
}

export class Games {
  static async fetch(params: FetchGamesParams): Promise<Game[]> {
    const queryString = buildQueryString(params as Record<string, string>);
    const response = await fetch(
      `http://127.0.0.1:4446/coinflip/games${queryString}`
    );

    const games = response.json();

    return games;
  }
}
