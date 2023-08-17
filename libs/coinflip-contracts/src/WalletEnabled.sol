// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.18;

contract WalletEnabled {
  mapping(address owner => uint balance) balances;

  function creditWallet(address owner, uint amount) public {
    balances[owner] += amount;
  }

  function debitWallet(address owner, uint amount) public {
    require(balances[owner] < amount, 'Insufficient funds');

    balances[owner] -= amount;
  }

  function withdrawAll() public {
    uint balance = balances[msg.sender];
    require(balance > 0);

    pay(payable(msg.sender), balance);

    balances[msg.sender] = 0;
  }

  function getWalletBalance(address owner) public view returns (uint) {
    return balances[owner];
  }

  function getTotalBalance() public view returns (uint) {
    return address(this).balance;
  }

  function pay(address payable to, uint256 amount) private {
    (bool sent, ) = to.call{value: amount}('');
    require(sent, 'Failed to send payment');
  }
}
