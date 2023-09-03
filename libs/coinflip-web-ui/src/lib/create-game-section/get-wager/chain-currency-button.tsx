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
      case ChainID.SepoliaTestNet:
        return <EthereumLogo />;
      case ChainID.Optimism:
        return <OptimismLogo />;
      case ChainID.Polygon:
        return <PolygonLogo />;
    }
  };

  return (
    <button className="bg-transparent rounded-full px-4 flex gap-2 items-center justify-center">
      <div className="w-4">{renderChainLogo()}</div>
      <div className="tracking-wide text-lg">{chain.getCurrency()}</div>
    </button>
  );
}
