// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.23;

import {Coin} from './Coin.sol';

library Game {
    enum Status {
        AwaitingPlayers,
        Expired,
        AwaitingChancesUpload,
        Concluded
    }
}
