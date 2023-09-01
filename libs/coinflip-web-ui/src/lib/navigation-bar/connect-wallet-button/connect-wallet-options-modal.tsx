import { PropsWithChildren } from 'react';
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

  return (
    <Modal title="Pick Your Wallet" variant="sm" show={show} close={close}>
      <div className="flex flex-col mt-4">
        <ButtonLongCard>
          <div className="flex w-100 justify-between items-center">
            <div>Metamask</div>
            <div className="h-4 w-4">
              <MetamaskIcon />{' '}
            </div>
          </div>
        </ButtonLongCard>
        <ButtonLongCard>
          <div className="flex justify-between items-center">
            <div>WalletConnect</div>
            <div className="h-4 w-4">
              <WalletConnectIcon />{' '}
            </div>
          </div>
        </ButtonLongCard>
        <ButtonLongCard>
          <div className="flex justify-between items-center">
            <div>Coinbase Wallet</div>
            <div className="h-4 w-4">
              <CoinbaseWalletIcon />{' '}
            </div>
          </div>
        </ButtonLongCard>
      </div>
    </Modal>
  );
}
