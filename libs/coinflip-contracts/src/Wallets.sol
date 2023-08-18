// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.18;

import {UsingReentrancyGuard} from './Wallet/ReentrancyGuard.sol';

interface AfterCreditWalletCallback {
  function afterCreditWallet(uint8 functionID, bytes32 callBackID) external;
}

contract CanPayWallet {
  function payWallet(address payable to, uint256 amount) public {
    (bool sent, ) = to.call{value: amount}('');
    require(sent, 'Failed to send payment');
  }
}

contract UsingCanPayWallet is CanPayWallet {}

contract Wallets is UsingReentrancyGuard, UsingCanPayWallet {
  mapping(address owner => uint balance) wallets;

  receive() external payable {
    creditWallet(msg.sender, msg.value);
  }

  function creditWallet(address owner, uint amount) public nonReentrant {
    wallets[owner] += amount;
  }

  function creditWallet(
    address owner,
    uint amount,
    uint8 functionID,
    bytes32 callbackID,
    AfterCreditWalletCallback callback
  ) public nonReentrant {
    wallets[owner] += amount;

    callback.afterCreditWallet(functionID, callbackID);
  }

  function debitWallet(address owner, uint amount) public nonReentrant {
    require(getWalletBalance(owner) >= amount, 'Insufficient funds');

    wallets[owner] -= amount;
  }

  function withdrawAll() public nonReentrant {
    uint balance = wallets[msg.sender];

    require(balance > 0);

    wallets[msg.sender] = 0;

    payWallet(payable(msg.sender), balance);
  }

  function getWalletBalance(address owner) public view returns (uint) {
    return wallets[owner];
  }

  function getTotalBalance() public view returns (uint) {
    return address(this).balance;
  }
}
