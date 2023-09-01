import { PropsWithChildren, ReactNode } from 'react';
import { atom, useAtom } from 'jotai';
import { Modal } from './modal';
import { WithClassName, cn } from '@orisirisi/orisirisi-web-ui';
import { CoinbaseWalletIcon, MetamaskIcon, WalletConnectIcon } from './icons';

function ButtonLongCard({
  children,
  className,
}: PropsWithChildren & WithClassName) {
  return (
    <button
      className={cn(
        'px-3 py-4 rounded-lg shadow-sm hover:bg-slate-200 focus:outline-none focus:ring focus:ring-slate-50',
        className
      )}
    >
      {children}
    </button>
  );
}

const showConnectWalletOptionsModal = atom(false);

export function useConnectWalletOptionsModal() {
  const [show, toggleShow] = useAtom(showConnectWalletOptionsModal);

  return { show, open: () => toggleShow(true), close: () => toggleShow(false) };
}

export function ConnectWalletOptionsModal() {
  const { show, close } = useConnectWalletOptionsModal();

  const buttonContent = (title: string, icon: ReactNode) => (
    <div className="flex w-100 justify-between items-center">
      <div>{title}</div>
      <div className="h-4 w-4">{icon}</div>
    </div>
  );

  return (
    <Modal title="Pick Your Wallet" variant="sm" show={show} close={close}>
      <div className="flex flex-col mt-4">
        <ButtonLongCard>
          {buttonContent('Metamask', <MetamaskIcon />)}
        </ButtonLongCard>
        <ButtonLongCard>
          {buttonContent('WalletConnect', <WalletConnectIcon />)}
        </ButtonLongCard>
        <ButtonLongCard>
          {buttonContent('Coinbase Wallet', <CoinbaseWalletIcon />)}
        </ButtonLongCard>
      </div>
    </Modal>
  );
}
