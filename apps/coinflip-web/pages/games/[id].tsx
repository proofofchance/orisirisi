import { useCoinflipGame } from '@orisirisi/coinflip-web-ui';
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
      <div className="text-white">
        <h2 className="text-2xl">GAME #{id}</h2>

        <Tabs
          className="mt-4"
          tabs={[
            {
              title: 'Details',
              body: (
                <div id="game-details-container">
                  <div className="flex justify-between">
                    <div>Game</div>
                    <div></div>
                  </div>
                </div>
              ),
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

function Tabs({
  tabs,
  className,
}: { tabs: { title: string; body: ReactNode }[] } & PropsWithClassName) {
  const bodies = tabs.map(({ body }) => body);
  const [activeBodyIndex, setActiveBodyIndex] = useState(0);

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
      <div className="px-4">{bodies[activeBodyIndex]}</div>
    </div>
  );
}
