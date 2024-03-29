// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity 0.8.25;

import {Coin} from './Coin.sol';

library Game {
    enum Status {
        AwaitingPlayers,
        AwaitingChancesReveal,
        Expired,
        /// Concluded games are Completed/Expired games have been paid_out/refunded
        Concluded
    }
}
