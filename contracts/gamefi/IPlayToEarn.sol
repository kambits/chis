// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IPlayToEarn {
    function setAddressForBosses(address _addressForBosses) external;
    
    function sweepTokenForBosses() external;

    function setMinTokensBeforeSwap(uint256 _tokenForBosses) external;
}