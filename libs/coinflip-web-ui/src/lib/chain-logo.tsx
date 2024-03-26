import { Chain, ChainID } from '@orisirisi/orisirisi-web3-chains';
import { EthereumLogo, PolygonLogo } from './chain-logo/logos';
import styled from 'styled-components';
import { pickRandom } from '@orisirisi/orisirisi-data-utils';
import { cn } from '@orisirisi/orisirisi-web-ui';

export function CoinWithChainLogoRarelyAnimated({ chain }: { chain: Chain }) {
  const shouldAnimate = pickRandom([
    ...new Array(6).fill(false),
    true,
    ...new Array(3).fill(false),
  ]);

  return (
    <CoinShell
      axis={pickRandom(['X', 'Y'])}
      delay={pickRandom([4, 5, 6, 7, 8])}
      degree={pickRandom([360, 720, 1080, 1440])}
    >
      <div
        className={cn(
          'h-8 w-8 rounded-full flex justify-center items-center bg-white relative right-4',
          shouldAnimate && 'animate-flip'
        )}
      >
        <div className="w-3">
          <ChainLogo chain={chain} />
        </div>
      </div>
    </CoinShell>
  );
}

export function CoinWithChainLogoAnimated({
  chain,
  size,
}: {
  chain: Chain;
  size: 'sm' | 'lg';
}) {
  return (
    <CoinShell
      axis={pickRandom(['X', 'Y'])}
      delay={pickRandom([4, 5, 6, 7, 8])}
      degree={pickRandom([360, 720, 1080, 1440])}
    >
      <div
        className={cn(
          'h-10 w-10 rounded-full flex justify-center items-center bg-white animate-flip',
          size === 'sm' && 'h-[22px] w-[22px]'
        )}
      >
        <div className={cn('w-4', size === 'sm' && 'w-2')}>
          <ChainLogo chain={chain} />
        </div>
      </div>
    </CoinShell>
  );
}

const CoinShell = styled.div<{
  axis: 'X' | 'Y';
  delay: number;
  degree: number;
}>`
  @keyframes flipX {
    40%,
    100% {
      transform: rotateX(${(props) => props.degree}deg);
    }
  }

  @keyframes flipY {
    40%,
    100% {
      transform: rotateY(${(props) => props.degree}deg);
    }
  }

  .animate-flip {
    animation: ${(props) => `flip${props.axis}`} ${(props) => props.delay}s
      infinite ease-in-out;
    animation-fill-mode: forwards;
  }
`;

export function ChainLogo({ chain }: { chain: Chain }) {
  switch (chain.id) {
    // case ChainID.Arbitrum:
    // return <ArbitrumLogo />;
    // case ChainID.Avalanche:
    //   return <AvalancheLogo />;
    // case ChainID.BNB:
    //   return <BNBLogo />;
    case ChainID.Ethereum:
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
