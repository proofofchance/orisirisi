// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.18;

import {Ownable} from './Ownable.sol';
import {UsingReentrancyGuard} from './Wallets/ReentrancyGuard.sol';

contract CanPayWallet {
    function payWallet(address to, uint256 amount) public payable {
        (bool sent, ) = to.call{value: amount}('');
        require(sent);
    }
}

contract UsingCanPayWallet is CanPayWallet {}

contract Wallets is UsingReentrancyGuard, UsingCanPayWallet, Ownable {
    mapping(address owner => uint balance) wallets;

    error InsufficientFunds();

    receive() external payable {
        _creditWallet(msg.sender, msg.value);
    }

    function transfer(
        address to,
        uint amount
    ) external nonReentrant onlyOwner returns (bool) {
        if (to == address(0)) {
            revert InvalidAddress();
        }

        if (getWalletBalance(msg.sender) > amount) {
            revert InsufficientFunds();
        }

        _debitWallet(msg.sender, amount);
        _creditWallet(to, amount);

        return true;
    }

    function debitWallet(
        address owner,
        uint amount
    ) external nonReentrant onlyOwner returns (bool) {
        if (owner == address(0)) {
            revert InvalidAddress();
        }

        if (getWalletBalance(owner) > amount) {
            revert InsufficientFunds();
        }

        _debitWallet(owner, amount);

        return true;
    }

    function withdrawAll() external nonReentrant {
        uint balance = wallets[msg.sender];

        if (balance == 0) {
            revert InsufficientFunds();
        }

        wallets[msg.sender] = 0;

        payWallet(payable(msg.sender), balance);
    }

    function getWalletBalance(address owner) public view returns (uint) {
        return wallets[owner];
    }

    function getTotalBalance() external view returns (uint) {
        return address(this).balance;
    }

    function _creditWallet(address owner, uint amount) private {
        wallets[owner] += amount;
    }

    function _debitWallet(address owner, uint amount) private {
        wallets[owner] -= amount;
    }
}
