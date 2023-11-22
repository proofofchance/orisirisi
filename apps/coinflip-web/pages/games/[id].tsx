import { CoinflipGame, formatUSD } from '@orisirisi/coinflip';
import { ChainLogo, useCoinflipGame } from '@orisirisi/coinflip-web-ui';
import { parseInteger } from '@orisirisi/orisirisi-data-utils';
import { PropsWithClassName, cn } from '@orisirisi/orisirisi-web-ui';
import { useRouter } from 'next/router';
import { ReactNode, useState } from 'react';

export default function GamePage() {
  const { query, push } = useRouter();
  const id = parseInteger(query.id as string);
  const maybeGame = useCoinflipGame(id);

  if (!maybeGame.hasLoaded) return null;

  const game = maybeGame.game!;

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
          defaultTabIndex={0}
          tabs={[
            {
              title: 'Details',
              body: <GameDetails game={game} />,
            },
            {
              title: 'Activities',
              body: (
                <div id="activities">
                  <div id="activity-01">Some activity</div>
                </div>
              ),
            },
          ]}
        />
      </div>
      <div className="text-center">
        {game.is_ongoing && (
          <button
            onClick={() => push(`/games/${id}/play`)}
            className="bg-[#2969FF] text-white px-4 py-1 rounded-md shadow-md hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-200"
          >
            Play
          </button>
        )}
      </div>
    </>
  );
}

function GameDetails({ game }: { game: CoinflipGame }) {
  const gameChainCurrency = game.getChain().getCurrency();

  return (
    <div className="flex justify-center mt-4">
      <div id="game-details-container" className="w-96">
        <GameDetailRow
          label="Wager"
          detail={`${game.wager} ${gameChainCurrency} ~ USD ${formatUSD(
            game.wager_usd
          )}`}
        />
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

interface TabsProps extends PropsWithClassName {
  tabs: { title: string; body: ReactNode }[];
  defaultTabIndex?: number;
  bodyClassName?: string;
}
function Tabs({
  tabs,
  className,
  defaultTabIndex = 0,
  bodyClassName,
}: TabsProps) {
  const bodies = tabs.map(({ body }) => body);
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
      <div id="tab-body" className={cn('px-4', bodyClassName)}>
        {bodies[activeBodyIndex]}
      </div>
    </div>
  );
}
