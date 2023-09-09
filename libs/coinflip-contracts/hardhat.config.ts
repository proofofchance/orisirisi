import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';
import 'hardhat-deploy';

const config: HardhatUserConfig = {
  solidity: '0.8.19',
  paths: {
    sources: './src',
    tests: './tests',
  },
};

export default config;
