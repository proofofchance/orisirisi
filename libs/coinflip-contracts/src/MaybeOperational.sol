// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity 0.8.25;

import {Ownable} from './Ownable.sol';

contract MaybeOperational is Ownable {
    bool private isOperational = true;

    error InOperational();

    /**
     * @dev Modifier that requires the "operational" boolean variable to be "true"
     *      This is used on all state changing functions to pause the contract in
     *      the event there is an issue that needs to be fixed
     */
    modifier mustBeOperational() {
        if (!isOperational) {
            revert InOperational();
        }
        _;
    }

    /**
     * @dev Sets contract operations on/off
     *
     * When isOperational is false, all affected write transactions except for this one will fail
     */
    function setIsOperational(bool isOperational_) external onlyOwner {
        isOperational = isOperational_;
    }
}
