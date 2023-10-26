import { useEffect, useState } from 'react';
import {
  CoinflipGame,
  CoinflipGames,
  FetchCoinflipGamesParams,
} from '@orisirisi/coinflip';
import { useCurrentWeb3Account } from '@orisirisi/orisirisi-web3-ui';
import {
  ArrowPathIcon,
  CheckIcon,
  CurrencyDollarIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/router';

export type GamesPageFilter =
  | 'all'
  | 'available'
  | 'ongoing'
  | 'completed'
  | 'my_games';

export function GamesPage() {
  const { query } = useRouter();

  const { filter } = query;
  const games = useCoinflipGames({ filter } as { filter: GamesPageFilter });

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-4 text-white my-4">
        <button className="flex items-center gap-2 rounded-lg p-1 pl-4 border-solid border-[0.5px] border-gray-400">
          <RubikCubeIcon />
          <span>All</span>
        </button>
        <button className="flex items-center gap-2 rounded-lg p-1 pl-4 border-solid border-[0.5px] border-gray-400">
          <CurrencyDollarIcon className="h-5" />
          <span>Available</span>
        </button>
        <button className="flex items-center gap-2 rounded-lg p-1 pl-4 border-solid border-[0.5px] border-gray-400">
          <ArrowPathIcon className="h-5" />
          <span>Ongoing</span>
        </button>
        <button className="flex items-center gap-2 rounded-lg p-1 pl-4 border-solid border-[0.5px] border-gray-400">
          <CheckIcon className="h-5" />
          <span>Completed</span>
        </button>
        <button className="flex items-center gap-2 bg-[#2969FF] rounded-xl p-2 pl-4">
          <UserIcon className="h-5" />
          <span>My Games</span>
        </button>
      </div>
      <div className="text-white grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 pb-8">
        {games.map((game, i) => (
          <GameCard game={game} key={i} />
        ))}
      </div>
    </div>
  );
}

function GameCard({ game }: { game: CoinflipGame }) {
  return (
    <div className="rounded-lg h-64 bg-[rgba(0,0,0,0.25)] p-4">
      <div>#{game.id}</div>
      <div>
        <h4>Win SomeAmountHere</h4>
      </div>
      <div>
        <div></div>
        <div>Expires in </div>
      </div>
    </div>
  );
}

export default GamesPage;

function useCoinflipGames({ filter }: { filter?: GamesPageFilter }) {
  const { currentWeb3Account } = useCurrentWeb3Account();
  const [games, setGames] = useState<CoinflipGame[]>([]);

  useEffect(() => {
    const buildParams = (): FetchCoinflipGamesParams => {
      const params: FetchCoinflipGamesParams = {};

      switch (filter) {
        case 'all':
          break;
        case 'my_games':
          params.creator_address = currentWeb3Account!.address;
          break;
        default:
          params.status = filter;
      }

      return params;
    };

    CoinflipGames.fetch(buildParams()).then((games) => setGames(games));
  }, [filter, currentWeb3Account]);

  return games;
}

const RubikCubeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width={20} height={19} fill="none">
    <path
      fill="#fff"
      d="M1.113 5.51v3.723l3.4 1.963V7.269L1.125 5.315a1.46 1.46 0 0 0-.013.194ZM5.625 11.839l3.402 1.964V9.876L5.625 7.912v3.927ZM9.584 4.985 6.183 6.948l3.401 1.964 3.402-1.964-3.402-1.963ZM10.14 13.803l3.403-1.964V7.912L10.14 9.876v3.927ZM18.042 5.315l-3.386 1.954v3.927l3.4-1.963V5.51c0-.065-.005-.13-.014-.194ZM17.323 4.24l-3.224-1.862-3.402 1.964L14.1 6.305l3.387-1.955a1.453 1.453 0 0 0-.163-.11ZM12.986 1.736c-1.01-.584-1.97-1.138-2.67-1.54a1.467 1.467 0 0 0-1.465 0l-2.668 1.54 3.4 1.963 3.403-1.963ZM5.07 2.379A9104.3 9104.3 0 0 0 1.845 4.24c-.058.033-.113.07-.164.11l3.387 1.955L8.47 4.342 5.07 2.38ZM1.113 13.6c0 .522.28 1.008.732 1.268h.001l2.666 1.54v-3.927L1.113 10.52v3.08ZM5.625 17.051l3.226 1.863c.057.033.116.061.176.086v-3.912l-3.402-1.964v3.927ZM10.14 19c.06-.025.12-.053.177-.086l3.226-1.862v-3.928l-3.402 1.964V19ZM14.656 16.409a8771.13 8771.13 0 0 0 2.666-1.54c.453-.26.733-.747.733-1.27v-3.08l-3.399 1.962v3.928Z"
    />
  </svg>
);
