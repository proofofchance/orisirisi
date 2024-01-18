import { ethers, deployments } from 'hardhat';
import { parseEther } from 'ethers';
import { CoinflipGame } from '@orisirisi/coinflip';

// TODO: Deploy per chain
async function main() {
  const { walletsAddress, serviceProviderAddress, coinflipAddress } =
    await deployCoinflipContracts();

  console.log('Wallets address : ', walletsAddress);
  console.log('ServiceProvider Address : ', serviceProviderAddress);
  console.log('Coinflip Address : ', coinflipAddress);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

export async function deployCoinflipContracts() {
  const deployer = await getDeployer();
  const deployOptions = {
    from: deployer.address,
    log: true,
  };

  const { address: walletsAddress } = await deployments.deploy(
    'Wallets',
    deployOptions
  );

  const { address: serviceProviderAddress } = await deployments.deploy(
    'ServiceProvider',
    deployOptions
  );

  const { address: coinflipAddress } = await deployments.deploy('Coinflip', {
    ...deployOptions,
    args: [
      walletsAddress,
      serviceProviderAddress,
      CoinflipGame.maxNumberOfPlayers,
      parseEther(CoinflipGame.getMinWagerEth().toString()),
    ],
  });

  return {
    walletsAddress,
    serviceProviderAddress,
    coinflipAddress,
  };
}

async function getDeployer() {
  const [deployer] = await ethers.getSigners();
  console.log(
    'Deploying the contracts with the account:',
    await deployer.getAddress()
  );
  console.log(
    'Account balance:',
    (await deployer.provider.getBalance(deployer.address)).toString()
  );
  return deployer;
}
