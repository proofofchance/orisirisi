// Coinflip Smart Contracts
// This will house reasonable scripts for running Coinflip contracts

import { ChainID } from '@orisirisi/orisirisi-web3-chains';

import coinflipLocalhostDeployment from '../deployments/localhost/Coinflip.json';

export class CoinflipContract {
  static getAddress(chaindID: ChainID) {
    switch (chaindID) {
      case ChainID.Localhost:
        return coinflipLocalhostDeployment.address;
      default:
        throw new Error('Undeployed Contract');
    }
  }
}
