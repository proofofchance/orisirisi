// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.20;

import {Ownable} from './Ownable.sol';
import {UsingReentrancyGuard} from './Wallets/ReentrancyGuard.sol';

/// TODO: Move to orisirisi-contracts when more games are introduced
/// TODO: Consider renaming to GameWallets

/// @dev ProofOfChance Wallets supports only coinflip at the time of deployment
/// It acts as a regular wallet that can be 'Credited' and 'Debited'
/// More importantly, it allows ProofOfChance apps to 'CreditFromGame` or `DebitForGame` in
/// the context of a given game
contract Wallets is UsingReentrancyGuard, Ownable {
    mapping(address => bool) apps;
    mapping(address app => mapping(uint gameID => uint balance)) gameBalances;
    mapping(address owner => uint amount) balances;

    event Credit(address indexed owner, uint amount);
    event Debit(address indexed owner, uint amount);
    event CreditFromGame(
        address indexed app,
        uint indexed gameID,
        address indexed owner,
        uint amount
    );
    event DebitForGame(
        address indexed app,
        uint indexed gameID,
        address indexed owner,
        uint amount
    );

    error InsufficientFunds();
    error UnAuthorizedApp();

    receive() external payable {
        _credit();
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

    function debitForGame(
        uint gameID,
        address player,
        uint amount
    ) external onlyApp {
        if (balances[player] < amount) {
            revert InsufficientFunds();
        }
        balances[player] -= amount;
        address app = msg.sender;
        gameBalances[app][gameID] += amount;

        emit DebitForGame(app, gameID, player, amount);
    }

    /// @dev Credits player as though player manually credits themselves.
    function creditPlayer(address player) external payable {
        uint amount = msg.value;
        balances[player] += amount;
        emit Credit(player, amount);
    }

    function credit() external payable {
        _credit();
    }

    /// @dev Credits player as though player manually credits themselves.
    function creditPlayers(address[] memory players) external payable {
        uint amount = msg.value;
        uint playersSize = players.length;
        require(amount % playersSize == 0);
        uint amountForEachPlayer = amount / playersSize;
        for (uint i = 0; i < playersSize; i++) {
            balances[players[i]] += amountForEachPlayer;
        }
    }

    function creditPlayersAndCreditAppOwnerTheRest(
        uint gameID,
        address[] memory players,
        uint amount
    ) external onlyApp {
        address app = msg.sender;
        require(gameBalances[app][gameID] > players.length * amount);
        creditPlayers(app, gameID, players, amount);
        creditAppOwnerTheRest(app, gameID);
    }

    /// @notice Allows you to withdraw a specified amount of your wallet balance
    function withdraw(uint amount) external nonReentrant {
        address owner = msg.sender;
        uint balance = balances[owner];
        if (balance < amount) {
            revert InsufficientFunds();
        }
        balances[owner] -= amount;

        pay(owner, amount);

        emit Debit(owner, amount);
    }

    /// @notice Allows you to withdraw all your wallet balance
    function withdrawAll() external nonReentrant {
        address owner = msg.sender;
        uint balance = balances[owner];
        if (balance == 0) {
            revert InsufficientFunds();
        }
        balances[owner] = 0;

        pay(owner, balance);

        emit Debit(owner, balance);
    }

    /// @notice Returns the wallet balance of an app's game
    function getGameBalance(
        address app,
        uint gameID
    ) external view returns (uint) {
        return gameBalances[app][gameID];
    }

    function _credit() private {
        address player = msg.sender;
        uint amount = msg.value;
        balances[player] += amount;
        emit Credit(player, amount);
    }

    /// @notice returns the balance of a wallet owner
    /// it does not include the balances deposited in games
    function getBalance(address owner) external view returns (uint) {
        return balances[owner];
    }

    /// @notice returns the ether balance of this wallet contract
    function getTotalBalance() external view returns (uint) {
        return address(this).balance;
    }

    function pay(address to, uint256 amount) private {
        (bool sent, ) = to.call{value: amount}('');
        require(sent);
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
            balances[player] += amount;
            emit CreditFromGame(app, gameID, player, amount);
        }
    }

    function creditAppOwnerTheRest(address app, uint gameID) private {
        uint restAmount = gameBalances[app][gameID];
        // Currently, all apps have one owner, who happens to own this wallet contract too
        address appOwner = owner();
        balances[appOwner] = restAmount;
        gameBalances[app][gameID] = 0;
        emit CreditFromGame(app, gameID, appOwner, restAmount);
    }
}
