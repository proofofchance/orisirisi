import { AppProps } from 'next/app';
import Head from 'next/head';
import './styles.css';
import 'react-tooltip/dist/react-tooltip.css';
import { Background, NavigationBar } from '@orisirisi/coinflip-web-ui';
import { Toaster } from 'react-hot-toast';
import { useIsClient } from '@orisirisi/orisirisi-web-ui';

function CoinflipWebApp({ Component, pageProps }: AppProps) {
  const isClient = useIsClient();
  return (
    <>
      <Head>
        <title>Welcome to coinflip-web!</title>
      </Head>

      <main className="app">
        {isClient && <Toaster />}
        <Background className="px-4 sm:px-20">
          <NavigationBar className="py-4" />
          <Component {...pageProps} />
        </Background>
      </main>
    </>
  );
}

export default CoinflipWebApp;
