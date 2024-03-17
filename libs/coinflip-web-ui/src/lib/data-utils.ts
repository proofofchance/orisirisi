export function shortenPublicAddress(publicAddress: string, prefixLength = 6) {
  return `${publicAddress.slice(0, prefixLength)}...${publicAddress.slice(-4)}`;
}

export function shortenSHA256(sha256: string, prefixLength = 6) {
  return `${sha256.slice(0, prefixLength)}...${sha256.slice(-6)}`;
}
