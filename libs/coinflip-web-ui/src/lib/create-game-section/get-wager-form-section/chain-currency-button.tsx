import { Chain } from '@orisirisi/orisirisi-web3-chains';
import { PropsWithClassName, cn } from '@orisirisi/orisirisi-web-ui';
import { ChainLogo } from '../../chain-logo';

export function ChainCurrencyButton({
  chain,
  className,
}: { chain: Chain } & PropsWithClassName) {
  return (
    <button
      className={cn(
        'bg-transparent rounded-full flex gap-2 items-center justify-center',
        className
      )}
    >
      <div className="w-4">
        <ChainLogo chain={chain} />{' '}
      </div>
      <div className="tracking-wide font-semibold text-xl">
        {chain.getCurrency()}
      </div>
    </button>
  );
}
