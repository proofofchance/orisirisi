import { Result } from '@orisirisi/orisirisi-error-handling';
import { Eip1193Provider, BrowserProvider } from 'ethers';

class NotInstalledError {}

declare global {
  interface Window {
    ethereum: Eip1193Provider;
  }
}


export class SimpleWeb3Provider {
  public static async getProvider() {
    if (!this.isInstalled()) {
      return new Result(null, new NotInstalledError());
    }

    return new Result(new BrowserProvider(window.ethereum), null);
  }

  public static isInstalled() {
    return !!window.ethereum;
  }
}