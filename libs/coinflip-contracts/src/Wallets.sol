// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.23;

import {Ownable} from './Ownable.sol';
import {UsingReentrancyGuard} from './Wallets/ReentrancyGuard.sol';
import {Payments} from './Payments.sol';

/// ProofOfChance wallets that supports only coinflip at the time of deployment
/// It acts as a regular wallet that can be 'Credited' and 'Debited'
/// More importantly, it allows ProofOfChance apps to 'CreditFromGame` or `DebitForGame` in
/// the context of a given game
/// TODO: Consider renaming to GameWallets
contract Wallets is UsingReentrancyGuard, Ownable {
    mapping(address => bool) apps;
    mapping(address app => mapping(uint gameID => uint balance)) gameBalances;
    mapping(address owner => uint amount) nonGameBalances;

    event Credit(address owner, uint amount);
    event Debit(address owner, uint amount);
    event CreditFromGame(address app, uint gameID, address owner, uint amount);
    event DebitForGame(address app, uint gameID, address owner, uint amount);

    error InsufficientFunds();
    error UnAuthorizedApp();

    receive() external payable {
        nonGameBalances[msg.sender] += msg.value;
    }

    function addApp(address app) external onlyOwner {
        apps[app] = true;
    }

    function removeApp(address app) external onlyOwner {
        apps[app] = false;
    }

    modifier onlyApp() {
        if (!apps[msg.sender]) {
            revert UnAuthorizedApp();
        }
        _;
    }

    function transferToGameWallet(
        uint gameID,
        address player,
        uint amount
    ) external nonReentrant onlyApp {
        if (nonGameBalances[player] < amount) {
            revert InsufficientFunds();
        }
        nonGameBalances[player] -= amount;
        address app = msg.sender;
        gameBalances[app][gameID] += amount;

        emit DebitForGame(app, gameID, player, amount);
    }

    /* 
        Credits player as though player manually credits themselves. A convenient function
        for cases where players send their ether to one of ProofOfChances' apps instead of the
        wallet. Those apps, will act as a proxy to then manually top up the player's wallet balance
    */
    function creditPlayer(
        address player,
        uint amount
    ) external nonReentrant onlyApp {
        nonGameBalances[player] += amount;
        emit Credit(player, amount);
    }

    function credit() external payable nonReentrant {
        address player = msg.sender;
        uint amount = msg.value;
        nonGameBalances[player] += amount;
        emit Credit(player, amount);
    }

    // Do we need Re-entrant guard?
    function creditPlayersAndCreditAppTheRest(
        uint gameID,
        address[] memory players,
        uint amount
    ) external onlyApp {
        address app = msg.sender;
        require(gameBalances[app][gameID] > players.length * amount);
        creditPlayers(app, gameID, players, amount);
        creditAppTheRest(app, gameID);
    }

    function creditPlayers(
        address app,
        uint gameID,
        address[] memory players,
        uint amount
    ) private {
        for (uint i = 0; i < players.length; i++) {
            address player = players[i];
            gameBalances[app][gameID] -= amount;
            nonGameBalances[player] += amount;

            emit CreditFromGame(app, gameID, player, amount);
        }
    }

    function creditAppTheRest(address app, uint gameID) private {
        gameBalances[app][gameID] = 0;
        uint restAmount = gameBalances[app][gameID];
        address appOwner = owner();
        nonGameBalances[appOwner] = restAmount;
        emit CreditFromGame(app, gameID, appOwner, restAmount);
    }

    function withdrawAll() external nonReentrant {
        address owner = msg.sender;
        uint balance = nonGameBalances[owner];
        if (balance == 0) {
            revert InsufficientFunds();
        }
        nonGameBalances[msg.sender] = 0;
        Payments.pay(payable(msg.sender), balance);
        emit Debit(owner, balance);
    }

    function getGameBalance(
        address app,
        uint gameID
    ) external view returns (uint) {
        return gameBalances[app][gameID];
    }

    function getBalance(address owner) external view returns (uint) {
        return nonGameBalances[owner];
    }

    function getTotalBalance() external view returns (uint) {
        return address(this).balance;
    }
}
