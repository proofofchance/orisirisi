import { Chain, ChainID } from '@orisirisi/orisirisi-web3-chains';
import { EthereumLogo, PolygonLogo } from './chain-logo/logos';

export function ChainLogo({ chain }: { chain: Chain }) {
  switch (chain.id) {
    // case ChainID.Arbitrum:
    // return <ArbitrumLogo />;
    // case ChainID.Avalanche:
    //   return <AvalancheLogo />;
    // case ChainID.BNB:
    //   return <BNBLogo />;
    // case ChainID.Ethereum:
    case ChainID.Local:
    case ChainID.LocalAlt:
    case ChainID.SepoliaTestNet:
      return <EthereumLogo />;
    // case ChainID.Optimism:
    //   return <OptimismLogo />;
    case ChainID.Polygon:
      return <PolygonLogo />;
  }
}
