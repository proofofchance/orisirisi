import { ethers } from 'hardhat';
import { expect } from 'chai';
import { BytesLike, parseEther } from 'ethers';
import {
  CoinSide,
  CoinflipGame,
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
      it("credits game's wallet with the sent game wager value", async () => {
        const { creator, coinflipContract, walletsContract } =
          await deployCoinflipContracts();

        const createGameParams = await CreateGameParams.new(coinflipContract);
        const gameId = 1;

        expect(
          await walletsContract.getGameBalance(coinflipContract, gameId)
        ).to.equal(0);

        await coinflipContract.createGame(...createGameParams.toArgs(), {
          value: createGameParams.wager,
        });

        expect(await walletsContract.getBalance(creator)).to.equal(0);
        expect(
          await walletsContract.getGameBalance(coinflipContract, gameId)
        ).to.equal(createGameParams.wager);
      });

      it('simply locks from my wallet balance when no game wager value is sent', async () => {
        const { creator, coinflipContract, walletsContract } =
          await deployCoinflipContracts();

        const createGameParams = await CreateGameParams.new(coinflipContract);

        await walletsContract.credit({
          value: createGameParams.wager,
        });

        expect(await walletsContract.getBalance(creator)).to.equal(
          createGameParams.wager
        );

        await coinflipContract.createGame(...createGameParams.toArgs());

        expect(await walletsContract.getBalance(creator)).to.equal(0);
      });

      it('reverts InsufficientWalletBalance when I do not have enough game wager in my wallet', async () => {
        const { creator, coinflipContract, walletsContract } =
          await deployCoinflipContracts();

        const createGameParams = await CreateGameParams.new(coinflipContract);

        expect(await walletsContract.getBalance(creator)).to.equal(0);

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
      const { coinflipContract, player } = await deployCoinflipContracts();

      const createGameParams = await CreateGameParams.new(coinflipContract);

      await coinflipContract.createGame(...createGameParams.toArgs(), {
        value: createGameParams.wager,
      });

      const gameId = 1;

      await coinflipContract
        .connect(player)
        .playGame(
          gameId,
          oppositeCoinSide(createGameParams.coinSide),
          await ProofOfChance.fromChance(
            'some-chance',
            'random-salt'
          ).getProofOfChance(),
          {
            value: createGameParams.wager,
          }
        );

      expect(await coinflipContract.playCounts(gameId)).to.equal(2);
    });
  });
});

describe('revealChancesAndCreditWinners', () => {
  context('When using valid parameters', () => {
    it('uploads game proofs successfully', async () => {
      const { coinflipContract, player: secondPlayer } =
        await deployCoinflipContracts();

      const firstPlayerPOC = ProofOfChance.fromChance(
        'first-player-chance-2',
        'random-salt'
      );
      const createGameParams = (await CreateGameParams.new(coinflipContract))
        .withProofOfChance(await firstPlayerPOC.getProofOfChance())
        .withNumberOfPlayers(2);

      await coinflipContract.createGame(...createGameParams.toArgs(), {
        value: createGameParams.wager,
      });

      const gameId = 1;

      const secondPlayerPOC = ProofOfChance.fromChance(
        'some-chance',
        'random-salt'
      );
      await coinflipContract
        .connect(secondPlayer)
        .playGame(
          gameId,
          oppositeCoinSide(createGameParams.coinSide),
          await secondPlayerPOC.getProofOfChance(),
          {
            value: createGameParams.wager,
          }
        );

      await coinflipContract.revealChancesAndCreditWinners(
        gameId,
        [1, 2],
        [firstPlayerPOC.getChanceAndSalt(), secondPlayerPOC.getChanceAndSalt()]
      );

      expect(await coinflipContract.playChances(gameId, 1)).to.equal(
        firstPlayerPOC.chance
      );

      expect(await coinflipContract.playChances(gameId, 2)).to.equal(
        secondPlayerPOC.chance
      );
    });
  });
});

export async function deployCoinflipContracts() {
  const [deployer, player, ...otherPlayers] = await ethers.getSigners();

  const walletsContract = await ethers.deployContract('Wallets', deployer);
  const walletsAddress = await walletsContract.getAddress();

  const serviceProviderContract = await ethers.deployContract(
    'ServiceProvider',
    deployer
  );

  const coinflipContract = await ethers.deployContract(
    'Coinflip',
    [
      walletsAddress,
      serviceProviderContract.getAddress(),
      CoinflipGame.maxPossiblePlayers,
      parseEther(CoinflipGame.getMinWagerEth().toString()),
    ],
    deployer
  );

  const wallets = WalletsContract.fromSignerAndAddress(
    deployer,
    walletsAddress
  );
  await wallets.addApp(coinflipContract.getAddress());

  return {
    creator: deployer,
    player,
    otherPlayers,
    walletsContract,
    serviceProviderContract,
    coinflipContract,
  };
}

class CreateGameParams {
  wager: bigint;
  numberOfPlayers: number;
  coinSide: CoinSide;
  proofOfChance: string;

  private constructor(public expiryTimestamp: number) {
    this.wager = parseEther(
      `${getRandomInteger(20, Math.ceil(CoinflipGame.getMinWagerEth()))}`
    );
    this.numberOfPlayers = getRandomInteger(
      CoinflipGame.maxPossiblePlayers,
      CoinflipGame.minPossiblePlayers
    );
    this.coinSide = getRandomCoinSide();
    this.proofOfChance =
      '0x4299a2c05eaaf9f217898179738f3feb40669058bff3b6cb1017aecd48d6dd84';
  }
  withProofOfChance(proofOfChance: BytesLike) {
    this.proofOfChance = proofOfChance.toString();
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
    this.proofOfChance,
  ];

  static async new(coinflipContract: Coinflip) {
    return new CreateGameParams(
      (await coinflipContract.deploymentTransaction()!.getBlock())!.timestamp +
        100
    );
  }
}
