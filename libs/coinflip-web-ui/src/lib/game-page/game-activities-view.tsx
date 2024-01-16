import { PropsWithChildren, useEffect, useState } from 'react';
import {
  CoinSide,
  CoinflipGame,
  CoinflipGameActivity,
  CoinflipGamePlayStatus,
  CoinflipGameStatus,
  coinSideToString,
} from '@orisirisi/coinflip';
import { ChevronUpIcon } from '@heroicons/react/24/outline';
import { Web3Account } from '@orisirisi/orisirisi-web3';
import { Tooltip } from 'react-tooltip';
import {
  GamePlayProofOfChance,
  UnrevealedGamePlayProofOfChance,
} from './game-play-proof-of-chance';
import { shortenPublicAddress } from '../data-utils';
import styled from 'styled-components';
import { PropsWithClassName, cn } from '@orisirisi/orisirisi-web-ui';
import { useCurrentChain } from '@orisirisi/orisirisi-web3-ui';
import { GameProofOfChance } from './game-proof-of-chance';
import { PublicProofOfChance } from '@orisirisi/proof-of-chance';

export function GameActivitiesView({
  gameActivities,
  currentWeb3Account,
  game,
}: {
  gameActivities: CoinflipGameActivity[];
  currentWeb3Account: Web3Account | null;
  game: CoinflipGame;
}) {
  const topActivityView = () => {
    if (game.isCompleted())
      return (
        <>
          <GameOutcomeActivity gameOutcome={game.outcome!} />
          <GameProofOfChanceActivity
            gameId={game.id}
            proofOfChances={game.public_proof_of_chances!}
          />
        </>
      );

    if (
      !game.isCompleted() &&
      CoinflipGameActivity.countActivityKind(
        gameActivities,
        'game_play_chance_revealed'
      ) === game.total_players_required
    )
      return (
        <div className="flex flex-col rounded-lg bg-[rgba(0,0,0,0.25)] p-4 transition-all mt-2">
          <p className="text-sm m-2">Game Coin is currently flipping.</p>

          <Coin side={null} flipInfinitely className="self-center" />

          <p className="text-sm self-end mt-6 mb-2">
            The outcome will be shown in any moment from now...
          </p>
        </div>
      );

    return (
      <GameStatusActivity
        status={game.status}
        expiryTimestampMs={game.getExpiryTimestampMs()}
        completedAtMs={game.getCompletedAtMs()}
      />
    );
  };

  return (
    <>
      <h3 className="text-2xl mt-8 mb-6">Activities</h3>

      <Tooltip id="unrevealed-poc-tooltip" place="bottom" />

      {game.isCompleted() && game.iHavePlayed() && (
        <WonOrLostCard
          gamePlayStatus={
            game.getGamePlayByPlayerAddress(currentWeb3Account!.address)!.status
          }
          amountForEachWinner={game.amount_for_each_winner!}
          amountForEachWinnerUsd={game.amount_for_each_winner_usd!}
        />
      )}

      {topActivityView()}

      {gameActivities.map((gameActivity, i) => {
        const maybeProofOfChance = game.getProofOfChanceByPlayerAddress(
          gameActivity.trigger_public_address
        );

        return (
          <div key={i}>
            <TimelineArrow />
            <GameActivity
              currentAccountAddress={
                currentWeb3Account ? currentWeb3Account.getAddress() : null
              }
              gameActivity={gameActivity}
            >
              {gameActivity.isGamePlayChanceRevealedKind() &&
                !maybeProofOfChance && (
                  <UnrevealedGamePlayProofOfChance
                    playerAddress={gameActivity.trigger_public_address}
                    data-tooltip-id="unrevealed-poc-tooltip"
                    data-tooltip-content="Proof will be revealed after every player has uploaded"
                  />
                )}
              {gameActivity.isGamePlayChanceRevealedKind() &&
                maybeProofOfChance && (
                  <GamePlayProofOfChance
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

function WonOrLostCard({
  gamePlayStatus,
  amountForEachWinner,
  amountForEachWinnerUsd,
}: {
  gamePlayStatus: CoinflipGamePlayStatus;
  amountForEachWinner: number;
  amountForEachWinnerUsd: number;
}) {
  const currentChain = useCurrentChain()!;

  const getWonOrLostContent = () => {
    if (gamePlayStatus === 'won') {
      return (
        <>
          <span role="img" aria-label="congrats-text">
            Congrats 🎊
          </span>
          <span>
            You won{' '}
            <b className="tracking-wide">
              {amountForEachWinner} {currentChain.getCurrency()} ~ $
              {amountForEachWinnerUsd}
            </b>{' '}
            from this game.
          </span>
        </>
      );
    } else {
      return (
        <span className="text-lg" role="img" aria-label="lost-text">
          Ouch! 😔 You lost this game. Better luck next time!
        </span>
      );
    }
  };

  return (
    <div className="flex flex-col rounded-lg bg-[rgba(0,0,0,0.25)] p-6 transition-all mb-2">
      <div className="flex flex-col items-center">{getWonOrLostContent()}</div>
    </div>
  );
}

function GameOutcomeActivity({ gameOutcome }: { gameOutcome: CoinSide }) {
  return (
    <div className="flex flex-col rounded-lg bg-[rgba(0,0,0,0.25)] p-4 transition-all mt-2">
      <h3 className="text-xl">Game Outcome</h3>
      <Coin className="self-center" side={gameOutcome} />
      <span className="text-xs self-end">{new Date().toLocaleString()}</span>
    </div>
  );
}

function GameProofOfChanceActivity({
  gameId,
  proofOfChances,
}: {
  gameId: number;
  proofOfChances: PublicProofOfChance[];
}) {
  return (
    <div className="flex flex-col rounded-lg bg-[rgba(0,0,0,0.25)] p-4 transition-all mt-2">
      <h3 className="text-lg mb-2">
        Game's Proof of Chance{' '}
        <span className="text-xs">(used to determine outcome)</span>
      </h3>
      <GameProofOfChance gameId={gameId} proofOfChances={proofOfChances} />

      <span className="text-xs self-end">{new Date().toLocaleString()}</span>
    </div>
  );
}

function Coin({
  side,
  className,
  flipInfinitely = false,
}: { side: CoinSide | null; flipInfinitely?: boolean } & PropsWithClassName) {
  const [isFlipping, setIsFlipping] = useState(true);

  useEffect(() => {
    if (isFlipping && !flipInfinitely) {
      const FLIP_ANIMATION_MS = 2 * 1000;

      const timeoutId = setTimeout(() => {
        setIsFlipping(false);
      }, FLIP_ANIMATION_MS);

      return () => {
        clearInterval(timeoutId);
      };
    }
  }, [isFlipping, flipInfinitely, setIsFlipping]);

  return (
    <CoinShell onClick={() => setIsFlipping(true)} className={className}>
      <div
        className={cn(
          'bg-slate-400 w-14 h-14 flex justify-center items-center text-black rounded-full',
          isFlipping && 'animate-flip'
        )}
      >
        <div className="bg-white w-12 h-12 flex justify-center items-center text-black rounded-full text-sm">
          {isFlipping ? '~' : coinSideToString(side)}
        </div>
      </div>
    </CoinShell>
  );
}

const CoinShell = styled.div`
  @keyframes flip {
    from {
      transform: rotateX(0);
    }
    to {
      transform: rotateX(180deg);
    }
  }

  .animate-flip {
    /* animation: flip 2s linear infinite; */
    animation: flip 0.25s ease-in-out infinite;
    animation-fill-mode: forwards;
  }
`;

function GameStatusActivity({
  status,
  expiryTimestampMs,
}: {
  status: CoinflipGameStatus;
  expiryTimestampMs: number;
  completedAtMs: number | null;
}) {
  const getReportAndTimestamp = () => {
    switch (status) {
      case 'ongoing':
        return [
          'Awaiting participating players...',
          new Date().toLocaleString(),
        ];
      case 'expired':
        return ['Game expired!', new Date(expiryTimestampMs).toLocaleString()];
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
    <div className="flex flex-col rounded-lg bg-[rgba(0,0,0,0.25)] p-4 transition-all mt-2">
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
      return 'You uploaded your proof of chance';
    }
    return `Player:${triggerPublicAddress} uploaded their proof of chance`;
  };

  const activityReadableTimestamp = new Date(
    gameActivity.getOccurredAtMs()
  ).toLocaleString();

  return (
    <div className="flex flex-col rounded-lg bg-[rgba(0,0,0,0.25)] p-4 transition-all my-2">
      <p className="pb-4">{getReport()}</p>
      {children}
      <span className="mt-2 text-xs self-end">{activityReadableTimestamp}</span>
    </div>
  );
}

function TimelineArrow() {
  return (
    <div className="flex flex-col justify-center items-center">
      <ChevronUpIcon className="h-3 relative top-1" />
      <div className="border-dashed border-l border-gray-300 h-14 relative -top-1"></div>
    </div>
  );
}
