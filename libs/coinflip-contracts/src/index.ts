// Coinflip Smart Contracts
// This will house reasonable scripts for running Coinflip contracts

import { Signer } from 'ethers';
import { ChainID } from '@orisirisi/orisirisi-web3-chains';
import { Coinflip__factory } from '../typechain-types';
import coinflipLocalhostDeployment from '../deployments/localhost/Coinflip.json';

export class CoinflipContract {
  static fromSigner(signer: Signer, chainId: ChainID) {
    return Coinflip__factory.connect(this.getAddress(chainId), signer);
  }
  static getAddress(chainId: ChainID) {
    switch (chainId) {
      case ChainID.Localhost:
        return coinflipLocalhostDeployment.address;
      default:
        throw new Error('Undeployed Contract');
    }
  }
}
