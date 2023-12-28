// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.23;

import {Ownable} from './Ownable.sol';
import {UsingReentrancyGuard} from './Wallets/ReentrancyGuard.sol';
import {Payments} from './Payments.sol';

// TODO: Consider renaming to GameWallets
contract Wallets is UsingReentrancyGuard, Ownable {
    mapping(address => bool) apps;
    mapping(address app => mapping(uint gameID => uint balance)) gameBalances;
    mapping(address owner => uint amount) nonGameBalances;

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
    }

    function creditPlayer(address player, uint amount) external nonReentrant {
        nonGameBalances[player] += amount;
    }

    function credit() external payable nonReentrant {
        nonGameBalances[msg.sender] += msg.value;
    }

    function creditPlayersAndCreditAppTheRest(
        uint gameID,
        address[] memory players,
        uint amount
    ) external onlyApp {
        address app = msg.sender;
        require(gameBalances[app][gameID] > players.length * amount);
        creditPlayers(gameID, app, players, amount);
        creditAppTheRest(gameID, app);
    }

    function creditPlayers(
        uint gameID,
        address app,
        address[] memory players,
        uint amount
    ) private {
        for (uint i = 0; i < players.length; i++) {
            address player = players[i];
            gameBalances[app][gameID] -= amount;
            nonGameBalances[player] += amount;
        }
    }

    function creditAppTheRest(uint gameID, address app) private {
        uint rest = gameBalances[app][gameID];
        nonGameBalances[app] = rest;
        gameBalances[app][gameID] = 0;
    }

    function debit(address owner, uint amount) external nonReentrant onlyApp {
        if (nonGameBalances[owner] < amount) {
            revert InsufficientFunds();
        }
        nonGameBalances[owner] -= amount;
    }

    function withdrawAll() external nonReentrant {
        address owner = msg.sender;
        uint balance = nonGameBalances[owner];
        if (balance == 0) {
            revert InsufficientFunds();
        }
        nonGameBalances[msg.sender] = 0;
        Payments.pay(payable(msg.sender), balance);
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
