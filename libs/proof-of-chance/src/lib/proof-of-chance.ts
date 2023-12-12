import { subtle } from 'crypto';
import { encodeBytes32String } from 'ethers';

export class ProofOfChance {
  static DELIMITER = '+';
  static FILE_EXTENSION = '.txt';
  static CHANCE_MAX_LENGTH = 26;
  private constructor(
    private readonly chance: string,
    private readonly creationTimestamp: Date
  ) {}
  static fromChance = (chance: string) => {
    if (chance.length === 0 || chance.length > 28)
      throw new Error('Invalid Chance');

    return new ProofOfChance(chance, new Date());
  };
  // TODO: Improve file content to make it more intuitive
  async toFileContent() {
    return `
    Your chance a.k.a Lucky Charm: ${this.chance}

    Creation timestamp: ${this.creationTimestamp.toString()}
    Its numerical value: ${this.getNumericalTimestamp()}
    Its last 6 digits (prevents someone from using your chance against you): ${this.getNumericalTimestampLast6Digits()}

    Proof hash (A shareable SHA-256 hash of chance and last6digits): ${await this.toPlayHash()}
    Proof upload (Only shareable after every player has played): ${this.toString()}
    `;
  }
  static fromFileContent(fileContent: string) {
    const chance = this.getFromFileContent(
      fileContent,
      'Your chance a.k.a Lucky Charm:'
    );
    const creationTimestampInString = this.getFromFileContent(
      fileContent,
      'Creation timestamp:'
    );

    return new ProofOfChance(chance, new Date(creationTimestampInString));
  }
  private static getFromFileContent(fileContent: string, leadingPart: string) {
    return fileContent.split(leadingPart)[1].split('\n')[0].trim();
  }
  toBytes32() {
    return encodeBytes32String(this.toString());
  }
  toString() {
    return `${this.chance}+${this.getNumericalTimestampLast6Digits()}`;
  }
  private getNumericalTimestampLast6Digits() {
    return `${this.getNumericalTimestamp().toString().slice(-6)}`;
  }
  private getNumericalTimestamp() {
    return this.creationTimestamp.getTime();
  }
  async toPlayHash() {
    return `0x${await sha256(this.toString())}`;
  }
}

async function sha256(message: string) {
  // encode as UTF-8
  const msgBuffer = new TextEncoder().encode(message);

  // hash the message
  const hashBuffer = await subtle.digest('SHA-256', msgBuffer);

  // convert ArrayBuffer to Array
  const hashArray = Array.from(new Uint8Array(hashBuffer));

  // convert bytes to hex string
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return hashHex;
}
