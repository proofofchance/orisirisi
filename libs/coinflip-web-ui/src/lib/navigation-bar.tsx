import { WithClassName, useIsClient } from '@orisirisi/orisirisi-web-ui';
import { BackgroundWrapper } from './background';
import { ConnectWalletButton } from './navigation-bar/connect-wallet-button';
import { CurrentAccountButton } from './navigation-bar/current-account-button';
import { useCurrentWeb3Account } from '@orisirisi/orisirisi-web3-ui';

export { ConnectWalletOptionsModal } from './navigation-bar/connect-wallet-button';

export function NavigationBar({ className }: WithClassName) {
  const { currentWeb3Account } = useCurrentWeb3Account();
  const isClient = useIsClient();

  return (
    <BackgroundWrapper className={className}>
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <a href="/" className="text-white text-xl font-semibold">
            Coinflip
          </a>
        </div>
        <div className={`text-white md:flex gap-x-6 items-center`}>
          <a href="/" className="mr-4">
            Browse Games
          </a>
          <a href="/about" className="mr-4">
            Create Game
          </a>

          {isClient && currentWeb3Account ? (
            <CurrentAccountButton publicAddress={currentWeb3Account.address!} />
          ) : (
            <ConnectWalletButton />
          )}
        </div>
      </div>
    </BackgroundWrapper>
  );
}
