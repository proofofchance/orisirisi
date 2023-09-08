import { Chain, ChainID } from '@orisirisi/orisirisi-web3-chains';
import {
  ArbitrumLogo,
  AvalancheLogo,
  BNBLogo,
  EthereumLogo,
  OptimismLogo,
  PolygonLogo,
} from './icons';
import { WithClassName, cn } from '@orisirisi/orisirisi-web-ui';

export function ChainCurrencyButton({
  chain,
  className,
}: { chain: Chain } & WithClassName) {
  const renderChainLogo = () => {
    switch (chain.id) {
      case ChainID.Arbitrum:
        return <ArbitrumLogo />;
      case ChainID.Avalanche:
        return <AvalancheLogo />;
      case ChainID.BNB:
        return <BNBLogo />;
      case ChainID.Ethereum:
      case ChainID.HardhatLocalhost:
      case ChainID.SepoliaTestNet:
        return <EthereumLogo />;
      case ChainID.Optimism:
        return <OptimismLogo />;
      case ChainID.Polygon:
        return <PolygonLogo />;
    }
  };

  return (
    <button
      className={cn(
        'bg-transparent rounded-full flex gap-2 items-center justify-center',
        className
      )}
    >
      <div className="w-4">{renderChainLogo()}</div>
      <div className="tracking-wide font-semibold text-xl">
        {chain.getCurrency()}
      </div>
    </button>
  );
}
