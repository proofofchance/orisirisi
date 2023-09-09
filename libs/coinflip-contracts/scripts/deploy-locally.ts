import { ethers, deployments } from 'hardhat';

async function main() {
  const deployer = await getDeployer();
  const deployOptions = {
    from: deployer.address,
    log: true,
    deterministicDeployment: ethers.ZeroHash,
  };

  const { address: walletsAddress } = await deployments.deploy(
    'Wallets',
    deployOptions
  );
  console.log('Wallets address : ', walletsAddress);

  const { address: serviceProviderAddress } = await deployments.deploy(
    'ServiceProvider',
    deployOptions
  );
  console.log('ServiceProvider Address : ', serviceProviderAddress);

  const { address: coinflipAddress } = await deployments.deploy('Coinflip', {
    ...deployOptions,
    args: [walletsAddress, serviceProviderAddress],
  });
  console.log('Coinflip Address : ', coinflipAddress);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

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
