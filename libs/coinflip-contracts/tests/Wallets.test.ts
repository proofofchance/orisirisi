import { ethers } from 'hardhat';
import { expect } from 'chai';
import { parseEther } from 'ethers';

describe('receive', () => {
  context('when I send ether', () => {
    it('adds the ether amount sent to my balance', async () => {
      const { creator, walletsContract } = await deployWalletContract();

      const amount = parseEther('2');

      await creator.sendTransaction({
        to: walletsContract.getAddress(),
        value: amount,
      });

      expect(await walletsContract.getBalance(creator.address)).to.equal(
        amount
      );
    });
  });
});

describe('debitForGame', () => {
  it('removes from balance of owner', async () => {
    const {
      creator: player,
      otherOwners: apps,
      walletsContract,
    } = await deployWalletContract();
    const app = apps[0];
    await walletsContract.addApp(app.address);

    const balance = parseEther('2');
    await player.sendTransaction({
      to: walletsContract.getAddress(),
      value: balance,
    });

    const gameID = 1;
    await walletsContract.connect(app).debitForGame(gameID, player, balance);

    expect(await walletsContract.getBalance(player.address)).to.equal(0);
  });
  it('adds to game balance of owner', async () => {
    const {
      creator: player,
      otherOwners: apps,
      walletsContract,
    } = await deployWalletContract();
    const app = apps[0];
    await walletsContract.addApp(app.address);

    const balance = parseEther('2');
    await player.sendTransaction({
      to: walletsContract.getAddress(),
      value: balance,
    });

    const gameID = 1;
    await walletsContract.connect(app).debitForGame(gameID, player, balance);

    expect(await walletsContract.getGameBalance(app, gameID)).to.equal(balance);
  });

  context(
    'when game balance is less than amount being debited for the game',
    () => {
      it('reverts with InsufficientFundsError ', async () => {
        const {
          creator: player,
          otherOwners: apps,
          walletsContract,
        } = await deployWalletContract();
        const app = apps[0];
        await walletsContract.addApp(app.address);

        const balance = parseEther('2');
        await player.sendTransaction({
          to: walletsContract.getAddress(),
          value: balance,
        });

        const gameID = 1;
        await expect(
          walletsContract
            .connect(app)
            .debitForGame(gameID, player, parseEther('2.01'))
        ).to.be.revertedWithCustomError(walletsContract, 'InsufficientFunds');

        expect(await walletsContract.getBalance(player.address)).to.equal(
          balance
        );
        expect(await walletsContract.getGameBalance(app, gameID)).to.equal(0);
      });
    }
  );
});

describe('creditPlayer', () => {
  it('adds to the wallet balance for the specified player', async () => {
    const { otherOwners: otherPlayers, walletsContract } =
      await deployWalletContract();
    const anotherPlayer = otherPlayers[0];

    const amount = parseEther('2');
    await walletsContract.creditPlayer(anotherPlayer, { value: amount });

    expect(await walletsContract.getBalance(anotherPlayer.address)).to.equal(
      amount
    );
  });
});

describe('creditPlayers', () => {
  it('requires amount to be equally divisible among players', async () => {
    const { otherOwners: otherPlayers, walletsContract } =
      await deployWalletContract();
    const players = otherPlayers.map((p) => p.address).slice(0, 3);

    const amount = parseEther('0.000000017');
    await expect(walletsContract.creditPlayers(players, { value: amount })).to
      .be.reverted;
  });

  it('requires amount to be equally divisible among players', async () => {
    const { otherOwners: otherPlayers, walletsContract } =
      await deployWalletContract();
    const players = otherPlayers.map((p) => p.address).slice(0, 5);

    const amount = parseEther('0.000000017');
    await walletsContract.creditPlayers(players, { value: amount });

    for (const player of players) {
      expect(await walletsContract.getBalance(player)).to.be.greaterThan(0);
    }
  });
});

describe('withdraw', () => {
  it('removes amount from your balance', async () => {
    const { creator, walletsContract } = await deployWalletContract();

    const amount = parseEther('2');
    await walletsContract.credit({ value: amount });

    expect(await walletsContract.getBalance(creator)).to.equal(amount);

    const amountWithdrawn = parseEther('1');

    await walletsContract.withdraw(amountWithdrawn);

    expect(await walletsContract.getBalance(creator)).to.equal(
      amount - amountWithdrawn
    );
  });

  it('transfers the removed amount to your ether balance', async () => {
    const { creator, walletsContract } = await deployWalletContract();

    const initialBalance = await ethers.provider.getBalance(creator);

    const amount = parseEther('2');
    await walletsContract.credit({ value: amount });

    const balanceAfterCreditingWallet = await ethers.provider.getBalance(
      creator
    );

    expect(initialBalance - balanceAfterCreditingWallet).to.be.greaterThan(
      amount
    );

    const amountWithdrawn = parseEther('1');

    await walletsContract.withdraw(amountWithdrawn);

    const balanceAfterWithdrawal = await ethers.provider.getBalance(creator);

    expect(balanceAfterWithdrawal).to.be.greaterThan(
      balanceAfterCreditingWallet
    );
  });

  it('reverts if amount is more than your balance', async () => {
    const { walletsContract } = await deployWalletContract();

    const amount = parseEther('2');
    await walletsContract.credit({ value: amount });

    const amountWithdrawn = amount + parseEther('1');

    await expect(
      walletsContract.withdraw(amountWithdrawn)
    ).to.be.revertedWithCustomError(walletsContract, 'InsufficientFunds');
  });
});

describe('withdrawAll', () => {
  it('removes all amount from your balance', async () => {
    const { creator, walletsContract } = await deployWalletContract();

    const amount = parseEther('2');
    await walletsContract.credit({ value: amount });

    expect(await walletsContract.getBalance(creator)).to.equal(amount);

    await walletsContract.withdrawAll();

    expect(await walletsContract.getBalance(creator)).to.equal(0);
  });

  it('transfers the removed amount to your ether balance', async () => {
    const { creator, walletsContract } = await deployWalletContract();

    const amount = parseEther('2');
    await walletsContract.credit({ value: amount });

    const balanceAfterCreditingWallet = await ethers.provider.getBalance(
      creator
    );

    await walletsContract.withdrawAll();

    const balanceAfterWithdrawal = await ethers.provider.getBalance(creator);

    expect(balanceAfterWithdrawal).to.be.greaterThan(
      balanceAfterCreditingWallet
    );
  });

  it('reverts if balance is zero', async () => {
    const { walletsContract } = await deployWalletContract();

    await expect(walletsContract.withdrawAll()).to.be.revertedWithCustomError(
      walletsContract,
      'InsufficientFunds'
    );
  });
});

export async function deployWalletContract() {
  const [deployer, ...otherOwners] = await ethers.getSigners();

  const walletsContract = await ethers.deployContract('Wallets', deployer);

  return {
    creator: deployer,
    otherOwners,
    walletsContract,
  };
}
