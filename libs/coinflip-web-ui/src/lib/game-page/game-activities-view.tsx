import { PropsWithChildren, useEffect, useState } from 'react';
import {
  CoinSide,
  CoinflipGame,
  CoinflipGameActivity,
  CoinflipGamePlayStatus,
  CoinflipGameStatus,
  coinSideToString,
  formatUSD,
} from '@orisirisi/coinflip';
import { ChevronUpIcon } from '@heroicons/react/24/outline';
import { Web3Account } from '@orisirisi/orisirisi-web3';
import { Tooltip } from 'react-tooltip';
import {
  GamePlayProofOfChance,
  UnrevealedGamePlayProofOfChance,
} from './game-play-proof-of-chance';
import { shortenPublicAddress, shortenSHA256 } from '../data-utils';
import styled from 'styled-components';
import { PropsWithClassName, cn } from '@orisirisi/orisirisi-web-ui';
import { GameProofOfChance } from './game-proof-of-chance';
import { ChainExplorer } from '@orisirisi/orisirisi-web3-chains';
import { timeAgo } from '@orisirisi/orisirisi-data-utils';
import { DocumentDuplicateIcon } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';

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
          <GameOutcomeActivity game={game} />
          <GameProofOfChanceActivity game={game} />
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
          <p className="text-sm m-2">
            This game's coin is currently flipping...
          </p>

          <Coin side={null} flipInfinitely className="self-center" />

          <p className="text-sm self-end mt-6 mb-2">
            ...Refresh to see the outcome in a minute
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

  let myGameStatus = null;
  if (game.isCompleted() && game.iHavePlayed()) {
    const gamePlay = game.getGamePlayByPlayerAddress(
      currentWeb3Account!.address
    );

    myGameStatus = gamePlay ? gamePlay.status : null;
  }

  return (
    <>
      <h3 className="text-2xl mt-8 mb-6">Activities</h3>

      <Tooltip id="unrevealed-poc-tooltip" place="bottom" />

      {game.isRefunded() && (
        <div className="flex flex-col rounded-lg bg-[rgba(0,0,0,0.25)] p-6 transition-all mb-2">
          <div className="flex flex-col items-center">
            All participating players got refunded
          </div>
        </div>
      )}
      {game.isCompleted() && (
        <WonOrLostCard game={game} gamePlayStatus={myGameStatus} />
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
              proofOfChance={
                game.getGamePlayByPlayerAddress(
                  gameActivity.trigger_public_address
                )?.proof_of_chance
              }
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
  game,
  gamePlayStatus,
}: {
  game: CoinflipGame;
  gamePlayStatus: CoinflipGamePlayStatus | null;
}) {
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
              {game.amount_for_each_winner} {game.getChain().getCurrency()} ~
              {formatUSD(game.amount_for_each_winner_usd!, 0)}
            </b>{' '}
            from this game.
          </span>
        </>
      );
    } else if (gamePlayStatus === 'lost') {
      return (
        <span className="text-lg" role="img" aria-label="lost-text">
          Oh no! 😔 You lost this game. Better luck next time!
        </span>
      );
    }

    return (
      <span>
        <span role="img" aria-label="congrats-text">
          🎉
        </span>{' '}
        Players that predicted {coinSideToString(game.outcome)} won{' '}
        <b className="tracking-wide">
          {formatUSD(game.amount_shared_with_winners_usd!, 0)}
        </b>{' '}
        <span role="img" aria-label="congrats-text">
          🎉
        </span>
      </span>
    );
  };

  return (
    <div className="flex flex-col rounded-lg bg-[rgba(0,0,0,0.25)] p-6 transition-all mb-2">
      <div className="flex flex-col items-center">{getWonOrLostContent()}</div>
    </div>
  );
}

function GameOutcomeActivity({ game }: { game: CoinflipGame }) {
  return (
    <div className="flex flex-col rounded-lg bg-[rgba(0,0,0,0.25)] p-4 transition-all mt-2">
      <h3 className="text-xl">Game Outcome</h3>
      <Coin className="self-center" side={game.outcome} />
      <span className="text-xs self-end">
        {formatTime(new Date(game.getCompletedAtMs()!))}
      </span>
    </div>
  );
}

