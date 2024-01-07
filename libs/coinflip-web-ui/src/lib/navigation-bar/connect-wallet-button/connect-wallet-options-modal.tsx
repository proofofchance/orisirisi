import { ButtonHTMLAttributes, ReactNode, useEffect } from 'react';
import { atom, useAtom } from 'jotai';
import { Tooltip } from 'react-tooltip';
import { Modal } from '../../modals';
import { cn } from '@orisirisi/orisirisi-web-ui';
import {
  useConnectWithMetaMask,
  useCurrentWeb3Account,
} from '@orisirisi/orisirisi-web3-ui';
import { CoinbaseWalletIcon, MetamaskIcon, WalletConnectIcon } from './icons';

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
      className="top-[40px] w-[400px] left-[calc(50vw-200px)]"
      title="Pick Your Wallet"
      show={showModal}
      close={closeModal}
    >
      <div className="flex flex-col mt-4">
        <ButtonLongCard onClick={connectWithMetaMask}>
          {renderButtonContent('Metamask', <MetamaskIcon />)}
        </ButtonLongCard>
        <Tooltip id="connect-wallet-option-tooltip" place="bottom" />
        <ButtonLongCard disabled disabledReason="Coming soon">
          {renderButtonContent('WalletConnect', <WalletConnectIcon />)}
        </ButtonLongCard>
        <ButtonLongCard disabled disabledReason="Coming soon">
          {renderButtonContent('Coinbase Wallet', <CoinbaseWalletIcon />)}
        </ButtonLongCard>
      </div>
    </Modal>
  );
}

function ButtonLongCard({
  disabled = false,
  disabledReason,
  children,
  className,
  ...remainingProps
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  disabled?: boolean;
  disabledReason?: string;
}) {
  return (
    <button
      className={cn(
        'px-3 py-4 rounded-lg shadow-sm hover:bg-slate-200 focus:outline-none focus:ring focus:ring-slate-50',
        disabled && 'cursor-not-allowed opacity-40',
        className
      )}
      {...remainingProps}
      data-tooltip-id="connect-wallet-option-tooltip"
      data-tooltip-content={disabledReason}
    >
      {children}
    </button>
  );
}
