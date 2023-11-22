import { Chain } from '@orisirisi/orisirisi-web3-chains';

export type GameStatus = 'ongoing' | 'completed';

export class Game {
  constructor(
    public id: number,
    public chain_id: number,
    public wager: number,
    public wager_usd: number,
    public max_possible_win_usd: number,
    public players_left: number,
    public total_players_required: number,
    public max_play_count: number,
    public expiry_timestamp: number,
    public is_completed: boolean,
    public is_ongoing: boolean
  ) {}

  getChain(): Chain {
    return Chain.fromChainID(this.chain_id);
  }

  static fromJSON(json: Game): Game {
    // @ts-ignore
    return Object.assign(new Game(), json);
  }
  static manyFromJSON(jsonList: Game[]): Game[] {
    // @ts-ignore
    return jsonList.map((json) => Object.assign(new Game(), json));
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
