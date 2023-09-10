import { ButtonHTMLAttributes, ReactNode, useEffect } from 'react';
import { atom, useAtom } from 'jotai';
import { Modal } from './modal';
import { cn } from '@orisirisi/orisirisi-web-ui';
import { CoinbaseWalletIcon, MetamaskIcon, WalletConnectIcon } from './icons';
import {
  useConnectWithMetaMask,
  useCurrentWeb3Account,
} from '@orisirisi/orisirisi-web3-ui';

function ButtonLongCard({
  children,
  className,
  ...remainingProps
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        'px-3 py-4 rounded-lg shadow-sm hover:bg-slate-200 focus:outline-none focus:ring focus:ring-slate-50',
        className
      )}
      {...remainingProps}
    >
      {children}
    </button>
  );
}

const showConnectWalletOptionsModal = atom<boolean | null>(null);

export function useConnectWalletOptionsModal() {
  const [showModal, toggleShow] = useAtom(showConnectWalletOptionsModal);

  const initModal = () => toggleShow(false);

  const openModal = () => {
    if (showModal === null) {
      throw new Error('<ConnectWalletOptionsModal /> must be initialized');
    }

    toggleShow(true);
  };
  const closeModal = () => toggleShow(false);

  return {
    showModal,
    openModal,
    closeModal,
    initModal,
  };
}

export function ConnectWalletOptionsModal() {
  const { initModal, showModal, closeModal } = useConnectWalletOptionsModal();
  const connectWithMetaMask = useConnectWithMetaMask();
  const { currentWeb3Account } = useCurrentWeb3Account();

  useEffect(() => {
    if (showModal && currentWeb3Account) {
      closeModal();
    }
  }, [showModal, currentWeb3Account, closeModal]);

  const renderButtonContent = (title: string, icon: ReactNode) => (
    <div className="flex w-100 justify-between items-center">
      <div>{title}</div>
      <div className="h-4 w-4">{icon}</div>
    </div>
  );

  if (showModal === null) {
    initModal();
    return null;
  }

  return (
    <Modal
      variant="sm"
      title="Pick Your Wallet"
      show={showModal}
      close={closeModal}
    >
      <div className="flex flex-col mt-4">
        <ButtonLongCard onClick={connectWithMetaMask}>
          {renderButtonContent('Metamask', <MetamaskIcon />)}
        </ButtonLongCard>
        <ButtonLongCard>
          {renderButtonContent('WalletConnect', <WalletConnectIcon />)}
        </ButtonLongCard>
        <ButtonLongCard>
          {renderButtonContent('Coinbase Wallet', <CoinbaseWalletIcon />)}
        </ButtonLongCard>
      </div>
    </Modal>
  );
}
