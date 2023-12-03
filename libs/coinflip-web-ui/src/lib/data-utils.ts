export function shortenPublicAddress(publicAddress: string, prefixLength = 6) {
  return `${publicAddress.slice(0, prefixLength)}...${publicAddress.slice(-4)}`;
}
