// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.18;

import './Ownable.sol';

contract ServiceProvider is Ownable {
  uint8 private serviceChargePercent = 2; // in percentage

  function setServiceChargePercent(
    uint8 _serviceChargePercent
  ) external onlyOwner {
    require(
      _serviceChargePercent < 100,
      'Service charge must be less than 100%'
    );

    serviceChargePercent = _serviceChargePercent;
  }

  /**
   * @dev Returns the service charge in percentage
   */
  function getServiceChargePercent() public view returns (uint8) {
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
  ) public view returns (uint amountForEach, uint serviceChargeAmount) {
    uint _serviceChargeAmountSoFar = (amount * getServiceChargePercent()) / 100;

    uint amountAfterDeductingServiceCharge = amount - serviceChargeAmount;

    uint _amountForEach = amountAfterDeductingServiceCharge / places;

    uint maybeLeftOverAmount = amountAfterDeductingServiceCharge -
      (amountForEach * places);

    uint _serviceChargeAmount = _serviceChargeAmountSoFar + maybeLeftOverAmount;

    return (_amountForEach, _serviceChargeAmount);
  }
}

contract UsingServiceProvider is ServiceProvider {}
