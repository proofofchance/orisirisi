import { ethers } from 'hardhat';
import { expect } from 'chai';
import { BytesLike, parseEther } from 'ethers';
import {
  CoinSide,
  CoinflipGame,
  getRandomCoinSide,
  oppositeCoinSide,
} from '@orisirisi/coinflip';
import { Coinflip } from '../typechain-types';
import { getRandomInteger, pickRandom } from '@orisirisi/orisirisi-data-utils';
import { ProofOfChance } from '@orisirisi/proof-of-chance';
import { anyValue } from '@nomicfoundation/hardhat-chai-matchers/withArgs';
import { time } from '@nomicfoundation/hardhat-network-helpers';

describe('createGame', () => {
  context('When using valid parameters', () => {
    context('Number of players', () => {
      it('requires at least number of coin sides', async () => {
        const { coinflipContract } = await deployCoinflipContracts();

        const createGameParams = await CreateGameParams.new(coinflipContract);

        await expect(
          coinflipContract.createGame(
            ...createGameParams.withNumberOfPlayers(1).toArgs(),
            {
              value: createGameParams.wager,
            }
          )
        ).to.be.reverted;
      });
    });

    context('Game Wager', () => {
      it('reverts with MinimumWagerNotMet error with wagers less than minWager', async () => {
        const { coinflipContract } = await deployCoinflipContracts();

        const createGameParams = await CreateGameParams.new(coinflipContract);

        const lessThanMinWager = parseEther(
          (CoinflipGame.getMinWagerEth() - 0.001).toString()
        );
        await expect(
          coinflipContract.createGame(...createGameParams.toArgs(), {
            value: lessThanMinWager,
          })
        ).to.be.revertedWithCustomError(coinflipContract, 'MinimumWagerNotMet');
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
  it('reverts IncorrectGameWager when I send an invalid game wager', async () => {
    const { coinflipContract, player } = await deployCoinflipContracts();

    const createGameParams = await CreateGameParams.new(coinflipContract);

    await coinflipContract.createGame(...createGameParams.toArgs(), {
      value: createGameParams.wager,
    });

    const gameId = 1;

    await expect(
      coinflipContract
        .connect(player)
        .playGame(
          gameId,
          oppositeCoinSide(createGameParams.coinSide),
          await ProofOfChance.fromChance(
            'some-chance',
            getRandomSalt()
          ).getProofOfChance(),
          {
            value: 0,
          }
        )
    ).to.be.revertedWithCustomError(coinflipContract, 'IncorrectGameWager');
  });

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
            getRandomSalt()
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
        'chance-1',
        getRandomSalt()
      );
      const createGameParams = (await CreateGameParams.new(coinflipContract))
        .withProofOfChance(await firstPlayerPOC.getProofOfChance())
        .withNumberOfPlayers(2);

      await coinflipContract.createGame(...createGameParams.toArgs(), {
        value: createGameParams.wager,
      });

      const gameId = 1;

      const secondPlayerPOC = ProofOfChance.fromChance(
        'chance-2',
        getRandomSalt()
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

      await expect(
        coinflipContract.revealChancesAndCreditWinners(gameId, [
          firstPlayerPOC.getChanceAndSalt(),
          secondPlayerPOC.getChanceAndSalt(),
        ])
      )
        .to.emit(coinflipContract, 'GamePlayChanceRevealed')
        .withArgs(1, 1, firstPlayerPOC.getChanceAndSalt())
        .and.to.emit(coinflipContract, 'GamePlayChanceRevealed')
        .withArgs(1, 2, secondPlayerPOC.getChanceAndSalt());
    });

    it('uses the total size of all chances to determine flip outcome', async () => {
      const { coinflipContract, player: secondPlayer } =
        await deployCoinflipContracts();

      const firstChance = 'chance-1';
      const firstPlayerPOC = ProofOfChance.fromChance(
        firstChance,
        getRandomSalt()
      );
      const createGameParams = (await CreateGameParams.new(coinflipContract))
        .withProofOfChance(await firstPlayerPOC.getProofOfChance())
        .withNumberOfPlayers(2);

      await coinflipContract.createGame(...createGameParams.toArgs(), {
        value: createGameParams.wager,
      });

      const gameId = 1;

      const secondChance = 'chance-2';
      const secondPlayerPOC = ProofOfChance.fromChance(
        secondChance,
        getRandomSalt()
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

      const expectedOutcome: CoinSide =
        (firstChance.length + secondChance.length) % 2;

      await expect(
        coinflipContract.revealChancesAndCreditWinners(gameId, [
          firstPlayerPOC.getChanceAndSalt(),
          secondPlayerPOC.getChanceAndSalt(),
        ])
      )
        .to.emit(coinflipContract, 'GameCompleted')
        .withArgs(1, expectedOutcome, anyValue);
    });
  });
});

describe('refundExpiredGamePlayersForAllGames', () => {
  context('When using valid parameters', () => {
    it('refunds expired game wager successfully', async () => {
      const { coinflipContract, creator, walletsContract } =
        await deployCoinflipContracts();

      const firstPlayerPOC = ProofOfChance.fromChance(
        'chance-1',
        getRandomSalt()
      );
      const createGameParams = (await CreateGameParams.new(coinflipContract))
        .withProofOfChance(await firstPlayerPOC.getProofOfChance())
        .withNumberOfPlayers(2)
        .withExpiryTimestampFromNow(200);

      await coinflipContract.createGame(...createGameParams.toArgs(), {
        value: createGameParams.wager,
      });

      const gameId = 1;

      await time.increaseTo(createGameParams.expiryTimestamp + 200);

      const balanceBeforeRefund = await walletsContract.getBalance(creator);

      await expect(
        coinflipContract.refundExpiredGamePlayersForAllGames([gameId])
      )
        .to.emit(coinflipContract, 'ExpiredGameRefunded')
        .withArgs(1, anyValue);

      const balanceAfterRefund = await walletsContract.getBalance(creator);

      expect(balanceAfterRefund).to.be.greaterThan(balanceBeforeRefund);
    });
  });
});

export async function deployCoinflipContracts() {
  const [deployer, player, ...otherPlayers] = await ethers.getSigners();

  const walletsContract = await ethers.deployContract('Wallets', deployer);
  const walletsAddress = await walletsContract.getAddress();

  const coinflipContract = await ethers.deployContract(
    'Coinflip',
    [
      walletsAddress,
      CoinflipGame.maxNumberOfPlayers,
      parseEther(CoinflipGame.getMinWagerEth().toString()),
    ],
    deployer
  );

  return {
    creator: deployer,
    player,
    otherPlayers,
    walletsContract,
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
      CoinflipGame.maxNumberOfPlayers,
      CoinflipGame.minNumberOfPlayers
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
  withExpiryTimestampFromNow(expiryTimestampMs: number) {
    this.expiryTimestamp = new Date().getTime() + expiryTimestampMs;
    return this;
  }
  toArgs = (): [number, number, CoinSide, string] => [
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

const getRandomSalt = () =>
  pickRandom([
    '0x7131d177b1de6b6f',
    '0x7131d177b1de5b2f',
    '0x5131d177b1de6b6f',
    '0x7141d177b1de6b6f',
  ]);
