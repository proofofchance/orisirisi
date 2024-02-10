import { CoinflipGame } from '@orisirisi/coinflip';
import { sleep } from '@orisirisi/orisirisi-data-utils';
import { ethers, deployments, run, network } from 'hardhat';
import { parseEther } from 'ethers';

const NODE_INDEXING_GRACE_PERIOD_MS = 1 * 60 * 1000;

async function main() {
  const { walletsAddress, coinflipAddress } = await deployCoinflipContracts();

  console.log('Wallets address : ', walletsAddress);
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

  const coinflipArgs = [
    walletsAddress,
    CoinflipGame.maxNumberOfPlayers,
    parseEther(CoinflipGame.getMinWagerEth().toString()),
  ];

  const { address: coinflipAddress } = await deployments.deploy('Coinflip', {
    ...deployOptions,
    args: coinflipArgs,
  });

  const isLocalDeployment = network.name === 'localhost';

  if (!isLocalDeployment) {
    await sleep(NODE_INDEXING_GRACE_PERIOD_MS);

    await run('verify:verify', {
      address: walletsAddress,
    });
  }

  if (!isLocalDeployment) {
    await sleep(NODE_INDEXING_GRACE_PERIOD_MS);

    await run('verify:verify', {
      address: coinflipAddress,
      constructorArguments: coinflipArgs,
    });
  }

  return {
    walletsAddress,
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
