import { Chain, ChainID } from '@orisirisi/orisirisi-web3-chains';
import { RevealedProofOfChance } from '@orisirisi/proof-of-chance';
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

export class PaginatedGames {
  private constructor(
    public games: Game[],
    public total_completed_games_count: number,
    public total_games_count: number,
    public total_paid_out_amount: number
  ) {}

  nextOffset = () => this.games.length;
  isEmpty = () => this.games.length === 0;
  appendWith(paginatedGames: PaginatedGames) {
    return new PaginatedGames(
      [...this.games, ...paginatedGames.games],
      paginatedGames.total_completed_games_count,
      paginatedGames.total_games_count,
      paginatedGames.total_paid_out_amount
    );
  }

  static fromJSON(json: PaginatedGames): PaginatedGames {
    // @ts-ignore
    const paginatedGames = Object.assign(new PaginatedGames(), json);
    paginatedGames.games = Game.manyFromJSON(paginatedGames.games);
    return paginatedGames;
  }
}

export class Game {
  static minNumberOfPlayers = 2;
  static maxNumberOfPlayers = 5_000;

  public readonly revealedProofOfChanceByPlayerAddress: Map<
    string,
    RevealedProofOfChance
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
    public revealed_proof_of_chances: RevealedProofOfChance[] | null,
    public outcome: CoinSide | null,
    public completed_at: number | null,
    public game_plays: GamePlay[] | null,
    public amount_for_each_winner: number | null,
    public amount_for_each_winner_usd: number | null,
    public amount_shared_with_winners: number | null,
    public amount_shared_with_winners_usd: number | null,
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
  iAmYetToUploadMyProof(): boolean {
    return !!this.is_awaiting_my_chance_reveal;
  }

  getChain(): Chain {
    return Chain.fromChainID(this.chain_id);
  }

  getExpiryTimestampMs = () => this.expiry_timestamp * 1000;
  getCompletedAtMs = () =>
    this.completed_at ? this.completed_at * 1000 : null;

  getRevealedProofOfChanceByPlayerAddress = (playerAddress: string) =>
    this.revealedProofOfChanceByPlayerAddress.get(playerAddress) || null;

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
    game.revealed_proof_of_chances = RevealedProofOfChance.manyfromJSON(
      game.revealed_proof_of_chances
    );
    game.revealed_proof_of_chances?.forEach((poc) =>
      game.revealedProofOfChanceByPlayerAddress.set(poc.player_address, poc)
    );
    game.game_plays = GamePlay.manyFromJSON(game.game_plays);
    return game;
  }

  // Factors: server cost & rpc cost & service charge & gas prices
  static getMinWagerEth(chainId: ChainID = ChainID.Ethereum): number {
    switch (chainId) {
      case ChainID.Local:
      case ChainID.LocalAlt:
      case ChainID.SepoliaTestNet:
      case ChainID.Ethereum:
        return 0.04;
      case ChainID.Polygon:
        return 10;
    }
  }

  // Factors: server cost & gas prices
  static getServiceChargePercent(chainId: ChainID): number {
    switch (chainId) {
      case ChainID.Local:
      case ChainID.LocalAlt:
      case ChainID.SepoliaTestNet:
      case ChainID.Ethereum:
      case ChainID.Polygon:
        return 8;
    }
  }
}

export const formatCurrency = (
  wager: number,
  options: {
    minimumFractionDigits?: number;
    isCryptoCurrency?: boolean;
    currency?: 'USD' & string;
  } = {}
) => {
  const currency = options.currency || 'USD';

  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    // These options are needed to round to whole numbers if that's what you want.
    minimumFractionDigits: 2, // (this suffices for whole numbers, but will print 2500.10 as $2,500.1)
    maximumFractionDigits: 2, // (causes 2500.99 to be printed as $2,501)
  });

  let formatOutput = formatter.format(wager);
  if (options.isCryptoCurrency) {
    formatOutput = formatOutput.split(' ')[1];
  }

  return formatOutput;
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
    public chain_id: number,
    public trigger_public_address: string,
    public data: GamePlayCreatedActivityData | Record<string, never>,
    public kind: GameActivityKind,
    public occurred_at: number,
    public transaction_hash: string | null
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
