// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "hardhat/console.sol";



contract TestVerify {
    using ECDSA for bytes;
    using ECDSA for bytes32;

    function verify(bytes32 data, address account, bytes memory signature) public view returns (bool) {
        // console.log("_msghash: %d", keccak256(data));
        // return keccak256(data)
            // .toEthSignedMessageHash()
        return data.recover(signature) == account;
    }
}