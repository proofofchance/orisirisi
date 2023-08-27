import { useState } from 'react';
import { BackgroundWrapperForNav } from './background';
import { HamburgerIcon, XMarkIcon } from './icons';
import { ConnectMetamaskWalletButton } from './buttons';

export function NavigationBar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <BackgroundWrapperForNav className="p-4">
      <div className="max-w-7xl mx-20 my-4 flex justify-between items-center">
        <div className="flex items-center">
          <a href="/" className="text-white text-xl font-semibold">
            Coinflip
          </a>
        </div>

        <div className="md:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-white p-2 focus:outline-none"
          >
            <svg
              className="h-6 w-6 fill-current"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
            >
              {mobileMenuOpen ? <XMarkIcon /> : <HamburgerIcon />}
            </svg>
          </button>
        </div>

        <div
          className={`text-white md:flex gap-x-6 items-center ${
            mobileMenuOpen ? 'block' : 'hidden'
          }`}
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
