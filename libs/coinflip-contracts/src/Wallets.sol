// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.18;

import {UsingReentrancyGuard} from './Wallet/ReentrancyGuard.sol';

contract Wallets is UsingReentrancyGuard {
  mapping(address owner => uint balance) wallet;

  function creditWallet(address owner, uint amount) public {
    wallet[owner] += amount;
  }

  function withdrawAll() public nonReentrant {
    uint balance = wallet[msg.sender];
    require(balance > 0);

    pay(payable(msg.sender), balance);

    wallet[msg.sender] = 0;
  }

  function getWalletBalance(address owner) public view returns (uint) {
    return wallet[owner];
  }

  function getTotalBalance() public view returns (uint) {
    return address(this).balance;
  }

  function pay(address payable to, uint256 amount) private {
    (bool sent, ) = to.call{value: amount}('');
    require(sent, 'Failed to send payment');
  }
}
