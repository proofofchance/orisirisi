// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.18;

import {Coin} from './Coin.sol';

library Game {
    type ID is uint;

    type PlayID is uint16;
    type Player is address;

    struct Play {
        Player player;
        Coin.Side coinSide;
        bytes32 proof;
        bytes32 playHash;
    }

    enum Status {
        Ongoing,
        Expired,
        WinnersUnresolved,
        Concluded
    }

    function getEntropy(bytes32 proofOfChance) internal pure returns (uint16) {
        uint16 sum = 0;

        for (uint8 i = 0; i < 32; i++) {
            sum += uint8(proofOfChance[i]);
        }

        return sum;
    }
}
