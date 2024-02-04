// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.20;

import {Ownable} from './Ownable.sol';

contract UsingServiceProvider is Ownable {
    /// @dev due to charges for the minimum wager allowed
    /// expected to be high due to the gas fee for the minimum wager
    /// initialServiceCharges (at deployment):
    /// If transaction fee is $6
    uint8 public serviceChargePercent = 8;

    error InvalidServiceChargePercent();

    function updateServiceChargePercent(
        uint8 serviceChargePercent_
    ) external onlyOwner {
        if (serviceChargePercent_ >= 100) {
            revert InvalidServiceChargePercent();
        }

        serviceChargePercent = serviceChargePercent_;
    }

    /// @dev Returns the service provider wallet owner
    function getServiceProviderWallet() external view returns (address) {
        return owner();
    }

    function getServiceCharge(uint amount) external view returns (uint) {
        return (amount * serviceChargePercent) / 100;
    }

    function getSplitAmountAfterServiceChargeDeduction(
        uint amount,
        uint places
    ) internal view returns (uint) {
        uint splitAmount = amount / places;
        splitAmount =
            splitAmount -
            ((splitAmount * serviceChargePercent) / 100);

        return splitAmount;
    }
}
