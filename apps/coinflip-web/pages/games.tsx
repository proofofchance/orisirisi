import { PropsWithChildren, useEffect, useState } from 'react';
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
import { cn, useIsClient } from '@orisirisi/orisirisi-web-ui';

export type GamesPageFilter =
  | 'all'
  | 'available'
  | 'ongoing'
  | 'completed'
  | 'my_games';

export function GamesPage() {
  const { query } = useRouter();

  const currentFilter = (query.filter ?? 'all') as GamesPageFilter;
  const { games, isLoading } = useCoinflipGames({ filter: currentFilter });

  return (
    <div>
      <GamesFilterButtons currentFilter={currentFilter} />
      <GamesView games={games} isLoading={isLoading} />
    </div>
  );
}

function GamesFilterButtons({
  currentFilter,
}: {
  currentFilter: GamesPageFilter;
}) {
  const isClient = useIsClient();
  const { currentWeb3Account } = useCurrentWeb3Account();

  return (
    <>
      {isClient && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-4 text-white mt-4 mb-8">
          <GamesFilterButton currentFilter={currentFilter} filter="all">
            <RubikCubeIcon />
            <span>All</span>
          </GamesFilterButton>
          <GamesFilterButton currentFilter={currentFilter} filter="available">
            <CurrencyDollarIcon className="h-5" />
            <span>Available</span>
          </GamesFilterButton>
          <GamesFilterButton currentFilter={currentFilter} filter="ongoing">
            <ArrowPathIcon className="h-5" />
            <span>Ongoing</span>
          </GamesFilterButton>
          <GamesFilterButton currentFilter={currentFilter} filter="completed">
            <CheckIcon className="h-5" />
            <span>Completed</span>
          </GamesFilterButton>
          {currentWeb3Account && (
            <GamesFilterButton currentFilter={currentFilter} filter="my_games">
              <UserIcon className="h-5" />
              <span>My Games</span>
            </GamesFilterButton>
          )}
        </div>
      )}
    </>
  );
}
function GamesFilterButton({
  filter,
  currentFilter,
  children,
}: {
  filter: GamesPageFilter;
  currentFilter: GamesPageFilter;
} & PropsWithChildren) {
  const activeClass = 'bg-[#2969FF]';
  const inactiveClass = 'border-solid border-[0.5px] border-gray-400';

  const { push } = useRouter();

  return (
    <button
      onClick={() => push({ pathname: 'games', query: { filter } })}
      className={cn(
        'flex items-center gap-2 rounded-lg p-1 pl-4',
        filter === currentFilter ? activeClass : inactiveClass
      )}
    >
      {children}
    </button>
  );
}

function GamesView({
  games,
  isLoading,
}: {
  games: CoinflipGame[];
  isLoading: boolean;
}) {
  if (!isLoading && games.length == 0) return <GamesEmptyView />;

  return (
    <div className="text-white grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 pb-8">
      {games.map((game, i) => (
        <GameCard game={game} key={i} />
      ))}
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

function GamesEmptyView() {
  return (
    <div className="flex flex-col justify-center items-center text-white mt-28 text-center">
      <GamesEmptyIcon />
      <h4 className="mt-5 w-80 text-lg">Oops! No games found currently</h4>
      <p className="text-[#BDBDBD] w-56">
        Please try again later or use a different filter
      </p>
    </div>
  );
}

export default GamesPage;

function useCoinflipGames({ filter }: { filter?: GamesPageFilter }) {
  const { currentWeb3Account } = useCurrentWeb3Account();
  const [isLoading, setIsLoading] = useState(false);
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

    setIsLoading(true);
    CoinflipGames.fetch(buildParams())
      .then((games) => setGames(games))
      .then(() => setIsLoading(false));
  }, [filter, currentWeb3Account]);

  return { games, isLoading };
}

