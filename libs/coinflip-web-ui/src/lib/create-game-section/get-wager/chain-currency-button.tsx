import { Chain, ChainID } from '@orisirisi/orisirisi-web3';
import {
  ArbitrumLogo,
  AvalancheLogo,
  BNBLogo,
  EthereumLogo,
  OptimismLogo,
  PolygonLogo,
} from './icons';

export function ChainCurrencyButton({ chain }: { chain: Chain }) {
  const renderChainLogo = () => {
    switch (chain.id) {
      case ChainID.Arbitrum:
        return <ArbitrumLogo />;
      case ChainID.Avalanche:
        return <AvalancheLogo />;
      case ChainID.BNB:
        return <BNBLogo />;
      case ChainID.Ethereum:
        return <EthereumLogo />;
      case ChainID.Optimism:
        return <OptimismLogo />;
      case ChainID.Polygon:
        return <PolygonLogo />;
    }
  };

  return (
    <button className="bg-white rounded-full w-12 h-11 flex items-center justify-center">
      <div className="w-6">{renderChainLogo()}</div>
    </button>
  );
}
