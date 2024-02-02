import { Chain, ChainID } from '@orisirisi/orisirisi-web3-chains';
import { PublicProofOfChance } from '@orisirisi/proof-of-chance';
import { CoinSide } from './coin';

export type GameStatus =
  | 'awaiting_players'
  | 'expired'
  | 'awaiting_revealed_chances'
  | 'completed';

export type ConcludedGameStatus = Exclude<
  GameStatus,
  'awaiting_players' | 'awaiting_revealed_chances'
>;

export class Game {
  static minNumberOfPlayers = 2;
  static maxNumberOfPlayers = 20;

  public readonly proofOfChanceByPlayerAddress: Map<
    string,
    PublicProofOfChance
  > = new Map();

  private constructor(
    public id: number,
    public chain_id: number,
    public wager: number,
    public wager_usd: number,
    public max_possible_win_usd: number,
    public players_left: number,
    public total_players_required: number,
    public expiry_timestamp: number,
    public status: GameStatus,
    public unavailable_coin_side: CoinSide | null,
    public is_awaiting_my_chance_reveal: boolean | null,
    public my_game_play_id: number | null,
    public public_proof_of_chances: PublicProofOfChance[] | null,
    public outcome: CoinSide | null,
    public completed_at: number | null,
    public game_plays: GamePlay[] | null,
    public amount_for_each_winner: number | null,
    public amount_for_each_winner_usd: number | null,
    public refunded_at: number | null,
    public refunded_amount_per_player: number | null
  ) {}

  isRefunded() {
    return this.refunded_at !== null;
  }

  iHavePlayed(): boolean {
    return !!this.my_game_play_id;
  }
  iHaveNotPlayed(): boolean {
    return !this.my_game_play_id;
  }

  getChain(): Chain {
    return Chain.fromChainID(this.chain_id);
  }

  getExpiryTimestampMs = () => this.expiry_timestamp * 1000;
  getCompletedAtMs = () =>
    this.completed_at ? this.completed_at * 1000 : null;

  getProofOfChanceByPlayerAddress = (playerAddress: string) =>
    this.proofOfChanceByPlayerAddress.get(playerAddress) || null;

  getGamePlayByPlayerAddress = (playerAddress: string) =>
    this.game_plays?.find(
      (gp) => gp.player_address === playerAddress.toLowerCase()
    ) || null;

  isAwaitingPlayers(): boolean {
    return this.status === 'awaiting_players';
  }
  isAwaitingRevealedChances(): boolean {
    return this.status === 'awaiting_revealed_chances';
  }
  isExpired(): boolean {
    return this.status === 'expired';
  }
  isNotCompleteYet(): boolean {
    return !this.isCompleted();
  }
  isCompleted(): boolean {
    return this.status === 'completed';
  }

  static manyFromJSON(jsonList: Game[]): Game[] {
    // Use the class name directly to avoid scope creep
    return jsonList.map(Game.fromJSON);
  }
  static fromJSON(json: Game): Game {
    // @ts-ignore
    const game = Object.assign(new Game(), json);
    game.public_proof_of_chances = PublicProofOfChance.manyfromJSON(
      game.public_proof_of_chances
    );
    game.public_proof_of_chances?.forEach((poc) =>
      game.proofOfChanceByPlayerAddress.set(poc.player_address, poc)
    );
    game.game_plays = GamePlay.manyFromJSON(game.game_plays);
    return game;
  }

  // This calculated such that initial service percent, 2% is balances the min gas fee at that time
  // The service charge per contract will then be adjusted as the gas prices aberrate
  static getMinWagerEth(chainId: ChainID = ChainID.BNB): number {
    switch (chainId) {
      case ChainID.Local:
      case ChainID.LocalAlt:
      case ChainID.SepoliaTestNet:
        // case ChainID.Ethereum:
        return 0.04;
      case ChainID.BNB:
        return 1;
      case ChainID.Polygon:
        return 1;
    }
  }
}

export const formatUSD = (wager: number, minimumFractionDigits = 2) => {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',

    // These options are needed to round to whole numbers if that's what you want.
    minimumFractionDigits, // (this suffices for whole numbers, but will print 2500.10 as $2,500.1)
    maximumFractionDigits: 2, // (causes 2500.99 to be printed as $2,501)
  });

  return formatter.format(wager);
};

interface GamePlayCreatedActivityData {
  coin_side: CoinSide;
  public_hash: string;
}

type GameActivityKind =
  | 'game_created'
  | 'game_play_created'
  | 'game_play_chance_revealed';

export class GameActivity {
  constructor(
    public id: number,
    public game_id: number,
    public trigger_public_address: string,
    public data: GamePlayCreatedActivityData | Record<string, never>,
    public kind: GameActivityKind,
    public occurred_at: number,
    public transaction_hash: string
  ) {}

  isGameCreatedKind = () => this.kind === 'game_created';
  isGamePlayCreatedKind = () => this.kind === 'game_play_created';
  isGamePlayChanceRevealedKind = () =>
    this.kind === 'game_play_chance_revealed';

  getPlayCreatedData = () => this.data as GamePlayCreatedActivityData;
  getOccurredAtMs = () => this.occurred_at * 1000;

  static countActivityKind(
    activities: GameActivity[],
    kind: GameActivityKind
  ): number {
    return activities.filter((a) => a.kind === kind).length;
  }

  static fromJSON(json: GameActivity): GameActivity {
    // @ts-ignore
    return Object.assign(new GameActivity(), json);
  }
  static manyFromJSON(jsonList: GameActivity[]): GameActivity[] {
    // Use the class name directly to avoid referencing caller's scope
    return jsonList.map(GameActivity.fromJSON);
  }
}

export type GamePlayStatus = 'pending' | 'won' | 'lost' | 'expired';
export class GamePlay {
  constructor(
    public id: number,
    public game_id: number,
    public chain_id: number,
    public player_address: string,
    public proof_of_chance: string,
    public chance_and_salt: string | null,
    public status: GamePlayStatus
  ) {}

  static fromJSON(json: GamePlay): GamePlay {
    // @ts-ignore
    return Object.assign(new GamePlay(), json);
  }
  static manyFromJSON(jsonList: GamePlay[] | null): GamePlay[] | null {
    if (!jsonList) return null;
    // Use the class name directly to avoid referencing caller's scope
    return jsonList.map(GamePlay.fromJSON);
  }
}

export class GameWallet {
  constructor(
    public owner_address: string,
    public balance: string,
    public balance_usd: string
  ) {}
  isWithdrawable() {
    return +this.balance > 0;
  }
  static fromJSON(json: GameWallet): GameWallet {
    // @ts-ignore
    return Object.assign(new GameWallet(), json);
  }
  static newEmpty(owner_address: string): GameWallet {
    return new GameWallet(owner_address, '0.00', '0.00');
  }
}
