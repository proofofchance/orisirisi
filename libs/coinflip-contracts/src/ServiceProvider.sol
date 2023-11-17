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

    // TODO: Use Openzeppelin
    // Solidity rounds towards zero. So implicit 'floor' happens here
    function getAmountForEachAndServiceCharge(
        uint amount,
        uint places
    ) external view returns (uint amountForEach, uint serviceChargeAmount) {
        uint _serviceChargeAmountSoFar = (amount * serviceChargePercent) / 100;

        uint amountAfterDeductingServiceCharge = amount -
            _serviceChargeAmountSoFar;

        uint _amountForEach = amountAfterDeductingServiceCharge / places;

        uint maybeLeftOverAmount = amountAfterDeductingServiceCharge -
            (amountForEach * places);

        uint _serviceChargeAmount = _serviceChargeAmountSoFar +
            maybeLeftOverAmount;

        return (_amountForEach, _serviceChargeAmount);
    }
}
