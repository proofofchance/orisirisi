import { mustBeMutuallyExclusive } from '@orisirisi/orisirisi-data-utils';
import { Result } from '@orisirisi/orisirisi-error-handling';
import { Eip1193Provider } from 'ethers';

export enum Web3AccountError {
  Generic,
}
export class Web3Account {
  public address: string | null = null;

  constructor(
    addresses: string[] | null,
    public error: Web3AccountError | null
  ) {
    mustBeMutuallyExclusive(addresses, error);

    if (addresses) {
      this.address = Web3Account.pickCurrentAccountAddress(addresses);
    }
  }

  isWithoutError = () => !this.hasError();
  hasError = () => !!this.error;
  isEmpty = () => this.address === null;

  static async getCurrentAccount(provider: Eip1193Provider) {
    const { ok: addresses, error } = await this.getAccountAddresses(provider);

    return new Web3Account(addresses, error);
  }

  static async getAccountAddresses(provider: Eip1193Provider) {
    try {
      const addresses = await provider.request({
        method: 'eth_requestAccounts',
      });

      return new Result(addresses, null);
    } catch (error: unknown) {
      console.log({ error });
      return new Result(null, Web3AccountError.Generic);
    }
  }

  static fromAddress(address: string | null) {
    if (!address) return null;

    return this.fromAddresses([address]);
  }

  static fromAddresses(addresses: string[]) {
    return new Web3Account(addresses, null);
  }

  private static pickCurrentAccountAddress = (addresses: string[]) =>
    addresses[0];
}
