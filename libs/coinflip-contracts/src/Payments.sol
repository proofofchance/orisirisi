// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.18;

library Payments {
    function pay(address to, uint256 amount) internal {
        (bool sent, ) = to.call{value: amount}('');
        require(sent);
    }
}
