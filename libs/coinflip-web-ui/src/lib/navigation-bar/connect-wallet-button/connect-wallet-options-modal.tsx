import { ButtonHTMLAttributes, ReactNode, useEffect } from 'react';
import { atom, useAtom } from 'jotai';
import { Modal } from './modal';
import { cn } from '@orisirisi/orisirisi-web-ui';
import { MetaMask, MetaMaskError } from '@orisirisi/orisirisi-web3';
import { CoinbaseWalletIcon, MetamaskIcon, WalletConnectIcon } from './icons';
import {
  useCurrentWeb3Account,
  useCurrentWeb3Provider,
} from '@orisirisi/orisirisi-web3-ui';
import { Browser } from '@orisirisi/orisirisi-browser';

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
  const { setWeb3ProviderForTheFirstTime } = useCurrentWeb3Provider();
  const { currentWeb3Account } = useCurrentWeb3Account();

  useEffect(() => {
    if (
      showModal &&
      currentWeb3Account &&
      currentWeb3Account.isWithoutError()
    ) {
      closeModal();
    }
  }, [showModal, currentWeb3Account, closeModal]);

  const renderButtonContent = (title: string, icon: ReactNode) => (
    <div className="flex w-100 justify-between items-center">
      <div>{title}</div>
      <div className="h-4 w-4">{icon}</div>
    </div>
  );

  const connectToMetamask = async () => {
    const { ok: provider, error: metaMaskError } =
      await MetaMask.getWeb3Provider();

    switch (metaMaskError) {
      case MetaMaskError.NotInstalled:
        return Browser.openInNewTab(MetaMask.downloadLink);
      case MetaMaskError.UnsupportedChain:
        // TODO: Show Unsupported Chain Toast Here
        console.log('Unsupported chain detected');
        return;
    }

    setWeb3ProviderForTheFirstTime(provider!);
  };

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
        <ButtonLongCard onClick={connectToMetamask}>
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
