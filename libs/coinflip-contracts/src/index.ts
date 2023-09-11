// Coinflip Smart Contracts
// This will house reasonable scripts for running Coinflip contracts

import { Signer } from 'ethers';
import { ChainID } from '@orisirisi/orisirisi-web3-chains';
import { Coinflip__factory, Wallets__factory } from '../typechain-types';
import coinflipLocalDeployment from '../deployments/localhost/Coinflip.json';
import walletsLocalDeployment from '../deployments/localhost/Wallets.json';

export class CoinflipContract {
  static fromSigner(signer: Signer, chainId: ChainID) {
    return Coinflip__factory.connect(this.getAddress(chainId), signer);
  }
  static getAddress(chainId: ChainID) {
    switch (chainId) {
      case ChainID.Local:
        return coinflipLocalDeployment.address;
      default:
        throw new Error('Undeployed Contract');
    }
  }
}

export class WalletsContract {
  static fromSigner(signer: Signer, chainId: ChainID) {
    return Wallets__factory.connect(this.getAddress(chainId), signer);
  }

  static getAddress(chainId: ChainID) {
    switch (chainId) {
      case ChainID.Local:
        return walletsLocalDeployment.address;
      default:
        throw new Error('Undeployed Contract');
    }
  }

  static getABI(chainId: ChainID) {
    switch (chainId) {
      case ChainID.Local:
        return walletsLocalDeployment.abi;
      default:
        throw new Error('Undeployed Contract');
    }
  }
}
