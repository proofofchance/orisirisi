import { mustBeMutuallyExclusive } from '@orisirisi/orisirisi-data-utils';
import { Web3ProviderError } from './web3-provider-error';

export class Web3Account {
  public address: string | null = null;

  constructor(
    addresses: string[] | null,
    public error: Web3ProviderError | null
  ) {
    mustBeMutuallyExclusive(addresses, error);

    if (addresses) {
      this.address = Web3Account.pickCurrentAccountAddress(addresses);
    }
  }

  isWithoutError = () => !this.hasError();
  hasError = () => !!this.error;
  isEmpty = () => this.address === null;

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
