import { AppProps } from 'next/app';
import Head from 'next/head';
import './styles.css';
import 'react-tooltip/dist/react-tooltip.css';
import {
  Background,
  SocialLinks,
  NavigationBar,
} from '@orisirisi/coinflip-web-ui';
import { Toaster } from 'react-hot-toast';
import { useIsClient } from '@orisirisi/orisirisi-web-ui';
import { useDisconnectForUnsupportedChain } from '@orisirisi/orisirisi-web3-ui';

function CoinflipWebApp({ Component, pageProps }: AppProps) {
  const isClient = useIsClient();
  useDisconnectForUnsupportedChain();

  return (
    <>
      <Head>
        <title>Welcome to coinflip-web!</title>
      </Head>

      <main className="app">
        {isClient && <Toaster />}
        <Background className="px-12 sm:px-20">
          <NavigationBar className="py-4" />
          <SocialLinks />
          <Component {...pageProps} />
        </Background>
      </main>
    </>
  );
}

export default CoinflipWebApp;
