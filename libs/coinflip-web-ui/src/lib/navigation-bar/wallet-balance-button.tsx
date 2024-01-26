import {
  ChevronDownIcon,
  ArrowTopRightOnSquareIcon,
} from '@heroicons/react/24/outline';
import Button from './current-account-button/button';
import { disconnect } from '@orisirisi/orisirisi-web3-ui';
import { useMemo, useRef, useState } from 'react';
import { useOnClickOutside } from '@orisirisi/orisirisi-web-ui';
import { ChainLogo } from '../chain-logo';
import { useCoinflipGameWallet } from '../hooks';
import { Chain } from '@orisirisi/orisirisi-web3-chains';

interface WalletBalanceButtonProps {
  publicAddress: string;
  currentChain: Chain;
}

export function WalletBalanceButton({
  publicAddress,
  currentChain,
}: WalletBalanceButtonProps) {
  const params = useMemo(
    () => ({
      chain_id: currentChain!.id,
      owner_address: publicAddress,
    }),
    [currentChain, publicAddress]
  );
  const { wallet } = useCoinflipGameWallet(params);
  console.log({ wallet });

  const [showMenu, setShowMenu] = useState(false);
  const ref = useRef(null);
  useOnClickOutside(ref, () => showMenu && setShowMenu(false));
  const menu = () => (
    <div className="bg-white rounded-md text-black flex flex-col justify-center items-center p-1 absolute w-48 top-20">
      <div
        onClick={disconnect}
        className="w-full flex items-center justify-center p-2 hover:cursor-pointer hover:bg-slate-200"
      >
        Disconnect <ArrowTopRightOnSquareIcon className="h-4 ml-1" />
      </div>
    </div>
  );

  return (
    <div ref={ref} className="flex flex-col">
      <Button
        className="rounded-[40px] px-7 py-4 cursor-pointer"
        onClick={() => setShowMenu((prevShowMenu) => !prevShowMenu)}
      >
        <div className="flex gap-x-2 items-center">
          <div className="w-3 mt-[0.5px]">
            <ChainLogo chain={currentChain!} />
          </div>
          <div>
            {wallet ? (
              <span className="ml-2">
                {wallet!.balance}{' '}
                <span className="uppercase text-sm tracking-tight">
                  {currentChain.getCurrency()}
                </span>
              </span>
            ) : (
              <span className="text-xs">loading</span>
            )}
          </div>
          <ChevronDownIcon className="h-3 mt-[0.5px]" />
        </div>
      </Button>
      {showMenu && menu()}
    </div>
  );
}
