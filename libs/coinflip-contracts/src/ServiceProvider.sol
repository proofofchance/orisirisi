// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity 0.8.25;

import {Ownable} from './Ownable.sol';

contract UsingServiceProvider is Ownable {
    /// @dev Factor-in gas prices, min-wager & operations cost
    uint8 public serviceChargePercent = 8;

    error InvalidServiceChargePercent();

    /// @dev Allows owner update service charge percent
    function updateServiceChargePercent(
        uint8 serviceChargePercent_
    ) external onlyOwner {
        if (serviceChargePercent_ >= 100) {
            revert InvalidServiceChargePercent();
        }

        serviceChargePercent = serviceChargePercent_;
    }

    /// @dev Returns the service provider wallet address
    function getServiceProviderWallet() external view returns (address) {
        return owner();
    }

    function getServiceCharge(uint amount) external view returns (uint) {
        return (amount * serviceChargePercent) / 100;
    }

    /// @notice Made public to allow auditing games transparently
    /// @dev Returns the `splitAmount` for each `place` and the `serviceChargeAmount`
    function getSplitAndServiceChargeAmounts(
        uint totalAmount,
        uint places
    ) public view returns (uint, uint) {
        uint splitAmount = totalAmount / places;
        splitAmount =
            splitAmount -
            ((splitAmount * serviceChargePercent) / 100);

        uint serviceChargeAmount = totalAmount - (splitAmount * places);

        return (splitAmount, serviceChargeAmount);
    }
}
