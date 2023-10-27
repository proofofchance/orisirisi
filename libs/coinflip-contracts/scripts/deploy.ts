import { ethers, deployments } from 'hardhat';

async function main() {
  const deployer = await getDeployer();
  const deployOptions = {
    from: deployer.address,
    log: true,
  };

  const { address: walletsAddress } = await deployments.deploy('Wallets', {
    ...deployOptions,
  });
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

  maybeUpdateContractAddressesInArk({
    walletsAddress,
    serviceProviderAddress,
    coinflipAddress,
  });
}

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

import * as fs from 'fs';

interface EnvVariables {
  [key: string]: string;
}

const ARK_ENV_FILE_PATH = '../../../ark/.env';

function maybeUpdateContractAddressesInArk({
  walletsAddress,
  serviceProviderAddress,
  coinflipAddress,
}: {
  walletsAddress: string;
  serviceProviderAddress: string;
  coinflipAddress: string;
}) {
  if (doesFileExist(ARK_ENV_FILE_PATH)) {
    console.log('Updating Coinflip Address in Ark...');
    updateEnvVariable(ARK_ENV_FILE_PATH, 'WALLETS_ADDRESS', walletsAddress);
    updateEnvVariable(
      ARK_ENV_FILE_PATH,
      'SERVICE_PROVIDER_ADDRESS',
      serviceProviderAddress
    );
    updateEnvVariable(ARK_ENV_FILE_PATH, 'COINFLIP_ADDRESS', coinflipAddress);
  }
}

function updateEnvVariable(
  envFilePath: string,
  key: string,
  value: string
): void {
  // Read the content of the .env file
  const content = fs.readFileSync(envFilePath, 'utf-8');

  // Parse the content into key-value pairs
  const envVariables: EnvVariables = content
    .split('\n')
    .reduce((acc: EnvVariables, line: string) => {
      const [envKey, envValue] = line.split('=');
      if (envKey) {
        acc[envKey.trim()] = envValue ? envValue.trim() : '';
      }
      return acc;
    }, {});

  // Update the specified key with the new value
  envVariables[key] = value;

  // Convert the key-value pairs back to a string
  const updatedContent = Object.entries(envVariables)
    .map(([envKey, envValue]) => `${envKey}=${envValue}`)
    .join('\n');

  // Write the updated content back to the .env file
  fs.writeFileSync(envFilePath, updatedContent);
}

function doesFileExist(filePath: string): boolean {
  try {
    // Check if the file exists
    fs.accessSync(filePath, fs.constants.F_OK);
    return true; // File exists
  } catch (err) {
    return false; // File does not exist
  }
}
