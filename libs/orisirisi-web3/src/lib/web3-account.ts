import { Result } from '@orisirisi/orisirisi-error-handling';
import { BrowserProvider, JsonRpcSigner, Signer } from 'ethers';
import { Web3Provider, Web3ProviderType } from './providers';

export enum Web3AccountError {
  Generic,
}
export class Web3Account {
  private constructor(
    public address: string,
    /** Signer is null when rehydrated, to avoid the edge case of triggering request accounts if signer has changed before rehydration */
    /** For this reason, getSigner() is the only exposed way to getSigner */
    private signer: Signer | null,
    private providerType: Web3ProviderType
  ) {}

  public async getSigner() {
    if (this.signer) return new Result(this.signer, null);

    const { ok: account, error } = await Web3Account.getCurrentAccount(
      this.providerType
    );

    if (error) return new Result(null, error);

    return new Result(account!.signer, null);
  }

  static async getCurrentAccount(web3ProviderType: Web3ProviderType) {
    const provider = Web3Provider.new(web3ProviderType).toBrowserProvider();

    const { ok: signer, error } = await this.getSigner(provider);

    if (error) return new Result(null, error!);

    const address = await signer!.getAddress();

    return new Result(new Web3Account(address, signer, web3ProviderType), null);
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

  static fromAddress(address: string, type: Web3ProviderType) {
    return this.fromAddresses([address], type);
  }

  static fromAddresses(addresses: string[], type: Web3ProviderType) {
    return new Web3Account(
      this.pickCurrentAccountAddress(addresses),
      null,
      type
    );
  }

  static pickCurrentAccountAddress = (addresses: string[]) => addresses[0];
}
