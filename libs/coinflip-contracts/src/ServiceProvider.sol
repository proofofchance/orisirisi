// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.23;

import './Ownable.sol';

contract ServiceProvider is Ownable {
    uint8 private serviceChargePercent = 2; // in percentage

    error InvalidServiceChargePercent();

    function setServiceChargePercent(
        uint8 _serviceChargePercent
    ) external onlyOwner {
        if (_serviceChargePercent >= 100) {
            revert InvalidServiceChargePercent();
        }

        serviceChargePercent = _serviceChargePercent;
    }

    /**
     * @dev Returns the service charge in percentage
     */
    function getServiceChargePercent() external view returns (uint8) {
        return serviceChargePercent;
    }

    /**
     * @dev Returns the service provider wallet owner
     */
    function getServiceProviderWallet() public view returns (address) {
        return owner();
    }

    function getServiceCharge(uint amount) external view returns (uint) {
        return (amount * serviceChargePercent) / 100;
    }

    function getSplitAmountAfterServiceChargeDeduction(
        uint amount,
        uint places
    ) external view returns (uint) {
        uint splitAmount = amount / places;
        splitAmount =
            splitAmount -
            ((splitAmount * serviceChargePercent) / 100);

        return splitAmount;
    }
}
