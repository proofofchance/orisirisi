// Coinflip Smart Contracts
// This will house reasonable scripts for running Coinflip contracts

import { Signer } from 'ethers';
import { ChainID } from '@orisirisi/orisirisi-web3-chains';
import { Coinflip__factory, Wallets__factory } from '../typechain-types';

import coinflipLocalDeployment from '../deployments/localhost/Coinflip.json';
import walletsLocalDeployment from '../deployments/localhost/Wallets.json';

import coinflipSepoliaDeployment from '../deployments/sepolia/Coinflip.json';
import walletsSepoliaDeployment from '../deployments/sepolia/Wallets.json';

export class CoinflipContract {
  static fromSignerAndChain(signer: Signer, chainId: ChainID) {
    return Coinflip__factory.connect(this.getAddress(chainId), signer);
  }
  static getAddress(chainId: ChainID) {
    switch (chainId) {
      case ChainID.Local:
      case ChainID.LocalAlt:
        return coinflipLocalDeployment.address;
      case ChainID.SepoliaTestNet:
        return coinflipSepoliaDeployment.address;
      default:
        throw new Error('Undeployed Contract');
    }
  }
}

export class WalletsContract {
  static fromSignerAndAddress(signer: Signer, address: string) {
    return Wallets__factory.connect(address, signer);
  }
  static fromSignerAndChain(signer: Signer, chainId: ChainID) {
    return Wallets__factory.connect(this.getAddress(chainId), signer);
  }

  static getAddress(chainId: ChainID) {
    switch (chainId) {
      case ChainID.Local:
      case ChainID.LocalAlt:
        return walletsLocalDeployment.address;
      case ChainID.SepoliaTestNet:
        return walletsSepoliaDeployment.address;
      default:
        throw new Error('Undeployed Contract');
    }
  }
}
