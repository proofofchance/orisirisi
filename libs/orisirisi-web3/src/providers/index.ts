import { SimpleWeb3Provider } from "./simple-web3-provider";

export { WalletConnectProvider } from './wallet-connect';

export class CoinbaseProvider extends SimpleWeb3Provider {}

export class Metamask extends SimpleWeb3Provider {
  public static downloadLink = 'https://metamask.io/download/';
}
