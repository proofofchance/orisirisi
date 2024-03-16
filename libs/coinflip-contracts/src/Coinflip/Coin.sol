// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity 0.8.25;

library Coin {
    enum Side {
        Head,
        Tail
    }

    uint8 public constant TOTAL_SIDES_COUNT = 2;
}
