import * as crypto from 'crypto';
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
    Its numerical value: ${this.creationTimestamp.getTime()}
    Its last 6 digits (prevents someone from using your chance against you): ${this.getCreationTimestampLast6Digits()}

    Proof hash (A shareable SHA-256 hash of chance and last6digits): ${await this.toPlayHash()}
    Proof upload (Only shareable after every player has played): ${this.getProof()}
    `;
  }
  static fromFileContent(fileContent: string) {
    const chance = this.getFromFileContent(
      fileContent,
      'Your chance a.k.a Lucky Charm:'
    );
    const creationTimestampNumericalValue = parseInt(
      this.getFromFileContent(fileContent, 'Its numerical value:')
    );

    return new ProofOfChance(chance, new Date(creationTimestampNumericalValue));
  }
  private static getFromFileContent(fileContent: string, leadingPart: string) {
    return fileContent.split(leadingPart)[1].split('\n')[0].trim();
  }
  toBytes32() {
    return encodeBytes32String(this.getProof());
  }
  getProof() {
    return `${this.chance}+${this.getCreationTimestampLast6Digits()}`;
  }
  getCreationTimestampLast6Digits() {
    return ProofOfChance.getLast6digits(
      this.creationTimestamp.getTime().toString()
    );
  }
  private static getLast6digits(value: string) {
    return value.toString().slice(-6);
  }
  async toPlayHash() {
    return `0x${await sha256(this.getProof())}`;
  }
}

async function sha256(message: string) {
  // encode as UTF-8
  const msgBuffer = new TextEncoder().encode(message);

  // hash the message
  const hashBuffer =
    typeof window !== 'undefined'
      ? await window.crypto.subtle.digest('SHA-256', msgBuffer)
      : await crypto.subtle.digest('SHA-256', msgBuffer);

  // convert ArrayBuffer to Array
  const hashArray = Array.from(new Uint8Array(hashBuffer));

  // convert bytes to hex string
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return hashHex;
}
