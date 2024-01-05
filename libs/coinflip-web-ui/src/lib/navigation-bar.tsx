import Link from 'next/link';
import { PropsWithClassName, useIsClient } from '@orisirisi/orisirisi-web-ui';
import { BackgroundWrapper } from './background';
import {
  ConnectWalletButton,
  ConnectWalletOptionsModal,
} from './navigation-bar/connect-wallet-button';
import { CurrentAccountButton } from './navigation-bar/current-account-button';
import { useCurrentWeb3Account } from '@orisirisi/orisirisi-web3-ui';
import { useCoinflipOngoingGameActivities } from './hooks';
import { BrowserStorage } from '@orisirisi/orisirisi-browser';
import { Tooltip } from 'react-tooltip';

export { ConnectWalletOptionsModal } from './navigation-bar/connect-wallet-button';

export function NavigationBar({ className }: PropsWithClassName) {
  const isClient = useIsClient();
  const { currentWeb3Account } = useCurrentWeb3Account();

  const isNotConnected = !currentWeb3Account;

  return (
    <>
      <ConnectWalletOptionsModal />
      <BackgroundWrapper className={className}>
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Link href="/" className="text-white text-xl font-semibold">
              Coinflip
            </Link>
          </div>
          <div className={`text-white md:flex gap-x-6 items-center`}>
            <Link href="/games" className="mr-4">
              Browse Games
            </Link>
            {isNotConnected && <Tooltip id="create-game-link-tooltip" />}
            {isClient && isNotConnected ? (
              <div
                className="cursor-not-allowed opacity-70"
                data-tooltip-id="create-game-link-tooltip"
                data-tooltip-content="Connect wallet first →"
              >
                Create Game
              </div>
            ) : (
              <Link href="/create-game" className="mr-4">
                Create Game
              </Link>
            )}

            {isClient && currentWeb3Account && (
              <UnreadGameActivityCount
                publicAddress={currentWeb3Account.address!}
              />
            )}
            {isClient && currentWeb3Account ? (
              <CurrentAccountButton
                publicAddress={currentWeb3Account.address!}
              />
            ) : (
              <ConnectWalletButton />
            )}
          </div>
        </div>
      </BackgroundWrapper>
    </>
  );
}

function UnreadGameActivityCount({ publicAddress }: { publicAddress: string }) {
  const { gameActivities: ongoingGameActivities, hasLoaded } =
    useCoinflipOngoingGameActivities(publicAddress);

  if (!hasLoaded) return null;

  const lastReadGameActivityBlockTimestamp =
    LastReadGameActivityBlockTimestamp.get();

  const unreadGameActivities = ongoingGameActivities!.filter(
    (gameActivity) =>
      gameActivity.block_timestamp > lastReadGameActivityBlockTimestamp
  );

  const readUnreadGameActivities = () => {
    const latestGameActivityBlockTimestamp = Math.max(
      ...unreadGameActivities.map((a) => a.block_timestamp)
    );

    LastReadGameActivityBlockTimestamp.set(latestGameActivityBlockTimestamp);
  };

  return (
    <div onClick={readUnreadGameActivities}>{unreadGameActivities.length}</div>
  );
}

class LastReadGameActivityBlockTimestamp {
  private static key = 'LAST_READ_GAME_ACTIVITY_BLOCK_NUMBER';

  static set(blockTimestamp: number) {
    BrowserStorage.set(this.key, blockTimestamp);
  }

  static get() {
    const { ok: blockTimestamp } = BrowserStorage.get(this.key);

    return blockTimestamp ? parseInt(blockTimestamp) : 0;
  }

  static clear() {
    BrowserStorage.clear(this.key);
  }
}
