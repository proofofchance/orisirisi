import { Crypto, Hashes } from '@orisirisi/orisirisi-data-utils';
import { AbiCoder } from 'ethers';

type HexString = `0x${string}`;
export class PublicProofOfChance {
  public readonly chance: string;
  public readonly salt: string;
  private constructor(
    public readonly player_address: HexString,
    public readonly chance_and_salt: HexString
  ) {
    const [chance, salt] = AbiCoder.defaultAbiCoder().decode(
      ['bytes16', 'bytes8'],
      chance_and_salt
    );
    this.chance = Crypto.hexStringToUtf8(chance);
    this.salt = Crypto.hexStringToUtf8(salt);
  }
  async getProofOfChance() {
    return await buildProofOfChance(this.chance_and_salt);
  }
  getColor(gameId: number) {
    const first4Digits = this.player_address.substring(0, 6);
    const consistentColorIndex =
      (Number(first4Digits) + gameId) % PublicProofOfChance.colors.length;
    return PublicProofOfChance.colors[consistentColorIndex];
  }
  private static colors: `#${string}`[] = [
    '#fff',
    '#a9c7ff',
    '#a6a6a6',
    '#5f86fa',
    '#a9ffb2',
    '#2969FF',
  ];
  static manyfromJSON(
    manyJson: PublicProofOfChance[] | null
  ): PublicProofOfChance[] | null {
    if (!manyJson) return null;
    return manyJson.map(PublicProofOfChance.fromJSON);
  }
  static fromJSON(json: PublicProofOfChance): PublicProofOfChance {
    return new PublicProofOfChance(json.player_address, json.chance_and_salt);
  }
}

export class ProofOfChance {
  static FILE_EXTENSION = '.txt';
  static CHANCE_MAX_LENGTH = 16;
  private constructor(
    public readonly chance: string,
    private readonly salt: string
  ) {}
  static fromChance = (chance: string, salt?: string) => {
    if (chance.length === 0 || chance.length > ProofOfChance.CHANCE_MAX_LENGTH)
      throw new Error('Invalid Chance');

    return new ProofOfChance(
      Crypto.stringToHexString(chance, ProofOfChance.CHANCE_MAX_LENGTH),
      salt || ProofOfChance.getRandomSalt()
    );
  };
  // TODO: Improve file content to make it more intuitive
  async toFileContent() {
    return `
    Your chance a.k.a your Lucky Charm: ${this.chance}
    A random salt generated by your computer that help prevents someone from predicting your chance: ${
      this.salt
    }

    For Advance Understanding
    Chance And Salt (Only shareable after every player has played): ${this.getChanceAndSalt()}
    ProofOfChance Crypto Hash (A publicly shareable SHA-256 hash of chance and salt): ${await this.getProofOfChance()}
    `;
  }
  static fromFileContent(fileContent: string) {
    const chance = this.getFromFileContent(
      fileContent,
      'Your chance a.k.a your Lucky Charm:'
    );
    const salt = this.getFromFileContent(
      fileContent,
      'A random salt generated by your computer that help prevents someone from predicting your chance:'
    );

    return new ProofOfChance(chance, salt);
  }
  private static getFromFileContent(fileContent: string, leadingPart: string) {
    return fileContent.split(leadingPart)[1].split('\n')[0].trim();
  }
  getChanceAndSalt() {
    return AbiCoder.defaultAbiCoder().encode(
      ['bytes16', 'bytes8'],
      [this.chance, this.salt]
    ) as HexString;
  }
  static getRandomSalt() {
    return Crypto.getRandomHexString(8);
  }
  async getProofOfChance() {
    return await buildProofOfChance(this.getChanceAndSalt());
  }
}

async function buildProofOfChance(chanceAndSalt: HexString) {
  return `0x${await Hashes.getSha256FromHexString(chanceAndSalt)}`;
}