const RubikCubeIcon = () => (
  <svg width={20} height={19} fill="none">
    <path
      fill="#fff"
      d="M1.113 5.51v3.723l3.4 1.963V7.269L1.125 5.315a1.46 1.46 0 0 0-.013.194ZM5.625 11.839l3.402 1.964V9.876L5.625 7.912v3.927ZM9.584 4.985 6.183 6.948l3.401 1.964 3.402-1.964-3.402-1.963ZM10.14 13.803l3.403-1.964V7.912L10.14 9.876v3.927ZM18.042 5.315l-3.386 1.954v3.927l3.4-1.963V5.51c0-.065-.005-.13-.014-.194ZM17.323 4.24l-3.224-1.862-3.402 1.964L14.1 6.305l3.387-1.955a1.453 1.453 0 0 0-.163-.11ZM12.986 1.736c-1.01-.584-1.97-1.138-2.67-1.54a1.467 1.467 0 0 0-1.465 0l-2.668 1.54 3.4 1.963 3.403-1.963ZM5.07 2.379A9104.3 9104.3 0 0 0 1.845 4.24c-.058.033-.113.07-.164.11l3.387 1.955L8.47 4.342 5.07 2.38ZM1.113 13.6c0 .522.28 1.008.732 1.268h.001l2.666 1.54v-3.927L1.113 10.52v3.08ZM5.625 17.051l3.226 1.863c.057.033.116.061.176.086v-3.912l-3.402-1.964v3.927ZM10.14 19c.06-.025.12-.053.177-.086l3.226-1.862v-3.928l-3.402 1.964V19ZM14.656 16.409a8771.13 8771.13 0 0 0 2.666-1.54c.453-.26.733-.747.733-1.27v-3.08l-3.399 1.962v3.928Z"
    />
  </svg>
);

const GamesEmptyIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width={81} height={80} fill="none">
    <g clipPath="url(#a)">
      <mask
        id="b"
        width={81}
        height={80}
        x={0}
        y={0}
        maskUnits="userSpaceOnUse"
        style={{
          maskType: 'luminance',
        }}
      >
        <path fill="#fff" d="M.5 0h80v80H.5V0Z" />
      </mask>
      <g
        stroke="#fff"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2.5}
        mask="url(#b)"
      >
        <path
          strokeMiterlimit={22.926}
          d="M74.08 47.527a29.548 29.548 0 0 0 4.858-16.277c0-16.396-13.292-29.688-29.688-29.688S19.562 14.854 19.562 31.25c0 16.395 13.292 29.687 29.688 29.687a29.56 29.56 0 0 0 13.56-3.271"
        />
        <path
          strokeMiterlimit={22.926}
          d="M38.336 10.505A23.333 23.333 0 0 1 49.25 7.812c12.944 0 23.438 10.493 23.438 23.438a23.33 23.33 0 0 1-4.316 13.555m-17.689 9.839c-.56.04-.862.043-1.433.043-12.944 0-23.438-10.493-23.438-23.437 0-3.941.974-7.654 2.693-10.913M31.667 55.342 10.999 76.909c-2.038 2.038-5.371 2.038-7.408 0-2.038-2.037-2.038-5.37 0-7.408L25.016 48.97M19.313 55.31l5.876 5.877M41.438 31.25h0M49.25 31.25h.001M57.063 31.25h0"
        />
        <path
          strokeMiterlimit={22.926}
          d="M54.594 57.662h20.828a3.526 3.526 0 0 0 3.515-3.515 3.526 3.526 0 0 0-3.515-3.516 4.83 4.83 0 0 0-6.103-4.292 7.478 7.478 0 0 0-13.893 3.845h-.807a3.75 3.75 0 0 0-3.74 3.739c0 2.032 1.676 3.74 3.715 3.74ZM27.714 10.569a4.827 4.827 0 0 0-5.46-2.224A7.478 7.478 0 0 0 8.36 12.19h-.807a3.75 3.75 0 0 0-3.74 3.738c0 2.033 1.675 3.74 3.715 3.74h14.114"
        />
        <path strokeMiterlimit={2.613} d="M32.676 14.677h0" />
      </g>
    </g>
    <defs>
      <clipPath id="a">
        <path fill="#fff" d="M.5 0h80v80H.5z" />
      </clipPath>
    </defs>
  </svg>
);
