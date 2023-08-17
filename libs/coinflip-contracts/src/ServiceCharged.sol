// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.18;

import './Ownable.sol';

contract ServiceCharged is Ownable {
  uint8 private service_charge_percent; // in percentage

  /**
   * @dev Returns the service charge in percentage
   */
  function get_service_charge_percent() public view returns (uint8) {
    return service_charge_percent;
  }
}
