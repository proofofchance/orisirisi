import { Result } from '@orisirisi/orisirisi-error-handling';
import Provider, { EthereumProviderOptions } from '@walletconnect/ethereum-provider/dist/types/EthereumProvider';

export class WalletConnectProvider {
  async get(options: EthereumProviderOptions) {
    return new Result(await Provider.init(options), null);
  }
}
