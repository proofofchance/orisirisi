import { ethers } from 'hardhat';
import { expect } from 'chai';
import { BytesLike, parseEther } from 'ethers';
import {
  CoinSide,
  getRandomCoinSide,
  oppositeCoinSide,
} from '@orisirisi/coinflip';
import { WalletsContract } from '../src';
import { Coinflip } from '../typechain-types';
import { getRandomInteger } from '@orisirisi/orisirisi-data-utils';
import { ProofOfChance } from '@orisirisi/proof-of-chance';

describe('createGame', () => {
  context('When using valid parameters', () => {
    context('Game Wager', () => {
      it("credits and lock creator's wallet with the sent game wager value", async () => {
        const { creator, coinflipContract, walletsContract } =
          await deployCoinflipContracts();

        const createGameParams = await CreateGameParams.new(coinflipContract);

        expect(await walletsContract.getBalance(creator)).to.equal(0);

        await coinflipContract.createGame(...createGameParams.toArgs(), {
          value: createGameParams.wager,
        });

        expect(await walletsContract.getBalance(creator)).to.equal(
          createGameParams.wager
        );
        expect(await walletsContract.getWithdrawableBalance(creator)).to.equal(
          0
        );
      });

      it('simply locks from my wallet balance when no game wager value is sent', async () => {
        const { creator, coinflipContract, walletsContract } =
          await deployCoinflipContracts();

        const createGameParams = await CreateGameParams.new(coinflipContract);

        await walletsContract.credit({
          value: createGameParams.wager,
        });

        expect(await walletsContract.getWithdrawableBalance(creator)).to.equal(
          createGameParams.wager
        );

        await coinflipContract.createGame(...createGameParams.toArgs());

        expect(await walletsContract.getWithdrawableBalance(creator)).to.equal(
          0
        );
      });

      it('reverts InsufficientWalletBalance when I do not have enough game wager in my wallet', async () => {
        const { creator, coinflipContract, walletsContract } =
          await deployCoinflipContracts();

        const createGameParams = await CreateGameParams.new(coinflipContract);

        expect(await walletsContract.getWithdrawableBalance(creator)).to.equal(
          0
        );

        expect(
          coinflipContract.createGame(...createGameParams.toArgs())
        ).to.be.revertedWithCustomError(
          coinflipContract,
          'InsufficientWalletBalance'
        );
      });
    });

    it('increments the game count', async () => {
      const { coinflipContract } = await deployCoinflipContracts();

      const createGameParams = await CreateGameParams.new(coinflipContract);

      expect(await coinflipContract.gamesCount()).to.equal(0);
      await coinflipContract.createGame(...createGameParams.toArgs(), {
        value: createGameParams.wager,
      });

      expect(await coinflipContract.gamesCount()).to.equal(1);
    });
  });
});

describe('playGame', () => {
  context('When using valid parameters', () => {
    it('increments a game play count', async () => {
      const { coinflipContract, anotherPlayer } =
        await deployCoinflipContracts();

      const createGameParams = await CreateGameParams.new(coinflipContract);

      await coinflipContract.createGame(...createGameParams.toArgs(), {
        value: createGameParams.wager,
      });

      const gameId = 1;

      await coinflipContract
        .connect(anotherPlayer)
        .playGame(
          gameId,
          oppositeCoinSide(createGameParams.coinSide),
          await ProofOfChance.fromChance('some-chance').toPlayHash(),
          {
            value: createGameParams.wager,
          }
        );

      expect(await coinflipContract.playCounts(gameId)).to.equal(2);
    });
  });
});

describe('uploadGamePlayProof', () => {
  context('When using valid parameters', () => {
    it('uploads game proof successfully', async () => {
      const { coinflipContract, anotherPlayer } =
        await deployCoinflipContracts();

      const createGameParams = (
        await CreateGameParams.new(coinflipContract)
      ).withNumberOfPlayers(2);

      await coinflipContract.createGame(...createGameParams.toArgs(), {
        value: createGameParams.wager,
      });

      const gameId = 1;
      const gamePlayId = 2;

      const anotherPlayerPOC = ProofOfChance.fromChance('some-chance');
      await coinflipContract
        .connect(anotherPlayer)
        .playGame(
          gameId,
          oppositeCoinSide(createGameParams.coinSide),
          await anotherPlayerPOC.toPlayHash(),
          {
            value: createGameParams.wager,
          }
        );

      await coinflipContract
        .connect(anotherPlayer)
        .uploadGamePlayProof(gameId, gamePlayId, anotherPlayerPOC.getProof());

      expect(await coinflipContract.playProofs(gameId, gamePlayId)).to.equal(
        anotherPlayerPOC.getProof()
      );
    });
  });
});

export async function deployCoinflipContracts() {
  const [deployer, anotherPlayer] = await ethers.getSigners();

  const walletsContract = await ethers.deployContract('Wallets', deployer);
  const walletsAddress = await walletsContract.getAddress();

  const serviceProviderContract = await ethers.deployContract(
    'ServiceProvider',
    deployer
  );

  const coinflipContract = await ethers.deployContract(
    'Coinflip',
    [walletsAddress, serviceProviderContract.getAddress()],
    deployer
  );

  const wallets = WalletsContract.fromSignerAndAddress(
    deployer,
    walletsAddress
  );
  await wallets.addApp(coinflipContract.getAddress());

  return {
    creator: deployer,
    anotherPlayer,
    walletsContract,
    serviceProviderContract,
    coinflipContract,
  };
}

class CreateGameParams {
  wager: bigint;
  numberOfPlayers: number;
  coinSide: CoinSide;
  playHash: string;

  private constructor(public expiryTimestamp: number) {
    this.wager = parseEther(`${getRandomInteger(20, 1)}`);
    this.numberOfPlayers = getRandomInteger(20, 2);
    this.coinSide = getRandomCoinSide();
    this.playHash =
      '0x4299a2c05eaaf9f217898179738f3feb40669058bff3b6cb1017aecd48d6dd84';
  }
  withPlayHash(playHash: BytesLike) {
    this.playHash = 'Ox' + playHash.toString();
    return this;
  }
  withNumberOfPlayers(numberOfPlayers: number) {
    this.numberOfPlayers = numberOfPlayers;
    return this;
  }
  toArgs = (): [bigint, number, number, CoinSide, string] => [
    this.wager,
    this.numberOfPlayers,
    this.expiryTimestamp,
    this.coinSide,
    this.playHash,
  ];

  static async new(coinflipContract: Coinflip) {
    return new CreateGameParams(
      (await coinflipContract.deploymentTransaction()!.getBlock())!.timestamp +
        100
    );
  }
}
