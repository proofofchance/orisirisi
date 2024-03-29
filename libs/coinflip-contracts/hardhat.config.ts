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
  },
  polygon: {
    url: process.env['POLYGON_JSON_RPC_URL'],
    accounts: [process.env['POLYGON_PRIVATE_KEY']!],
  },
  ethereum: {
    url: process.env['ETHEREUM_JSON_RPC_URL'],
    accounts: [process.env['ETHEREUM_PRIVATE_KEY']!],
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
  solidity: {
    version: '0.8.25',
    settings: {
      optimizer: {
        enabled: true,
        runs: 1_000,
      },
    },
  },
  networks: nonEmptyNetworks,
  paths: {
    sources: './src',
    tests: './tests',
  },
  etherscan: {
    apiKey: process.env['CHAIN_EXPLORER_API_KEY'] ?? undefined,
  },
  gasReporter: {
    enabled: process.env['GAS_REPORT_MODE'] === 'ON',
    outputFile: 'GAS_REPORT',
    noColors: true,
  },
};

export default config;
