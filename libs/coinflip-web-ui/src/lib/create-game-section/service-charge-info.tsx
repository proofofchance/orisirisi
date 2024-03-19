import { CoinflipGame } from '@orisirisi/coinflip';
import { Chain } from '@orisirisi/orisirisi-web3-chains';

export function ServiceChargeInfo({ currentChain }: { currentChain: Chain }) {
  return (
    <div className="mt-6 text-center">
      <p className="text-[13px]">
        N/B: There is charge rate of{' '}
        <b>{CoinflipGame.getServiceChargePercent(currentChain.id)}%</b> on
        completion or expiry
      </p>
    </div>
  );
}
