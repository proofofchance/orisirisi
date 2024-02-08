import { HardhatUserConfig } from 'hardhat/config';
import { HttpNetworkUserConfig, NetworksUserConfig } from 'hardhat/types';
import '@nomicfoundation/hardhat-toolbox';
import 'hardhat-deploy';
import 'tsconfig-paths/register';

import dotenv from 'dotenv';

dotenv.config();

const networks: NetworksUserConfig = {
  sepolia: {
    url: process.env['SEPOLIA_JSON_RPC_URL'],
    accounts: [process.env['SEPOLIA_PRIVATE_KEY']!],
    gasPrice: 50000000000
  },
};
const nonEmptyNetworks = Object.keys(networks).reduce(
  (nonEmptyNetworks, network) => {
    const config = networks[network] as HttpNetworkUserConfig;
    const hasUrl = config.url;
    if (hasUrl) {
      nonEmptyNetworks[network] = config;
    }

    return nonEmptyNetworks;
  },
  {} as NetworksUserConfig
);

const config: HardhatUserConfig = {
  solidity: '0.8.20',
  networks: nonEmptyNetworks,
  paths: {
    sources: './src',
    tests: './tests',
  },
  etherscan: {
    apiKey: process.env['ETHERSCAN_API_KEY'] ?? undefined,
  },
  
};

export default config;
