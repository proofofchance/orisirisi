import { ArrowUpTrayIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  PlayIcon,
} from '@heroicons/react/24/solid';
import { CoinflipGame, formatUSD } from '@orisirisi/coinflip';
import {
  ChainLogo,
  GameActivity,
  GameExpiryCountdown,
  GamesView,
  useCoinflipGame,
  useCoinflipGameActivities,
  useCoinflipGames,
  useGameExpiryCountdown,
} from '@orisirisi/coinflip-web-ui';
import { parseInteger } from '@orisirisi/orisirisi-data-utils';
import {
  ButtonProps,
  PropsWithClassName,
  cn,
} from '@orisirisi/orisirisi-web-ui';
import { useCurrentWeb3Account } from '@orisirisi/orisirisi-web3-ui';

import { useRouter } from 'next/router';
import { ReactNode, useMemo, useState } from 'react';
import toast from 'react-hot-toast';

type GamePageTabId = 'details' | 'proofs-of-chance' | 'activities';

export default function GamePage() {
  const { query } = useRouter();

  const id = parseInteger(query.id as string);

  const { currentWeb3Account } = useCurrentWeb3Account();

  const fetchGameParams = useMemo(
    () => (id ? { id, playerAddress: currentWeb3Account?.address } : null),
    [id, currentWeb3Account]
  );
  const maybeGame = useCoinflipGame(fetchGameParams);

  const maybeGameActivities = useCoinflipGameActivities(id);

  if (!(maybeGame.hasLoaded && maybeGameActivities.hasLoaded)) return null;

  const game = maybeGame.game!;
  const gameActivities = maybeGameActivities.gameActivities!;

  const getDefaultTabId = (): GamePageTabId => {
    if (game.is_awaiting_my_play_proof) {
      return 'proofs-of-chance';
    } else if (game.isOngoing()) {
      return 'details';
    }

    return 'activities';
  };

  const getTabs = () => {
    const tabs = [
      {
        title: 'Details',
        id: 'details',
        body: <GameDetails game={game} />,
      },
      {
        title: 'Activities',
        id: 'activities',
        body: (
          <div id="activities">
            {gameActivities.map((gameActivity, i) => (
              <GameActivity key={i} gameActivity={gameActivity} />
            ))}
          </div>
        ),
      },
    ];

    if (!game.is_in_play_phase) {
      tabs.push({
        title: 'Proofs Of Chance',
        id: 'proofs-of-chance',
        body: (
          <div id="proofs-of-chance">
            <div>List proofs Of Chance Here</div>
          </div>
        ),
      });
    }

    return tabs;
  };

  return (
    <>
      <div className="text-white mt-4">
        <div className="flex justify-between">
          <h2 className="text-xl">GAME #{id}</h2>
          <div className="w-4">
            <ChainLogo chain={game.getChain()} />
          </div>
        </div>

        <Tabs
          className="mt-4"
          defaultTabId={getDefaultTabId()}
          tabs={getTabs()}
        />
      </div>
      <ExploreOtherGamesView gameId={game.id} className="mt-20" />

      {game.isOngoing() && <CopyGameLinkButton className="fixed bottom-20" />}
      <MainControlButtons game={game} className="fixed bottom-8 right-20" />
    </>
  );
}

function ExploreOtherGamesView({
  gameId,
  className,
}: { gameId: number } & PropsWithClassName) {
  const { hasLoaded, isLoading, games } = useCoinflipGames({
    idToIgnore: gameId,
    pageSize: 10,
    statusFilter: 'ongoing',
  });

  if (!hasLoaded) return null;

  if (games!.length === 0) return null;

  return (
    <div className={cn('text-white mb-72', className)}>
      <h3 className="text-2xl">Explore Other Ongoing Games</h3>
      <GamesView className="mt-4" games={games!} isLoading={isLoading} />
    </div>
  );
}

function CopyGameLinkButton({ className }: PropsWithClassName) {
  const copyLink = async () => {
    await navigator.clipboard.writeText(window.location.href);

    toast.success('Game link copied successfully!', {
      position: 'bottom-center',
    });
  };
  return (
    <button
      onClick={copyLink}
      className={cn(
        'bg-white hover:bg-slate-100 text-black fill-current focus:outline-none border-[1px] border-white w-16 h-16 hover:w-[66px] hover:h-[66px] flex justify-center items-center rounded-full shadow-md transition duration-75 ease-in-out',
        className
      )}
    >
      <span className="flex flex-col gap-1 justify-center items-center">
        <ShareIcon size={22} />
        <span className="text-[8px]">Copy Link</span>
      </span>
    </button>
  );
}

function MainControlButtons({
  game,
  className,
}: { game: CoinflipGame } & PropsWithClassName) {
  const { push } = useRouter();

  const renderMainButton = () => {
    if (game.isExpired()) {
      return (
        <MainButton
          onClick={() => push(`/games/${game.id}/prove`)}
          icon={<ShieldCheckIcon className="h-8" />}
          label="Prove"
        />
      );
    } else if (game.is_awaiting_my_play_proof) {
      return (
        <MainButton
          onClick={() => console.log('Should trigger uploading proof')}
          icon={<ArrowUpTrayIcon className="h-8" />}
          label="Upload Proof"
        />
      );
    } else if (game.isOngoing()) {
      return (
        <MainButton
          onClick={() => push(`/games/${game.id}/play`)}
          icon={<PlayIcon className="h-8" />}
          label="Play"
        />
      );
    }

    throw new Error('Game state not handled for MainButton');
  };

  return (
    <div
      className={cn('text-white flex flex-col items-center gap-2', className)}
    >
      <button>
        <ChevronUpIcon className="h-8" />
      </button>
      <div className="flex gap-2">
        <button>
          <ChevronLeftIcon className="h-8" />
        </button>
        {renderMainButton()}
        <button>
          <ChevronRightIcon className="h-8" />
        </button>
      </div>
      <button>
        <ChevronDownIcon className="h-8" />
      </button>
    </div>
  );
}
function MainButton({
  onClick,
  icon,
  label,
}: ButtonProps & { icon: ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className="bg-transparent text-white hover:bg-white hover:text-black fill-current focus:outline-none border-[1px] border-white w-24 h-24 flex justify-center items-center rounded-full shadow-md"
    >
      <span className="flex flex-col gap-1 justify-center items-center">
        {icon}
        <span className="text-[10px]">{label}</span>
      </span>
    </button>
  );
}

