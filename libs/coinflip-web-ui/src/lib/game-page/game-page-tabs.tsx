import { CoinflipGame, CoinflipGameActivity } from '@orisirisi/coinflip';
import { Web3Account } from '@orisirisi/orisirisi-web3';
import { Tabs } from './game-page-tabs/tabs';
import { GameDetails } from './game-page-tabs/game-details';
import { GameActivity } from './game-page-tabs/game-activity';

type GamePageTabId = 'details' | 'proofs-of-chance' | 'activities';

export function GamePageTabs({
  currentWeb3Account,
  game,
  gameActivities,
}: {
  currentWeb3Account: Web3Account;
  game: CoinflipGame;
  gameActivities: CoinflipGameActivity[];
}) {
  const getDefaultTabId = (): GamePageTabId => {
    if (game.is_awaiting_my_play_proof) {
      return 'proofs-of-chance';
    }
    if (game.isOngoing() && game.iHaveNotPlayed()) {
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
              <GameActivity
                key={i}
                currentAccountAddress={currentWeb3Account.getAddress()}
                gameActivity={gameActivity}
              />
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
    <Tabs className="mt-4" defaultTabId={getDefaultTabId()} tabs={getTabs()} />
  );
}