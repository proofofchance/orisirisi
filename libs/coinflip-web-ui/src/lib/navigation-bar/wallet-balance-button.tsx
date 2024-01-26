import {
  ChevronDownIcon,
  ArrowTopRightOnSquareIcon,
  ArrowsUpDownIcon,
} from '@heroicons/react/24/outline';
import Button from './current-account-button/button';
import { disconnect } from '@orisirisi/orisirisi-web3-ui';
import { useMemo, useRef, useState } from 'react';
import { useOnClickOutside } from '@orisirisi/orisirisi-web-ui';
import { ChainLogo } from '../chain-logo';
import { useCoinflipGameWallet } from '../hooks';
import { Chain } from '@orisirisi/orisirisi-web3-chains';
import {
  Web3Account,
  Web3ProviderError,
  Web3ProviderErrorCode,
} from '@orisirisi/orisirisi-web3';
import { WalletsContract } from '@orisirisi/coinflip-contracts';
import toast from 'react-hot-toast';
import { COINFLIP_INDEX_GRACE_PERIOD } from '@orisirisi/coinflip';

interface WalletBalanceButtonProps {
  currentWeb3Account: Web3Account;
  currentChain: Chain;
}

export function WalletBalanceButton({
  currentWeb3Account,
  currentChain,
}: WalletBalanceButtonProps) {
  const publicAddress = currentWeb3Account.address;
  const params = useMemo(
    () => ({
      chain_id: currentChain!.id,
      owner_address: publicAddress,
    }),
    [currentChain, publicAddress]
  );
  const { wallet, refresh: refreshWallet } = useCoinflipGameWallet(params);

  const [showMenu, setShowMenu] = useState(false);
  const ref = useRef(null);
  useOnClickOutside(ref, () => showMenu && setShowMenu(false));

  const withdrawWalletBalance = async () => {
    const { ok: signer, error } = await currentWeb3Account!.getSigner();

    // TODO: Do something with error here
    const walletsContract = WalletsContract.fromSignerAndChain(
      signer!,
      currentChain!.id
    );

    const awaitingApprovalToastId = toast.loading('Awaiting approval', {
      position: 'bottom-right',
    });
    try {
      await walletsContract.withdrawAll();

      toast.dismiss(awaitingApprovalToastId);

      toast.loading('Withdrawing balance', {
        position: 'bottom-right',
        duration: COINFLIP_INDEX_GRACE_PERIOD,
      });

      setTimeout(() => {
        toast.success('Game wallet balance withdrawn successfully!', {
          position: 'bottom-right',
        });
        refreshWallet();
      }, COINFLIP_INDEX_GRACE_PERIOD);
    } catch (e) {
      switch (Web3ProviderError.from(e).code) {
        case Web3ProviderErrorCode.UserRejected:
          toast.dismiss(awaitingApprovalToastId);
          console.log('User Rejected. TODO: maybe Add a toast here');
          break;
      }
    }
  };
  const menu = () => (
    <div className="bg-white rounded-md text-black flex flex-col justify-center items-center p-1 absolute w-48 top-20">
      {wallet!.isWithdrawable() && (
        <div
          onClick={withdrawWalletBalance}
          className="w-full flex items-center pl-6 p-2 hover:cursor-pointer hover:bg-slate-200"
        >
          Withdraw <ArrowsUpDownIcon className="h-4 ml-1" />
        </div>
      )}
      <div
        onClick={disconnect}
        className="w-full flex items-center pl-6 p-2 hover:cursor-pointer hover:bg-slate-200"
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
              <span className="text-xs">loading...</span>
            )}
          </div>
          <ChevronDownIcon className="h-3 mt-[0.5px]" />
        </div>
      </Button>
      {showMenu && menu()}
    </div>
  );
}
