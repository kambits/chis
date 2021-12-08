pragma solidity ^0.8.0;
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "hardhat/console.sol";

contract TestBreedAdmin {
    function breedByAdmin(
        address _userAddres,
        bytes32 _msghash,
        bytes memory _signature
    ) external returns (uint256) {
        /*,
        uint8 v ,
        bytes32 r,
        bytes32 s */
        console.log("_msghash: %s", string(abi.encodePacked(_msghash)));
        console.log("_signature: %s", string(abi.encodePacked(_signature)));
        
        console.log("rec: %s", ECDSA.recover(_msghash, _signature));
        console.log("sign successfully");
        return (1);
    }
}