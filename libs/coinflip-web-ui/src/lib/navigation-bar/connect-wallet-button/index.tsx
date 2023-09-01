import { useConnectWalletOptionsModal } from './connect-wallet-options-modal';
import Button from './button';

export { ConnectWalletOptionsModal } from './connect-wallet-options-modal';

export function ConnectWalletButton() {
  const { open: openConnectWalletOptionsModal } =
    useConnectWalletOptionsModal();

  return (
    <Button
      className="rounded-[40px] px-7 py-4"
      onClick={openConnectWalletOptionsModal}
    >
      Connect Wallet
    </Button>
  );
}

export function ConnectMetamaskWalletButton() {
  return (
    <Button className="rounded-[40px] px-7 py-4">
      <div className="flex gap-x-2 items-center">
        <div>{/* <MetamaskIcon /> */}</div>
        <div>Connect Wallet</div>
      </div>
    </Button>
  );
}
