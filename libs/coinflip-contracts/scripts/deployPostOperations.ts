import { ethers, network } from 'hardhat';
import { Chain } from '@orisirisi/orisirisi-web3-chains';
import { CoinflipContract, WalletsContract } from '../src';

async function main() {
  const chain = Chain.fromChainID(network.config.chainId);
  const wallets = WalletsContract.fromSignerAndChain(
    (await ethers.getSigners())[0],
    chain.id
  );
  await wallets.addApp(CoinflipContract.getAddress(chain.id));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
