// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.23;

import {Ownable} from './Ownable.sol';
import {UsingReentrancyGuard} from './Wallets/ReentrancyGuard.sol';
import {Payments} from './Payments.sol';

contract Wallets is UsingReentrancyGuard, Ownable {
    mapping(address => bool) apps;
    mapping(address owner => uint balance) wallets;

    error InsufficientFunds();
    error UnAuthorizedApp();

    receive() external payable {
        _credit(msg.sender, msg.value);
    }

    function addApp(address app) external onlyOwner {
        if (app == address(0)) {
            revert InvalidAddress();
        }
        apps[app] = true;
    }

    function removeApp(address app) external onlyOwner {
        if (app == address(0)) {
            revert InvalidAddress();
        }
        apps[app] = false;
    }

    modifier onlyApp() {
        if (!apps[msg.sender]) {
            revert UnAuthorizedApp();
        }
        _;
    }

    function transfer(
        address to,
        uint amount
    ) external nonReentrant onlyApp returns (bool) {
        if (to == address(0)) {
            revert InvalidAddress();
        }

        if (getBalance(msg.sender) < amount) {
            revert InsufficientFunds();
        }

        _debit(msg.sender, amount);
        _credit(to, amount);

        return true;
    }

    function debit(
        address owner,
        uint amount
    ) external nonReentrant onlyApp returns (bool) {
        if (owner == address(0)) {
            revert InvalidAddress();
        }

        if (getBalance(owner) < amount) {
            revert InsufficientFunds();
        }

        _debit(owner, amount);

        return true;
    }

    function withdrawAll() external nonReentrant {
        uint balance = wallets[msg.sender];

        if (balance == 0) {
            revert InsufficientFunds();
        }

        wallets[msg.sender] = 0;

        Payments.pay(payable(msg.sender), balance);
    }

    function getBalance(address owner) public view returns (uint) {
        return wallets[owner];
    }

    function getTotalBalance() external view returns (uint) {
        return address(this).balance;
    }

    function _credit(address owner, uint amount) private {
        wallets[owner] += amount;
    }

    function _debit(address owner, uint amount) private {
        wallets[owner] -= amount;
    }
}
