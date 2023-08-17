// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.18;

import './Ownable.sol';

contract ServiceCharged is Ownable {
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
  function serviceProvider() public view returns (address) {
    return owner();
  }
}
