import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';
import 'hardhat-deploy';
import 'tsconfig-paths/register';

const config: HardhatUserConfig = {
  solidity: '0.8.19',
  paths: {
    sources: './src',
    tests: './tests',
  },
};

export default config;
