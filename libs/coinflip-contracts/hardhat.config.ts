import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';
import 'hardhat-deploy';
import 'tsconfig-paths/register';

import dotenv from 'dotenv';
dotenv.config();

const config: HardhatUserConfig = {
  solidity: '0.8.20',
  networks: {
    sepolia: {
      url: process.env['SEPOLIA_JSON_RPC_URL'],
      accounts: [process.env['SEPOLIA_PRIVATE_KEY']!],
    },
  },
  paths: {
    sources: './src',
    tests: './tests',
  },
};

export default config;
