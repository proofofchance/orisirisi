import { buildQueryString } from '@orisirisi/orisirisi-browser';
import {
  Countdown,
  aDay,
  aMinute,
  anHour,
  getDivisionAndRemainder,
} from '@orisirisi/orisirisi-data-utils';

export interface Game {
  id: number;
  chain_id: number;
  wager_usd: number;
  max_possible_win_usd: number;
  players_left: number;
  total_players_required: number;
  max_play_count: number;
  expiry_timestamp: number;
  is_completed: boolean;
  is_ongoing: boolean;
}

export const formatUSD = (wager: number) => {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',

    // These options are needed to round to whole numbers if that's what you want.
    minimumFractionDigits: 2, // (this suffices for whole numbers, but will print 2500.10 as $2,500.1)
    maximumFractionDigits: 2, // (causes 2500.99 to be printed as $2,501)
  });

  return formatter.format(wager);
};

export const getGameExpiryCountdown = (gameExpiry: number): Countdown => {
  const now = Math.ceil(new Date().getTime() / 1000);
  const timeLeft = Math.max(gameExpiry - now, 0);

  const [daysLeft, hoursAndMinutesAndSecondsLeft] = getDivisionAndRemainder(
    timeLeft,
    aDay
  );
  const [hoursLeft, minutesAndSecondsLeft] = getDivisionAndRemainder(
    hoursAndMinutesAndSecondsLeft,
    anHour
  );
  const [minutesLeft, secondsLeft] = getDivisionAndRemainder(
    minutesAndSecondsLeft,
    aMinute
  );

  return {
    daysLeft,
    hoursLeft,
    minutesLeft,
    secondsLeft,
  };
};

export type GameStatus = 'ongoing' | 'completed';

export interface FetchGamesParams {
  creator_address?: string;
  status?: GameStatus;
}

export class Games {
  static async fetchGames(
    params: FetchGamesParams,
    fetchController: AbortController
  ): Promise<Game[]> {
    const queryString = buildQueryString(params as Record<string, string>);
    const response = await fetch(
      `http://127.0.0.1:4446/coinflip/games${queryString}`,
      { signal: fetchController.signal }
    );

    const games = response.json();

    return games;
  }
  static async fetchGame(
    id: number,
    fetchController: AbortController
  ): Promise<Game> {
    const response = await fetch(`http://127.0.0.1:4446/coinflip/games/${id}`, {
      signal: fetchController.signal,
    });

    const game = response.json();

    return game;
  }
}