function GameProofOfChanceActivity({ game }: { game: CoinflipGame }) {
  return (
    <div className="flex flex-col rounded-lg bg-[rgba(0,0,0,0.25)] p-4 transition-all mt-2">
      <h3 className="text-lg mb-2">
        Game's Proof of Chance{' '}
        <span className="text-xs">(used to determine outcome)</span>
      </h3>
      <GameProofOfChance
        gameId={game.id}
        proofOfChances={game.public_proof_of_chances!}
      />

      <span className="text-xs self-end">
        {formatTime(new Date(game.getCompletedAtMs()!))}
      </span>
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
      const FLIP_ANIMATION_MS = 1 * 1000;

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
    animation: flip 0.25s linear infinite;
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
      case 'awaiting_players':
        return [
          'Awaiting participating players. Play or share this game in your network.',
          formatTime(new Date()),
        ];
      case 'expired':
        return ['Game expired!', formatTime(new Date(expiryTimestampMs))];
      case 'awaiting_revealed_chances':
        return [
          'Awaiting proof uploads from all players...',
          formatTime(new Date()),
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

function SmallCopyButton({
  copyText,
  copyTip,
  afterCopyMessage = 'Copied successfully!',
}: {
  copyText: string;
  copyTip: string;
  afterCopyMessage?: string;
}) {
  const copy = async () => {
    await navigator.clipboard.writeText(copyText);

    toast.success(afterCopyMessage, {
      position: 'bottom-center',
    });
  };

  const toolTipId = `copy-tip-about-${copyText}`;

  return (
    <>
      <Tooltip id={toolTipId} />
      <div
        onClick={copy}
        className="inline-block cursor-pointer"
        data-tooltip-id={toolTipId}
        data-tooltip-content={copyTip}
      >
        <DocumentDuplicateIcon className="h-4 w-4 relative top-[2px]" />
      </div>
    </>
  );
}

function GameActivity({
  currentAccountAddress,
  gameActivity,
  children,
  proofOfChance,
}: {
  currentAccountAddress: string | null;
  gameActivity: CoinflipGameActivity;
  proofOfChance?: string;
} & PropsWithChildren) {
  const triggerPublicAddress = shortenPublicAddress(
    gameActivity.trigger_public_address
  );
  const shortenedProofOfChance = proofOfChance
    ? shortenSHA256(proofOfChance)
    : null;

  const triggerIsMe =
    currentAccountAddress === gameActivity.trigger_public_address;

  const getReport = () => {
    switch (gameActivity.kind) {
      case 'game_created':
        return getGameCreatedReport();
      case 'game_play_created':
        return getGamePlayCreatedReport();
      case 'game_play_chance_revealed':
        return getPlayChanceUploadedReport();
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

    const proofOfChancePart = (
      <>
        with ProofofChance:
        <span
          className="cursor-pointer"
          data-tooltip-id="unshortened-proof-of-chance"
          data-tooltip-content={proofOfChance}
        >
          {shortenedProofOfChance}
        </span>{' '}
        <SmallCopyButton
          copyText={proofOfChance!}
          copyTip="Copy ProofofChance"
        />
      </>
    );

    if (triggerIsMe) {
      return (
        <>
          You predict {coinSide} {proofOfChancePart}
        </>
      );
    }
    return (
      <>
        Player:{triggerPublicAddress} predicts {coinSide} {proofOfChancePart}
      </>
    );
  };

  const getPlayChanceUploadedReport = () => {
    if (triggerIsMe) {
      return 'You uploaded your proof of chance';
    }
    return `Player:${triggerPublicAddress} uploaded their proof of chance`;
  };

  const activityReadableTimestamp = formatTime(
    new Date(gameActivity.getOccurredAtMs())
  );

  return (
    <div className="flex flex-col rounded-lg bg-[rgba(0,0,0,0.25)] p-4 transition-all my-2">
      <Tooltip id="unshortened-proof-of-chance" />
      <p className="pb-4 break-words">{getReport()}</p>
      {children}
      {gameActivity.transaction_hash ? (
        <div className="flex mt-2 justify-between">
          <a
            href={ChainExplorer.getTransactionLink(
              gameActivity.chain_id,
              gameActivity.transaction_hash
            )}
            target="_blank"
            rel="noreferrer"
            className="text-xs underline"
          >
            View transaction
          </a>
          <span className="text-xs">{activityReadableTimestamp}</span>
        </div>
      ) : (
        <span className="text-xs mt-2 self-end">
          {activityReadableTimestamp}
        </span>
      )}
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

export const formatTime = (time: Date): string => {
  const isMoreThan3DaysAway =
    Math.abs(time.getTime() - new Date().getTime()) > 3 * 3600 * 1000;

  if (isMoreThan3DaysAway) {
    return time.toLocaleString();
  }
  return timeAgo(time).toString();
};
