import {
  Countdown,
  aDay,
  aMinute,
  anHour,
  getDivisionAndRemainder,
} from '@orisirisi/orisirisi-data-utils';

export type GameStatus = 'ongoing' | 'completed';

export class Game {
  constructor(
    public id: number,
    public chain_id: number,
    public wager: string,
    public wager_usd: number,
    public max_possible_win_usd: number,
    public players_left: number,
    public total_players_required: number,
    public max_play_count: number,
    public expiry_timestamp: number,
    public is_completed: boolean,
    public is_ongoing: boolean
  ) {}

  static fromJSON(json: Game): Game {
    // @ts-ignore
    return Object.assign(new Game(), json);
  }
  static manyFromJSON(jsonList: Game[]): Game[] {
    // @ts-ignore
    return jsonList.map((json) => Object.assign(new Game(), json));
  }

  getExpiryCountdown(): Countdown {
    const { expiry_timestamp: expiryTimestamp } = this;

    const now = Math.ceil(new Date().getTime() / 1000);
    const timeLeft = Math.max(expiryTimestamp - now, 0);

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
  }
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
