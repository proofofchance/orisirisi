import { Result } from '@orisirisi/orisirisi-error-handling';
import { BrowserProvider, JsonRpcSigner, Signer } from 'ethers';
import { Web3Provider, Web3ProviderType } from './providers';

export enum Web3AccountError {
  Generic,
}
export class Web3Account {
  private constructor(public address: string, public signer: Signer | null) {}

  static async getCurrentAccount(web3ProviderType: Web3ProviderType) {
    const provider = Web3Provider.new(web3ProviderType).toBrowserProvider();

    const { ok: signer, error } = await this.getSigner(provider);

    if (!signer) return new Result(null, error!);

    const address = await signer.getAddress();

    return new Result(new Web3Account(address, signer), null);
  }

  private static async getSigner(
    provider: BrowserProvider
  ): Promise<Result<JsonRpcSigner, null> | Result<null, Web3AccountError>> {
    try {
      const signer = await provider.getSigner();

      return new Result(signer, null);
    } catch (error: unknown) {
      console.log({ error });
      return new Result(null, Web3AccountError.Generic);
    }
  }

  static fromAddress(address: string) {
    return this.fromAddresses([address]);
  }

  static fromAddresses(addresses: string[]) {
    return new Web3Account(this.pickCurrentAccountAddress(addresses), null);
  }

  static pickCurrentAccountAddress = (addresses: string[]) => addresses[0];
}
