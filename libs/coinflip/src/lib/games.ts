import { Chain, ChainID } from '@orisirisi/orisirisi-web3-chains';
import { CoinSide } from './coin';

export type GameStatus = 'ongoing' | 'expired' | 'completed';

export class Game {
  static minPossiblePlayers = 2;
  static maxPossiblePlayers = 20;

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
    public status: GameStatus,
    public is_in_play_phase: boolean,
    public unavailable_coin_side: CoinSide | null,
    public is_awaiting_my_play_proof: boolean | null,
    public my_game_play_id: number | null
  ) {}

  iHavePlayed(): boolean {
    return !!this.my_game_play_id;
  }
  iHaveNotPlayed(): boolean {
    return !this.my_game_play_id;
  }

  getChain(): Chain {
    return Chain.fromChainID(this.chain_id);
  }

  isOngoing(): boolean {
    return this.status === 'ongoing';
  }
  isExpired(): boolean {
    return this.status === 'expired';
  }
  isCompleted(): boolean {
    return this.status === 'completed';
  }

  static fromJSON(json: Game): Game {
    // @ts-ignore
    return Object.assign(new Game(), json);
  }
  static manyFromJSON(jsonList: Game[]): Game[] {
    // Use the class name directly to avoid scope creep
    return jsonList.map(Game.fromJSON);
  }
  static getMinWagerEth(chainId: ChainID = ChainID.Ethereum): number {
    switch (chainId) {
      case ChainID.Local:
      case ChainID.LocalAlt:
      case ChainID.Ethereum:
        return 0.02;
      case ChainID.Polygon:
        return 0.2;
      default:
        return 0.2;
    }
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

interface GamePlayCreatedActivityData {
  coin_side: CoinSide;
  public_hash: string;
}

export class GameActivity {
  constructor(
    public id: number,
    public game_id: number,
    public trigger_public_address: string,
    public data: GamePlayCreatedActivityData | Record<string, never>,
    public kind:
      | 'game_created'
      | 'game_play_created'
      | 'game_play_proof_created'
      | 'game_expired',
    public block_timestamp: number,
    public transaction_hash: string
  ) {}

  getPlayCreatedData = () => this.data as GamePlayCreatedActivityData;

  static fromJSON(json: GameActivity): GameActivity {
    // @ts-ignore
    return Object.assign(new GameActivity(), json);
  }
  static manyFromJSON(jsonList: GameActivity[]): GameActivity[] {
    // Use the class name directly to avoid scope creep
    return jsonList.map(GameActivity.fromJSON);
  }
}
