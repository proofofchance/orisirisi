import { AppProps } from 'next/app';
import Head from 'next/head';
import './styles.css';
import {
  Background,
  ConnectWalletOptionsModal,
  NavigationBar,
} from '@orisirisi/coinflip-web-ui';
import { Toaster } from 'react-hot-toast';

function CustomApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Welcome to coinflip-web!</title>
      </Head>

      <main className="app">
        <ConnectWalletOptionsModal />
        <Toaster />
        <Background className="px-4 sm:px-20">
          <NavigationBar className="py-4" />
          <Component {...pageProps} />
        </Background>
      </main>
    </>
  );
}

export default CustomApp;
