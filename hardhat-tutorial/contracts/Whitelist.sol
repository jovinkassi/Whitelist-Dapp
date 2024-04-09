//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

contract Whitelist{


    //Max addresses which can be whitelisted
    uint8 public maxWhitelistedAddresses;

    uint8 public numAddressesWhitelisted;

    mapping(address=>bool) public whitelistedAddresses;

    constructor(uint8 _maxWhitelistedAddresses){
           
           maxWhitelistedAddresses= _maxWhitelistedAddresses;

    }

   function addAddressToWhitelist() public {

      //msg.sender is the address of the person who called this function
      require(!whitelistedAddresses[msg.sender],"Sender already in the whitelist");

      require(numAddressesWhitelisted < maxWhitelistedAddresses,"Max Limit reached");

      whitelistedAddresses[msg.sender] = true;
      numAddressesWhitelisted += 1;


   }



}