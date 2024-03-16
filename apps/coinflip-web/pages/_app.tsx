import { AppProps } from 'next/app';
import Head from 'next/head';
import './styles.css';
import 'react-tooltip/dist/react-tooltip.css';
import {
  Background,
  SocialLinks,
  NavigationBar,
  MobileAugmentingNavigationBar,
} from '@orisirisi/coinflip-web-ui';
import { Toaster } from 'react-hot-toast';
import { useIsClient, usePageVisibility } from '@orisirisi/orisirisi-web-ui';
import { useDisconnectForUnsupportedChain } from '@orisirisi/orisirisi-web3-ui';
import { CoinflipHTTPService } from '@orisirisi/coinflip';

function CoinflipWebApp({ Component, pageProps }: AppProps) {
  const isClient = useIsClient();
  useDisconnectForUnsupportedChain();

  usePageVisibility(() => CoinflipHTTPService.keepIndexingActive());

  return (
    <>
      <Head>
        <title>Proof of Chance - Coinflip</title>

        <meta
          name="description"
          content="Coinflip - The world's first 100% transparent P2P betting game powered by ProofOfChance"
        />
        <meta
          name="keywords"
          content="web3, gaming, casino, crypto, betting, protocol, gamblefi, proof, chance, transparent, zero-knowledge, zk"
        />

        <meta
          property="og:title"
          content="Play Coinflip with your Proof of Chance"
        />
        <meta property="og:type" content="website" />
        <meta
          property="og:description"
          content="Coinflip - The world's first 100% transparent P2P betting game powered by ProofOfChance"
        />
        <meta
          property="og:image"
          content="https://res.cloudinary.com/dfhulw5qx/image/upload/v1710545603/proofofchance/public/poc_logo.png"
        />
        <meta property="og:image:alt" content="ProofofChance's logo" />
      </Head>

      <main className="app">
        {isClient && <Toaster />}
        <Background className="px-12 sm:px-20">
          <NavigationBar className="py-4" />
          <MobileAugmentingNavigationBar className="mt-2" />
          <SocialLinks />
          <Component {...pageProps} />
        </Background>
      </main>
    </>
  );
}

export default CoinflipWebApp;
