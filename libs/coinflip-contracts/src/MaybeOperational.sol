// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.23;

import './Ownable.sol';

contract MaybeOperational is Ownable {
    bool private operational = true;

    error InOperative();

    /**
     * @dev Modifier that requires the "operational" boolean variable to be "true"
     *      This is used on all state changing functions to pause the contract in
     *      the event there is an issue that needs to be fixed
     */
    modifier mustBeOperational() {
        if (!operational) {
            revert InOperative();
        }
        _; // All modifiers require an "_" which indicates where the function body will be added
    }

    /**
     * @dev Sets contract operations on/off
     *
     * When operational mode is disabled, all write transactions except for this one will fail
     */
    function setOperatingStatus(bool mode) external onlyOwner {
        operational = mode;
    }
}
