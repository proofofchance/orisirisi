import { WalletIcon } from '@heroicons/react/24/outline';
import Button from './button';

interface CurrentAccountProps {
  publicAddress: string;
}

function shortPublicAddress(publicAddress: string, prefixLength = 6) {
  return `${publicAddress.slice(0, prefixLength)}...${publicAddress.slice(-4)}`;
}

export function CurrentAccountButton({ publicAddress }: CurrentAccountProps) {
  return (
    <Button className="rounded-[40px] px-7 py-4">
      <div className="flex gap-x-2 items-center">
        <WalletIcon className="h-5 mt-[0.5px]" />
        <div>{`${shortPublicAddress(publicAddress)}`}</div>
      </div>
    </Button>
  );
}
