/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Our common https://eips.ethereum.org/EIPS/eip-1193 ProviderInterface
 * is ethers' BrowserProvider.
 * It has many functions we can benefit from and would be the
 * end product of all Providers
 *  */

export { MetaMask, MetaMaskError } from './providers/meta-mask';
export { Web3Account } from './providers/web3-account';
export { Web3Provider, Web3ProviderType } from './providers/web3-provider';