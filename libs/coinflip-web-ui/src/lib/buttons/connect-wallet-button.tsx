import { MetamaskIcon } from '../icons/metamask-icon';
import Button from './button';

export function ConnectMetamaskWalletButton() {
  return (
    <Button className="rounded-[40px]  px-7 py-4">
      <div className="flex gap-x-2 items-center">
        <div>
          <MetamaskIcon />
        </div>
        <div>Connect Wallet</div>
      </div>
    </Button>
  );
}
