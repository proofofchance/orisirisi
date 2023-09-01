import { WithClassName } from '@orisirisi/orisirisi-web-ui';
import { BackgroundWrapper } from './background';
import { ConnectWalletButton } from './connect-wallet-button';

export { ConnectWalletOptionsModal } from './connect-wallet-button';

export function NavigationBar({ className }: WithClassName) {
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

          <ConnectWalletButton />
        </div>
      </div>
    </BackgroundWrapper>
  );
}
