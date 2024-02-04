// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.20;

import {Coin} from './Coin.sol';

library Game {
    enum Status {
        AwaitingPlayers,
        Expired,
        AwaitingChancesUpload,
        /// Concluded games are Completed/Expired games have been paid_out/refunded
        Concluded
    }
}
