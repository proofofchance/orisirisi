import { useConnectWalletOptionsModal } from './connect-wallet-options-modal';
import { WalletIcon } from '@heroicons/react/24/outline';
import Button from './button';

export { ConnectWalletOptionsModal } from './connect-wallet-options-modal';

export function ConnectWalletButton() {
  const { openModal: openConnectWalletOptionsModal } =
    useConnectWalletOptionsModal();

  return (
    <Button
      className="rounded-[40px] px-7 py-4"
      onClick={openConnectWalletOptionsModal}
    >
      <div className="flex gap-x-2 items-center">
        <WalletIcon className="h-5 mt-[0.5px]" />
        <div>Connect Wallet</div>
      </div>
    </Button>
  );
}
