import { AppProps } from 'next/app';
import { Provider } from '@orisirisi/orisirisi-web-ui';
import Head from 'next/head';
import './styles.css';

function CustomApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Welcome to coinflip-web!</title>
      </Head>
      <main className="app">
        <Provider>
          <Component {...pageProps} />
        </Provider>
      </main>
    </>
  );
}

export default CustomApp;
