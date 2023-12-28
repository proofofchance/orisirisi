// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.23;

import {Coin} from './Coin.sol';

library Game {
    enum Status {
        Ongoing,
        Expired,
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
