import { PropsWithChildren } from 'react';
import {
  CoinflipGame,
  CoinflipGameActivity,
  CoinflipGameStatus,
  coinSideToString,
} from '@orisirisi/coinflip';
import { ChevronUpIcon } from '@heroicons/react/24/outline';
import { Web3Account } from '@orisirisi/orisirisi-web3';
import { Tooltip } from 'react-tooltip';
import {
  GameProofOfChance,
  UnrevealedGameProofOfChance,
} from './game-proof-of-chance';
import { shortenPublicAddress } from '../data-utils';

export function GameActivitiesView({
  gameActivities,
  currentWeb3Account,
  game,
}: {
  gameActivities: CoinflipGameActivity[];
  currentWeb3Account: Web3Account | null;
  game: CoinflipGame;
}) {
  return (
    <>
      <h3 className="text-2xl mt-8 mb-6">Activities</h3>

      <Tooltip id="unrevealed-poc-tooltip" place="bottom" />

      {/* TODO: GameStatus Activity for a Completed Game  */}
      <GameStatusActivity
        status={game.status}
        expiryTimestamp={game.getExpiryTimestampMs()}
      />
      {gameActivities.map((gameActivity, i) => {
        const maybeProofOfChance = game.getProofOfChanceByPlayerAddress(
          gameActivity.trigger_public_address
        );

        return (
          <div key={i}>
            <GameActivityDivider />
            <GameActivity
              currentAccountAddress={
                currentWeb3Account ? currentWeb3Account.getAddress() : null
              }
              gameActivity={gameActivity}
            >
              {gameActivity.isGamePlayChanceRevealedKind() &&
                !maybeProofOfChance && (
                  <UnrevealedGameProofOfChance
                    playerAddress={gameActivity.trigger_public_address}
                    data-tooltip-id="unrevealed-poc-tooltip"
                    data-tooltip-content="Proof will be revealed after every player has uploaded"
                  />
                )}
              {gameActivity.isGamePlayChanceRevealedKind() &&
                maybeProofOfChance && (
                  <GameProofOfChance
                    gameId={game.id}
                    proofOfChance={maybeProofOfChance!}
                  />
                )}
            </GameActivity>
          </div>
        );
      })}
    </>
  );
}

function GameStatusActivity({
  status,
  expiryTimestamp,
}: {
  status: CoinflipGameStatus;
  expiryTimestamp: number;
}) {
  const getReportAndTimestamp = () => {
    switch (status) {
      case 'ongoing':
        return [
          'Awaiting participating players...',
          new Date().toLocaleString(),
        ];
      case 'expired':
        return ['Game expired!', new Date(expiryTimestamp).toLocaleString()];
      case 'awaiting_revealed_chances':
        return [
          'Awaiting proof uploads from all players...',
          new Date().toLocaleString(),
        ];
      default:
        return null;
    }
  };
  const reportAndTimestamp = getReportAndTimestamp();

  if (!reportAndTimestamp) return null;

  const [report, timestamp] = reportAndTimestamp;

  return (
    <div className="flex flex-col rounded-lg bg-[rgba(0,0,0,0.25)] hover:bg-[rgba(0,0,0,0.5)] cursor-pointer p-4 hover:p-5 transition-all mt-2">
      <p className="pb-4">{report}</p>
      <span className="text-xs self-end">{timestamp}</span>
    </div>
  );
}

function GameActivity({
  currentAccountAddress,
  gameActivity,
  children,
}: {
  currentAccountAddress: string | null;
  gameActivity: CoinflipGameActivity;
} & PropsWithChildren) {
  const triggerPublicAddress = shortenPublicAddress(
    gameActivity.trigger_public_address
  );
  const triggerIsMe =
    currentAccountAddress === gameActivity.trigger_public_address;

  const getReport = () => {
    switch (gameActivity.kind) {
      case 'game_created':
        return getGameCreatedReport();
      case 'game_play_created':
        return getGamePlayCreatedReport();
      case 'game_play_chance_revealed':
        return getPlayChanceCreatedReport();
      default:
        throw new Error(`Unknown game activity kind ${gameActivity.kind}`);
    }
  };

  const getGameCreatedReport = () => {
    if (triggerIsMe) {
      return 'You created this game';
    }
    return `This game was created by ${triggerPublicAddress}`;
  };

  const getGamePlayCreatedReport = () => {
    const coinSide = coinSideToString(
      gameActivity.getPlayCreatedData().coin_side
    );

    if (triggerIsMe) {
      return `You predict ${coinSide}`;
    }
    return `Player:${triggerPublicAddress} predicts ${coinSide}`;
  };

  const getPlayChanceCreatedReport = () => {
    if (triggerIsMe) {
      return 'You uploaded your game play proof';
    }
    return `Player:${triggerPublicAddress} uploaded their game play proof`;
  };

  const activityReadableTimestamp = new Date(
    gameActivity.getOccurredAtMs()
  ).toLocaleString();

  return (
    <div className="flex flex-col rounded-lg bg-[rgba(0,0,0,0.25)] hover:bg-[rgba(0,0,0,0.5)] cursor-pointer p-4 hover:p-5 transition-all my-2">
      <p className="pb-4">{getReport()}</p>
      {children}
      <span className="mt-2 text-xs self-end">{activityReadableTimestamp}</span>
    </div>
  );
}

function GameActivityDivider() {
  return (
    <div className="flex flex-col justify-center items-center">
      <ChevronUpIcon className="h-3 relative top-1" />
      <div className="border-dashed border-l border-gray-300 h-14 relative -top-1"></div>
    </div>
  );
}
