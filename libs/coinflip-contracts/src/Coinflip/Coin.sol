// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.18;

library Coin {
  enum Side {
    Head,
    Tail
  }

  uint8 public constant TOTAL_SIDES_COUNT = 2;

  function flip(uint16 entropy) internal pure returns (Side) {
    return Side(entropy % (TOTAL_SIDES_COUNT - 1));
  }
}
