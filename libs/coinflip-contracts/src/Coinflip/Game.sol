// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.23;

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

    function getEntropy(
        string memory proofOfChance
    ) internal pure returns (uint16) {
        uint16 sum = 0;
        bytes memory proofOfChanceBytes = bytes(proofOfChance);

        for (uint8 i = 0; i < proofOfChanceBytes.length; i++) {
            sum += uint8(proofOfChanceBytes[i]);
        }

        return sum;
    }
}