function GameDetails({ game }: { game: CoinflipGame }) {
  const gameChainCurrency = game.getChain().getCurrency();
  const gameExpiryCountdown = useGameExpiryCountdown(game.expiry_timestamp);

  return (
    <div className="flex justify-center mt-8">
      <div id="game-details-container" className="w-96">
        <GameDetailRow
          label="Wager"
          detail={`${game.wager} ${gameChainCurrency} ~ USD ${formatUSD(
            game.wager_usd
          )}`}
        />
        {(game.isOngoing() || !gameExpiryCountdown.isFinished()) && (
          <GameDetailRow
            label="Time left to participate"
            detail={<GameExpiryCountdown countdown={gameExpiryCountdown} />}
          />
        )}
        <GameDetailRow
          label="Number of players"
          detail={`${game.total_players_required}`}
        />
        <GameDetailRow
          label="Required Players For Completion"
          detail={`${game.players_left}`}
        />
      </div>
    </div>
  );
}
function GameDetailRow({
  label,
  detail,
}: {
  label: string;
  detail: ReactNode;
}) {
  return (
    <div className="flex justify-between">
      <div>{label}</div>
      <div>{detail}</div>
    </div>
  );
}

interface TabsProps<TabId> extends PropsWithClassName {
  tabs: { title: string; id: TabId; body: ReactNode }[];
  defaultTabId?: TabId;
  bodyClassName?: string;
}
function Tabs<TabId>({
  tabs,
  className,
  defaultTabId,
  bodyClassName,
}: TabsProps<TabId>) {
  const bodies = tabs.map(({ body }) => body);
  const defaultTabIndex = tabs.findIndex((tab) => tab.id === defaultTabId) || 0;
  const [activeBodyIndex, setActiveBodyIndex] = useState(defaultTabIndex);

  const titles = tabs.map(({ title }) => title);
  const isActiveTitle = (i: number) => i === activeBodyIndex;

  return (
    <div
      className={cn(
        'rounded-xl bg-[rgba(0,0,0,0.25)] w-100 h-[500px]',
        className
      )}
    >
      <div className="flex">
        {titles.map((title, i) => {
          return (
            <div
              className={cn(
                'flex-1 text-center cursor-pointer transition duration-75 ease-in-out py-4',
                isActiveTitle(i) && 'border-b-2 border-white',
                'hover:bg-[rgba(0,0,0,0.28)]'
              )}
              onClick={() => setActiveBodyIndex(i)}
              key={i}
            >
              {title}
            </div>
          );
        })}
      </div>
      <div
        id="tab-body"
        className={cn('px-4 flex justify-center h-[320px]', bodyClassName)}
      >
        {bodies[activeBodyIndex]}
      </div>
    </div>
  );
}

export const ShareIcon = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox={`0 0 48 48`}>
    <path d="M31.605 6.838a1.25 1.25 0 0 0-2.105.912v5.472c-.358.008-.775.03-1.24.072c-1.535.142-3.616.526-5.776 1.505c-4.402 1.995-8.926 6.374-9.976 15.56a1.25 1.25 0 0 0 2.073 1.075c4.335-3.854 8.397-5.513 11.336-6.219a17.713 17.713 0 0 1 3.486-.497l.097-.003v5.535a1.25 1.25 0 0 0 2.105.912l12-11.25a1.25 1.25 0 0 0 0-1.824l-12-11.25Zm-.999 8.904l.02.002h.002h-.001A1.25 1.25 0 0 0 32 14.5v-3.865L40.922 19L32 27.365V23.5c0-.63-.454-1.16-1.095-1.24h-.003l-.004-.001l-.01-.001l-.028-.003a8.425 8.425 0 0 0-.41-.03a13.505 13.505 0 0 0-1.134-.006c-.966.034-2.33.17-3.983.566c-2.68.643-6.099 1.971-9.778 4.653c1.486-6.08 4.863-8.958 7.96-10.362c1.841-.834 3.635-1.168 4.975-1.292c.668-.062 1.216-.07 1.591-.064a9.837 9.837 0 0 1 .525.022ZM12.25 8A6.25 6.25 0 0 0 6 14.25v21.5A6.25 6.25 0 0 0 12.25 42h21.5A6.25 6.25 0 0 0 40 35.75V33.5a1.25 1.25 0 0 0-2.5 0v2.25a3.75 3.75 0 0 1-3.75 3.75h-21.5a3.75 3.75 0 0 1-3.75-3.75v-21.5a3.75 3.75 0 0 1 3.75-3.75h8.25a1.25 1.25 0 1 0 0-2.5h-8.25Z"></path>
  </svg>
);
