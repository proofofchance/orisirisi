import { WalletIcon } from '@heroicons/react/24/outline';
import Button from './current-account-button/button';
import { shortenPublicAddress } from '../data-utils';

interface CurrentAccountProps {
  publicAddress: string;
}

export function CurrentAccountButton({ publicAddress }: CurrentAccountProps) {
  return (
    <Button className="rounded-[40px] px-7 py-4">
      <div className="flex gap-x-2 items-center">
        <WalletIcon className="h-5 mt-[0.5px]" />
        <div>{`${shortenPublicAddress(publicAddress)}`}</div>
      </div>
    </Button>
  );
}
