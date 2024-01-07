// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.23;

import {Coin} from './Coin.sol';

library Game {
    enum Status {
        Ongoing,
        Expired,
        AwaitingChancesUpload,
        Concluded
    }

    function getEntropy(string memory chance) internal pure returns (uint16) {
        uint16 sum = 0;
        bytes memory chanceInBytes = bytes(chance);

        for (uint8 i = 0; i < chanceInBytes.length; i++) {
            sum += uint8(chanceInBytes[i]);
        }

        return sum;
    }
}
