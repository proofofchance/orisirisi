import * as crypto from 'crypto';

export class Crypto {
  static getRandomString(): string {
    const array = new Uint8Array(24);
    return window.crypto.getRandomValues(array).toString();
  }
}

export class Hashes {
  static async getSha256FromString(str: string) {
    // encode as UTF-8
    const strBuffer = new TextEncoder().encode(str);
    return await Hashes.getSha256(strBuffer);
  }

  static async getSha256FromHexString(hexString: string) {
    // encode as UTF-8
    const strBuffer = hexStringToBuffer(hexString);
    return await Hashes.getSha256(strBuffer);
  }

  static async getSha256(stringBuffer: Uint8Array) {
    // hash the message
    const hashBuffer = await getCrypto().subtle.digest('SHA-256', stringBuffer);

    // convert ArrayBuffer to Array
    const hashArray = Array.from(new Uint8Array(hashBuffer));

    // convert bytes to hex string
    const hashHex = hashArray
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
    return hashHex;
  }
}

// Uint8Array | Bytes | Buffer
function hexStringToBuffer(hexString: string): Uint8Array {
  // Remove the '0x' prefix if present
  hexString = hexString.startsWith('0x') ? hexString.slice(2) : hexString;

  // Split the hex string into pairs of two characters
  const pairs: string[] = hexString.match(/.{1,2}/g) || [];

  // Convert each pair to a decimal number and create a Uint8Array
  const uint8Array: Uint8Array = new Uint8Array(
    pairs.map((pair) => parseInt(pair, 16))
  );

  return uint8Array;
}

const getCrypto = () =>
  typeof window !== 'undefined' ? window.crypto : crypto.webcrypto;
