import { ButtonHTMLAttributes, ReactNode, useEffect } from 'react';
import { atom, useAtom } from 'jotai';
import { Modal } from './modal';
import { cn } from '@orisirisi/orisirisi-web-ui';
import { MetaMask } from '@orisirisi/orisirisi-web3';
import { CoinbaseWalletIcon, MetamaskIcon, WalletConnectIcon } from './icons';
import {
  useCurrentWeb3Account,
  useCurrentWeb3Provider,
} from '@orisirisi/orisirisi-web3-ui';

export class Browser {
  static openInNewTab(url: string) {
    return window.open(url, '_blank')?.focus();
  }
}

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

const showConnectWalletOptionsModal = atom(false);

export function useConnectWalletOptionsModal() {
  const [showModal, toggleShow] = useAtom(showConnectWalletOptionsModal);

  return {
    showModal,
    openModal: () => toggleShow(true),
    closeModal: () => toggleShow(false),
  };
}

export function ConnectWalletOptionsModal() {
  const { showModal, closeModal } = useConnectWalletOptionsModal();
  const { setCurrentWeb3Provider } = useCurrentWeb3Provider();
  const { currentWeb3Account } = useCurrentWeb3Account();

  useEffect(() => {
    console.log({ showModal, currentWeb3Account });
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

    if (metaMaskError && metaMaskError.notInstalled)
      return Browser.openInNewTab(MetaMask.downloadLink);

    setCurrentWeb3Provider(provider!);
  };

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
