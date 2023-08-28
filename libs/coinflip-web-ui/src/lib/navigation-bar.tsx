import { BackgroundWrapperForNav } from './background';
import { ConnectMetamaskWalletButton } from './buttons';

export function NavigationBar() {

  return (
    <BackgroundWrapperForNav className="p-4 ">
      <div className="mx-20 my-4 flex justify-between items-center">
        <div className="flex items-center">
          <a href="/" className="text-white text-xl font-semibold">
            Coinflip
          </a>
        </div>
        <div
          className={`text-white md:flex gap-x-6 items-center`}
        >
          <a href="/" className="mr-4">
            Browse Games
          </a>
          <a href="/about" className="mr-4">
            Create Game
          </a>

          <ConnectMetamaskWalletButton />
        </div>
      </div>
    </BackgroundWrapperForNav>
  );
}
