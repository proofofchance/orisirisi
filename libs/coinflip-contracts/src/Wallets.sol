// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity 0.8.25;

import {Ownable} from './Ownable.sol';
import {UsingReentrancyGuard} from './Wallets/ReentrancyGuard.sol';

contract Wallets is UsingReentrancyGuard {
    mapping(address account => uint amount) balances;

    event Credit(address indexed account, uint amount);
    event Debit(address indexed account, uint amount);

    error InsufficientFunds();

    receive() external payable {
        _credit(msg.sender, msg.value);
    }

    /// @notice Credits account. You can credit someone using this.
    function creditAccount(address account) external payable {
        _credit(account, msg.value);
    }

    /// @notice Credits your account.
    function credit() external payable {
        _credit(msg.sender, msg.value);
    }

    /// @dev Credits accounts specified here
    function creditAccounts(address[] calldata accounts) external payable {
        uint amount = msg.value;
        uint accountsLength = accounts.length;
        require(amount % accountsLength == 0);
        uint amountForEachAccount = amount / accountsLength;
        for (uint i; i < accountsLength; ) {
            _credit(accounts[i], amountForEachAccount);
            unchecked {
                ++i;
            }
        }
    }

    /// @notice Same behavior as `creditAccounts` but credits
    /// `manyAccounts` using `amountForEachManyAccount` and
    /// `oneAccount` using `amountForOneAccount`
    function creditManyAndOne(
        address[] calldata manyAccounts,
        uint amountForEachManyAccount,
        address oneAccount,
        uint amountForOneAccount
    ) external payable {
        uint manyAccountsLength = manyAccounts.length;
        require(
            (amountForEachManyAccount * manyAccountsLength) +
                amountForOneAccount ==
                msg.value
        );

        for (uint i; i < manyAccountsLength; ) {
            _credit(manyAccounts[i], amountForEachManyAccount);
            unchecked {
                ++i;
            }
        }

        _credit(oneAccount, amountForOneAccount);
    }

    /// @notice Allows withdrawing a specified amount from your wallet balance
    function withdraw(uint amount) external nonReentrant {
        address account = msg.sender;
        uint balance = balances[account];
        if (balance < amount) {
            revert InsufficientFunds();
        }
        balances[account] -= amount;

        _pay(account, amount);

        emit Debit(account, amount);
    }

    /// @notice Allows withdrawing all amount from your wallet balance
    function withdrawAll() external nonReentrant {
        address account = msg.sender;
        uint balance = balances[account];
        if (balance == 0) {
            revert InsufficientFunds();
        }
        balances[account] = 0;

        _pay(account, balance);

        emit Debit(account, balance);
    }

    /// @notice returns the balance of a wallet account
    function getBalance(address account) external view returns (uint) {
        return balances[account];
    }

    /// @notice returns the balance of this wallet contract in wei
    function getTotalBalance() external view returns (uint) {
        return address(this).balance;
    }

    function _credit(address account, uint amount) private {
        balances[account] += amount;
        emit Credit(account, amount);
    }

    function _pay(address to, uint256 amount) private {
        (bool sent, ) = to.call{value: amount}('');
        require(sent);
    }
}
