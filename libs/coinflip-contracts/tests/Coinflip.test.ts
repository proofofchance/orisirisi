import { ethers } from 'hardhat';
import { expect } from 'chai';
import { BytesLike, parseEther } from 'ethers';
import {
  CoinSide,
  CoinflipGame,
  CoinflipGameStatusEnum,
  getRandomCoinSide,
  oppositeCoinSide,
} from '@orisirisi/coinflip';
import { Coinflip } from '../typechain-types';
import { getRandomInteger, pickRandom } from '@orisirisi/orisirisi-data-utils';
import { ProofOfChance } from '@orisirisi/proof-of-chance';
import { anyValue } from '@nomicfoundation/hardhat-chai-matchers/withArgs';
import { time } from '@nomicfoundation/hardhat-network-helpers';
import { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers';

describe('receive', () => {
  context('when ether is sent to contract randomly', () => {
    it('credits wallet balance of sender', async () => {
      const {
        coinflipContract,
        player: anyOne,
        walletsContract,
      } = await deployCoinflipContracts();

      expect(await walletsContract.getBalance(anyOne)).to.equal(0);

      const anyAmount = parseEther('1.39');
      await anyOne.sendTransaction({
        to: coinflipContract.getAddress(),
        value: anyAmount,
      });

      expect(await walletsContract.getBalance(anyOne)).to.equal(anyAmount);
    });
  });
});

describe('updateWallets', () => {
  context('authorization', () => {
    it('reverts with OwnableUnauthorizedAccount error for non owners', async () => {
      const { coinflipContract, player: notOwner } =
        await deployCoinflipContracts();

      const initialWalletsAddress = await coinflipContract.wallets();

      const { walletsAddress: notOwnerNewWalletsContractAddress } =
        await deployWalletsContract(notOwner);

      await expect(
        coinflipContract
          .connect(notOwner)
          .updateWallets(notOwnerNewWalletsContractAddress)
      ).to.be.revertedWithCustomError(
        coinflipContract,
        'OwnableUnauthorizedAccount'
      );

      expect(await coinflipContract.wallets()).to.equal(initialWalletsAddress);
    });
  });

  it('updates wallet contract address', async () => {
    const { coinflipContract, creator: owner } =
      await deployCoinflipContracts();

    const initialWalletsAddress = await coinflipContract.wallets();

    const { walletsAddress: ownerNewWalletsContractAddress } =
      await deployWalletsContract(owner);

    await coinflipContract
      .connect(owner)
      .updateWallets(ownerNewWalletsContractAddress);

    expect(await coinflipContract.wallets()).to.equal(
      ownerNewWalletsContractAddress
    );

    expect(await coinflipContract.wallets()).to.not.equal(
      initialWalletsAddress
    );
  });
});

describe('updateMaxNumberOfPlayers', () => {
  context('For `not owners`', async () => {
    it('reverts with OwnableUnauthorizedAccount error', async () => {
      const { coinflipContract, player: notOwner } =
        await deployCoinflipContracts();

      const initialMaxNumberOfPlayers =
        await coinflipContract.maxNumberOfPlayers();

      const newMaxNumberOfPlayers = initialMaxNumberOfPlayers + BigInt(2);

      await expect(
        coinflipContract
          .connect(notOwner)
          .updateMaxNumberOfPlayers(newMaxNumberOfPlayers)
      ).to.be.revertedWithCustomError(
        coinflipContract,
        'OwnableUnauthorizedAccount'
      );

      expect(await coinflipContract.maxNumberOfPlayers()).to.equal(
        initialMaxNumberOfPlayers
      );
    });
  });

  context('For owner', () => {
    it('updates maxNumberOfPlayers', async () => {
      const { coinflipContract, creator: owner } =
        await deployCoinflipContracts();

      const initialMaxNumberOfPlayers =
        await coinflipContract.maxNumberOfPlayers();

      const newMaxNumberOfPlayers = initialMaxNumberOfPlayers + BigInt(2);

      await coinflipContract
        .connect(owner)
        .updateMaxNumberOfPlayers(newMaxNumberOfPlayers);

      expect(await coinflipContract.maxNumberOfPlayers()).to.equal(
        newMaxNumberOfPlayers
      );

      expect(await coinflipContract.maxNumberOfPlayers()).to.not.equal(
        initialMaxNumberOfPlayers
      );
    });
  });
});

describe('updateMinWager', () => {
  context('For `not owners`', async () => {
    it('reverts with OwnableUnauthorizedAccount error', async () => {
      const { coinflipContract, player: notOwner } =
        await deployCoinflipContracts();

      const initialMinWager = await coinflipContract.minWager();

      const newMinWager = initialMinWager + BigInt(2);

      await expect(
        coinflipContract.connect(notOwner).updateMinWager(newMinWager)
      ).to.be.revertedWithCustomError(
        coinflipContract,
        'OwnableUnauthorizedAccount'
      );

      expect(await coinflipContract.minWager()).to.equal(initialMinWager);
    });
  });

  context('For owner', () => {
    it('updates minWager', async () => {
      const { coinflipContract, creator: owner } =
        await deployCoinflipContracts();

      const initialMinWager = await coinflipContract.minWager();

      const newMinWager = initialMinWager + BigInt(2);

      await coinflipContract.connect(owner).updateMinWager(newMinWager);

      expect(await coinflipContract.minWager()).to.equal(newMinWager);

      expect(await coinflipContract.minWager()).to.not.equal(initialMinWager);
    });
  });
});

describe('createGame', () => {
  context('Number of players', () => {
    it('requires at least 2 players respective the number of coin sides', async () => {
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

    it('reverts with MaxNumberOfPlayersError when it is exceeded', async () => {
      const { coinflipContract } = await deployCoinflipContracts();

      const createGameParams = await CreateGameParams.new(coinflipContract);

      await expect(
        coinflipContract.createGame(
          ...createGameParams
            .withNumberOfPlayers(CoinflipGame.maxNumberOfPlayers + 1)
            .toArgs(),
          {
            value: createGameParams.wager,
          }
        )
      ).to.be.revertedWithCustomError(
        coinflipContract,
        'MaxNumberOfPlayersError'
      );
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

    it('sets game wager otherwise', async () => {
      const { coinflipContract } = await deployCoinflipContracts();

      const createGameParams = await CreateGameParams.new(coinflipContract);

      const gameID = 1;

      expect(await coinflipContract.wagers(gameID)).to.equal(0);

      await coinflipContract.createGame(...createGameParams.toArgs(), {
        value: createGameParams.wager,
      });

      expect(await coinflipContract.wagers(gameID)).to.equal(
        createGameParams.wager
      );
    });
  });

  it('creates game play', async () => {
    const { coinflipContract, creator } = await deployCoinflipContracts();

    const createGameParams = await CreateGameParams.new(coinflipContract);

    const gameID = 1;
    const expectedPlayID = 1;

    await coinflipContract.createGame(...createGameParams.toArgs(), {
      value: createGameParams.wager,
    });

    expect(
      await coinflipContract.proofOfChances(gameID, expectedPlayID)
    ).to.equal(createGameParams.proofOfChance);
    expect(await coinflipContract.playCountsSoFar(gameID)).to.equal(1);
    expect(await coinflipContract.numberOfPlayersForGameWith(gameID)).to.equal(
      createGameParams.numberOfPlayers
    );
    expect(
      await coinflipContract.players(gameID, createGameParams.coinSide, 0)
    ).to.equal(await creator.getAddress());
    expect(await coinflipContract.allPlayers(gameID, 0)).to.equal(
      await creator.getAddress()
    );
  });

  it('sets game expiry', async () => {
    const { coinflipContract } = await deployCoinflipContracts();

    const createGameParams = await CreateGameParams.new(coinflipContract);

    const gameID = 1;

    expect(await coinflipContract.expiryTimestamps(gameID)).to.equal(0);

    await coinflipContract.createGame(...createGameParams.toArgs(), {
      value: createGameParams.wager,
    });

    expect(await coinflipContract.expiryTimestamps(gameID)).to.equal(
      createGameParams.expiryTimestamp
    );
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

  it('it reverts when coinflip is inoperational', async () => {
    const { coinflipContract } = await deployCoinflipContracts();

    coinflipContract.setIsOperational(false);

    const createGameParams = await CreateGameParams.new(coinflipContract);

    expect(await coinflipContract.gamesCount()).to.equal(0);

    await expect(
      coinflipContract.createGame(...createGameParams.toArgs(), {
        value: createGameParams.wager,
      })
    ).to.be.revertedWithCustomError(coinflipContract, 'InOperational');

    expect(await coinflipContract.gamesCount()).to.equal(0);
  });
});

describe('playGame', () => {
  it('reverts IncorrectGameWager when I send an invalid game wager', async () => {
    const { coinflipContract, player } = await deployCoinflipContracts();

    const createGameParams = await CreateGameParams.new(coinflipContract);

    await coinflipContract.createGame(...createGameParams.toArgs(), {
      value: createGameParams.wager,
    });

    const gameID = 1;

    await expect(
      coinflipContract
        .connect(player)
        .playGame(
          gameID,
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

  it('increments a game play count', async () => {
    const { coinflipContract, player } = await deployCoinflipContracts();

    const createGameParams = await CreateGameParams.new(coinflipContract);

    await coinflipContract.createGame(...createGameParams.toArgs(), {
      value: createGameParams.wager,
    });

    const gameID = 1;

    const playGameParams = (
      await CreateGameParams.new(coinflipContract)
    ).withWager(createGameParams.wager);

    await coinflipContract
      .connect(player)
      .playGame(
        gameID,
        oppositeCoinSide(playGameParams.coinSide),
        await ProofOfChance.fromChance(
          'some-chance',
          getRandomSalt()
        ).getProofOfChance(),
        {
          value: playGameParams.wager,
        }
      );

    expect(await coinflipContract.playCountsSoFar(gameID)).to.equal(2);
  });

  it('reverts with AllMatchingPlaysError when all coinsides match', async () => {
    const { coinflipContract, player } = await deployCoinflipContracts();

    const createGameParams = (
      await CreateGameParams.new(coinflipContract)
    ).withNumberOfPlayers(2);

    await coinflipContract.createGame(...createGameParams.toArgs(), {
      value: createGameParams.wager,
    });

    const gameID = 1;

    const playGameParams = (
      await CreateGameParams.new(coinflipContract)
    ).withWager(createGameParams.wager);

    await expect(
      coinflipContract
        .connect(player)
        .playGame(
          gameID,
          createGameParams.coinSide,
          await ProofOfChance.fromChance(
            'some-chance',
            getRandomSalt()
          ).getProofOfChance(),
          {
            value: playGameParams.wager,
          }
        )
    ).to.be.revertedWithCustomError(coinflipContract, 'AllMatchingPlaysError');

    expect(await coinflipContract.playCountsSoFar(gameID)).to.equal(1);
  });

  it('reverts with AlreadyPlayedError if player already played', async () => {
    const { coinflipContract, player } = await deployCoinflipContracts();

    const createGameParams = (
      await CreateGameParams.new(coinflipContract)
    ).withNumberOfPlayers(3);

    await coinflipContract.createGame(...createGameParams.toArgs(), {
      value: createGameParams.wager,
    });

    const gameID = 1;

    const playGameParams = (
      await CreateGameParams.new(coinflipContract)
    ).withWager(createGameParams.wager);

    await coinflipContract
      .connect(player)
      .playGame(
        gameID,
        createGameParams.coinSide,
        await ProofOfChance.fromChance(
          'some-chance',
          getRandomSalt()
        ).getProofOfChance(),
        {
          value: playGameParams.wager,
        }
      );

    expect(await coinflipContract.playCountsSoFar(gameID)).to.equal(2);

    await expect(
      coinflipContract
        .connect(player)
        .playGame(
          gameID,
          oppositeCoinSide(createGameParams.coinSide),
          await ProofOfChance.fromChance(
            'some-chance',
            getRandomSalt()
          ).getProofOfChance(),
          {
            value: playGameParams.wager,
          }
        )
    ).to.be.revertedWithCustomError(coinflipContract, 'AlreadyPlayedError');

    expect(await coinflipContract.playCountsSoFar(gameID)).to.equal(2);
  });

  it('creates game play', async () => {
    const { coinflipContract, player } = await deployCoinflipContracts();

    const createGameParams = await CreateGameParams.new(coinflipContract);

    await coinflipContract.createGame(...createGameParams.toArgs(), {
      value: createGameParams.wager,
    });

    const gameID = 1;
    const expectedPlayID = 1;

    const playGameParams = (await CreateGameParams.new(coinflipContract))
      .withWager(createGameParams.wager)
      .withCoinSide(oppositeCoinSide(createGameParams.coinSide));

    await coinflipContract
      .connect(player)
      .playGame(
        gameID,
        playGameParams.coinSide,
        await ProofOfChance.fromChance(
          'some-chance',
          getRandomSalt()
        ).getProofOfChance(),
        {
          value: playGameParams.wager,
        }
      );

    expect(
      await coinflipContract.proofOfChances(gameID, expectedPlayID)
    ).to.equal(playGameParams.proofOfChance);
    expect(await coinflipContract.playCountsSoFar(gameID)).to.equal(2);
    expect(await coinflipContract.numberOfPlayersForGameWith(gameID)).to.equal(
      createGameParams.numberOfPlayers
    );
    expect(
      await coinflipContract.players(gameID, playGameParams.coinSide, 0)
    ).to.equal(await player.getAddress());
    expect(await coinflipContract.allPlayers(gameID, 1)).to.equal(
      await player.getAddress()
    );
  });

  it('it reverts when coinflip is inoperational', async () => {
    const { coinflipContract, player } = await deployCoinflipContracts();

    const createGameParams = await CreateGameParams.new(coinflipContract);

    await coinflipContract.createGame(...createGameParams.toArgs(), {
      value: createGameParams.wager,
    });

    const gameID = 1;

    const playGameParams = (
      await CreateGameParams.new(coinflipContract)
    ).withWager(createGameParams.wager);

    coinflipContract.setIsOperational(false);

    await expect(
      coinflipContract
        .connect(player)
        .playGame(
          gameID,
          oppositeCoinSide(playGameParams.coinSide),
          await ProofOfChance.fromChance(
            'some-chance',
            getRandomSalt()
          ).getProofOfChance(),
          {
            value: playGameParams.wager,
          }
        )
    ).to.be.revertedWithCustomError(coinflipContract, 'InOperational');
  });

  it('reverts InvalidGameStatus when game is AwaitingChancesReveal', async () => {
    const {
      coinflipContract,
      player,
      otherPlayers: [anotherPlayer],
    } = await deployCoinflipContracts();

    const createGameParams = (
      await CreateGameParams.new(coinflipContract)
    ).withNumberOfPlayers(2);

    await coinflipContract.createGame(...createGameParams.toArgs(), {
      value: createGameParams.wager,
    });

    const gameID = 1;

    const playGameParams = (await CreateGameParams.new(coinflipContract))
      .withWager(createGameParams.wager)
      .withCoinSide(oppositeCoinSide(createGameParams.coinSide));

    await coinflipContract
      .connect(player)
      .playGame(
        gameID,
        playGameParams.coinSide,
        await ProofOfChance.fromChance(
          'some-chance',
          getRandomSalt()
        ).getProofOfChance(),
        {
          value: playGameParams.wager,
        }
      );

    expect(await coinflipContract.getGameStatus(gameID)).to.equal(
      CoinflipGameStatusEnum.AwaitingChancesReveal
    );

    await expect(
      coinflipContract
        .connect(anotherPlayer)
        .playGame(
          gameID,
          oppositeCoinSide(playGameParams.coinSide),
          await ProofOfChance.fromChance(
            'some-chance',
            getRandomSalt()
          ).getProofOfChance(),
          {
            value: playGameParams.wager,
          }
        )
    ).to.be.revertedWithCustomError(coinflipContract, 'InvalidGameStatus');
  });

  it('reverts InvalidGameStatus when game is Expired', async () => {
    const {
      coinflipContract,
      otherPlayers: [anotherPlayer],
    } = await deployCoinflipContracts();

    const createGameParams = (await CreateGameParams.new(coinflipContract))
      .withNumberOfPlayers(2)
      .withExpiryTimestampFromNow(200);

    await coinflipContract.createGame(...createGameParams.toArgs(), {
      value: createGameParams.wager,
    });

    const gameID = 1;

    const playGameParams = (await CreateGameParams.new(coinflipContract))
      .withWager(createGameParams.wager)
      .withCoinSide(oppositeCoinSide(createGameParams.coinSide));

    await time.increaseTo(createGameParams.expiryTimestamp + 200);

    expect(await coinflipContract.getGameStatus(gameID)).to.equal(
      CoinflipGameStatusEnum.Expired
    );

    await expect(
      coinflipContract
        .connect(anotherPlayer)
        .playGame(
          gameID,
          oppositeCoinSide(playGameParams.coinSide),
          await ProofOfChance.fromChance(
            'some-chance',
            getRandomSalt()
          ).getProofOfChance(),
          {
            value: playGameParams.wager,
          }
        )
    ).to.be.revertedWithCustomError(coinflipContract, 'InvalidGameStatus');
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

      const gameID = 1;

      const secondPlayerPOC = ProofOfChance.fromChance(
        'chance-2',
        getRandomSalt()
      );
      await coinflipContract
        .connect(secondPlayer)
        .playGame(
          gameID,
          oppositeCoinSide(createGameParams.coinSide),
          await secondPlayerPOC.getProofOfChance(),
          {
            value: createGameParams.wager,
          }
        );

      await expect(
        coinflipContract.revealChancesAndCreditWinners(gameID, [
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

      const gameID = 1;

      const secondChance = 'chance-2';
      const secondPlayerPOC = ProofOfChance.fromChance(
        secondChance,
        getRandomSalt()
      );
      await coinflipContract
        .connect(secondPlayer)
        .playGame(
          gameID,
          oppositeCoinSide(createGameParams.coinSide),
          await secondPlayerPOC.getProofOfChance(),
          {
            value: createGameParams.wager,
          }
        );

      const expectedOutcome: CoinSide =
        (firstChance.length + secondChance.length) % 2;

      await expect(
        coinflipContract.revealChancesAndCreditWinners(gameID, [
          firstPlayerPOC.getChanceAndSalt(),
          secondPlayerPOC.getChanceAndSalt(),
        ])
      )
        .to.emit(coinflipContract, 'GameCompleted')
        .withArgs(1, expectedOutcome, anyValue);

      await expect(
        coinflipContract.revealChancesAndCreditWinners(gameID, [
          firstPlayerPOC.getChanceAndSalt(),
          secondPlayerPOC.getChanceAndSalt(),
        ])
      ).to.be.revertedWithCustomError(coinflipContract, 'InvalidGameStatus');
    });
  });
});

describe('refundExpiredGamePlayersForGames', () => {
  it('refunds expired game wager successfully', async () => {
    const {
      coinflipContract,
      creator,
      walletsContract,
      player: anotherPlayer,
    } = await deployCoinflipContracts();

    const firstPlayerPOC = ProofOfChance.fromChance(
      'chance-1',
      getRandomSalt()
    );
    const createGameParams = (await CreateGameParams.new(coinflipContract))
      .withProofOfChance(await firstPlayerPOC.getProofOfChance())
      .withNumberOfPlayers(2)
      .withExpiryTimestampFromNow(400);

    await coinflipContract.createGame(...createGameParams.toArgs(), {
      value: createGameParams.wager,
    });

    const gameID = 1;

    await time.increaseTo(createGameParams.expiryTimestamp + 400);

    const balanceBeforeRefund = await walletsContract.getBalance(creator);

    expect(await coinflipContract.getGameStatus(gameID)).to.equal(
      CoinflipGameStatusEnum.Expired
    );

    await expect(coinflipContract.adjustExpiryForGame(gameID, now())).to.be
      .reverted;

    await expect(coinflipContract.refundExpiredGamePlayersForGames([gameID]))
      .to.emit(coinflipContract, 'ExpiredGameRefunded')
      .withArgs(1, anyValue);

    const balanceAfterRefund = await walletsContract.getBalance(creator);

    expect(balanceAfterRefund).to.be.greaterThan(balanceBeforeRefund);

    expect(await coinflipContract.getGameStatus(gameID)).to.equal(
      CoinflipGameStatusEnum.Concluded
    );

    await expect(coinflipContract.adjustExpiryForGame(gameID, now())).to.be
      .reverted;

    await expect(
      coinflipContract
        .connect(anotherPlayer)
        .playGame(
          gameID,
          createGameParams.coinSide,
          await ProofOfChance.fromChance(
            'some-chance',
            getRandomSalt()
          ).getProofOfChance(),
          {
            value: createGameParams.wager,
          }
        )
    ).to.be.revertedWithCustomError(coinflipContract, 'InvalidGameStatus');

    await expect(
      coinflipContract.refundExpiredGamePlayersForGames([gameID])
    ).to.be.revertedWithCustomError(coinflipContract, 'InvalidGameStatus');
  });
});

describe('getSplitAndServiceChargeAmounts', () => {
  it('for evenly splitable amounts, returns the split amount', async () => {
    const { coinflipContract } = await deployCoinflipContracts();

    await coinflipContract.updateServiceChargePercent(0);

    const [splitAmount, serviceChargeAmount] =
      await coinflipContract.getSplitAndServiceChargeAmounts(BigInt('10'), 2);

    expect(splitAmount).to.equal(BigInt('5'));
    expect(serviceChargeAmount).to.equal(0);
  });

  it('returns the split amount and equivalent service charge amount', async () => {
    const { coinflipContract } = await deployCoinflipContracts();

    await coinflipContract.updateServiceChargePercent(10);

    const [splitAmount, serviceChargeAmount] =
      await coinflipContract.getSplitAndServiceChargeAmounts(BigInt('200'), 2);

    expect(splitAmount).to.equal(BigInt('90'));
    expect(serviceChargeAmount).to.equal(2 * 10);
  });

  it('returns the split amount and equivalent service charge amount for uneven splits', async () => {
    const { coinflipContract } = await deployCoinflipContracts();

    await coinflipContract.updateServiceChargePercent(10);

    const [splitAmount, serviceChargeAmount] =
      await coinflipContract.getSplitAndServiceChargeAmounts(BigInt('200'), 3);

    expect(splitAmount).to.equal(BigInt('60'));
    expect(serviceChargeAmount).to.equal(2 * 10);
  });

  it('returns the split amount with extra wei and a slightly deducted equivalent service charge amount for ceiled wei splits', async () => {
    const { coinflipContract } = await deployCoinflipContracts();

    await coinflipContract.updateServiceChargePercent(10);

    const [splitAmount, serviceChargeAmount] =
      await coinflipContract.getSplitAndServiceChargeAmounts(
        BigInt('200000000000000008'),
        3
      );

    expect(splitAmount).to.equal(BigInt('60000000000000003'));
    expect(serviceChargeAmount).to.equal(BigInt('19999999999999999'));
  });

  it('returns the service charge amount  with extra wei and a slightly deducted split amount for floored wei splits', async () => {
    const { coinflipContract } = await deployCoinflipContracts();

    await coinflipContract.updateServiceChargePercent(10);

    const [splitAmount, serviceChargeAmount] =
      await coinflipContract.getSplitAndServiceChargeAmounts(
        BigInt('200000000000000008'),
        5
      );

    expect(splitAmount).to.equal(BigInt('36000000000000001'));
    expect(serviceChargeAmount).to.equal(BigInt('20000000000000003'));
  });
});

describe('adjustExpiryForGame', () => {
  context('authorization', () => {
    it('reverts with OwnableUnauthorizedAccount error for non owners', async () => {
      const { coinflipContract, player: notOwner } =
        await deployCoinflipContracts();

      const createGameParams = await CreateGameParams.new(coinflipContract);

      await coinflipContract.createGame(...createGameParams.toArgs(), {
        value: createGameParams.wager,
      });

      const gameID = 1;
      await expect(
        coinflipContract.connect(notOwner).adjustExpiryForGame(gameID, now())
      ).to.be.revertedWithCustomError(
        coinflipContract,
        'OwnableUnauthorizedAccount'
      );

      expect(await coinflipContract.expiryTimestamps(gameID)).to.equal(
        createGameParams.expiryTimestamp
      );
    });
  });

  it('adjusts expiry for games awaiting players', async () => {
    const { coinflipContract } = await deployCoinflipContracts();

    const createGameParams = (
      await CreateGameParams.new(coinflipContract)
    ).withNumberOfPlayers(2);

    await coinflipContract.createGame(...createGameParams.toArgs(), {
      value: createGameParams.wager,
    });

    const gameID = 1;

    expect(await coinflipContract.getGameStatus(gameID)).to.equal(
      CoinflipGameStatusEnum.AwaitingPlayers
    );

    const newExpiry = createGameParams.expiryTimestamp + 1_000;

    await coinflipContract.adjustExpiryForGame(gameID, newExpiry);

    expect(await coinflipContract.expiryTimestamps(gameID)).to.equal(newExpiry);
  });

  it('adjusts expiry for games awaiting chances', async () => {
    const { coinflipContract, player } = await deployCoinflipContracts();

    const createGameParams = (
      await CreateGameParams.new(coinflipContract)
    ).withNumberOfPlayers(2);

    await coinflipContract.createGame(...createGameParams.toArgs(), {
      value: createGameParams.wager,
    });

    const gameID = 1;

    const playGameParams = (await CreateGameParams.new(coinflipContract))
      .withWager(createGameParams.wager)
      .withCoinSide(oppositeCoinSide(createGameParams.coinSide));

    await coinflipContract
      .connect(player)
      .playGame(
        gameID,
        playGameParams.coinSide,
        await ProofOfChance.fromChance(
          'some-chance',
          getRandomSalt()
        ).getProofOfChance(),
        {
          value: playGameParams.wager,
        }
      );

    expect(await coinflipContract.getGameStatus(gameID)).to.equal(
      CoinflipGameStatusEnum.AwaitingChancesReveal
    );

    const newExpiry = now() + 1000;

    await coinflipContract.adjustExpiryForGame(gameID, newExpiry);

    expect(await coinflipContract.expiryTimestamps(gameID)).to.equal(newExpiry);
  });

  it('reverts when adjusted expiry timestamp is in the past', async () => {
    const { coinflipContract } = await deployCoinflipContracts();

    const createGameParams = (
      await CreateGameParams.new(coinflipContract)
    ).withNumberOfPlayers(2);

    await coinflipContract.createGame(...createGameParams.toArgs(), {
      value: createGameParams.wager,
    });

    const gameID = 1;

    expect(await coinflipContract.getGameStatus(gameID)).to.equal(
      CoinflipGameStatusEnum.AwaitingPlayers
    );

    const newExpiry = now() - 1_000;

    await expect(
      coinflipContract.adjustExpiryForGame(gameID, newExpiry)
    ).to.be.revertedWithCustomError(coinflipContract, 'InvalidExpiryTimestamp');

    expect(await coinflipContract.expiryTimestamps(gameID)).to.equal(
      createGameParams.expiryTimestamp
    );
    expect(await coinflipContract.expiryTimestamps(gameID)).to.not.equal(
      newExpiry
    );
  });
});

async function deployCoinflipContracts() {
  const [deployer, player, ...otherPlayers] = await ethers.getSigners();

  const { walletsAddress, walletsContract } = await deployWalletsContract(
    deployer
  );

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

async function deployWalletsContract(deployer: HardhatEthersSigner) {
  const walletsContract = await ethers.deployContract('Wallets', deployer);
  const walletsAddress = await walletsContract.getAddress();

  return { walletsContract, walletsAddress };
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
  withWager(wager: bigint) {
    this.wager = wager;
    return this;
  }
  withProofOfChance(proofOfChance: BytesLike) {
    this.proofOfChance = proofOfChance.toString();
    return this;
  }
  withNumberOfPlayers(numberOfPlayers: number) {
    this.numberOfPlayers = numberOfPlayers;
    return this;
  }
  withCoinSide(coinSide: CoinSide) {
    this.coinSide = coinSide;
    return this;
  }
  withExpiryTimestampFromNow(expiryTimestampMs: number) {
    this.expiryTimestamp = now() + expiryTimestampMs;
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

const now = () => new Date().getTime();
const getRandomSalt = () =>
  pickRandom([
    '0x7131d177b1de6b6f',
    '0x7131d177b1de5b2f',
    '0x5131d177b1de6b6f',
    '0x7141d177b1de6b6f',
  ]);
