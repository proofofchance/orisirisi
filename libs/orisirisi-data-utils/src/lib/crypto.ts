import * as crypto from 'crypto';

export class Crypto {
  static stringToHexString = (input: string, byteSize: number): string => {
    if (isInBrowser) {
      let byteArray = new TextEncoder().encode(input);
      if (byteArray.length < byteSize) {
        const zeroPadding = new Uint8Array(byteSize - byteArray.length);
        byteArray = new Uint8Array([...byteArray, ...zeroPadding]);
      }

      return (
        '0x' +
        Array.from(byteArray)
          .map((byte) => byte.toString(16).padStart(2, '0'))
          .join('')
      );
    } else {
      let buffer = Buffer.from(input, 'utf-8');
      if (buffer.length < byteSize) {
        const zeroPadding = Buffer.alloc(byteSize - buffer.length);
        buffer = Buffer.concat([buffer, zeroPadding]);
      }

      return '0x' + buffer.toString('hex');
    }
  };
  static getRandomHexString(size: number): string {
    return (
      '0x' +
      [...Crypto.getRandomBytes(size)]
        .map((byte) => byte.toString(16).padStart(2, '0'))
        .join('')
    );
  }
  static hexStringToUtf8 = (hexString: string): string => {
    const byteArray = Uint8Array.from(
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      hexString.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16))
    );
    const text = new TextDecoder().decode(byteArray);
    return text;
  };
  static getRandomString(size: number): string {
    return new TextDecoder().decode(Crypto.getRandomBytes(size));
  }
  static getRandomBytes(size: number): Uint8Array {
    const emptyBytes = new Uint8Array(size);
    return window.crypto.getRandomValues(emptyBytes);
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

const getCrypto = () => (isInBrowser ? window.crypto : crypto.webcrypto);

const isInBrowser = typeof window !== 'undefined';
