
//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import '../token/DeflationaryToken.sol';
/**
 * @title ExampleDeflationaryToken
 * @dev n% Deflation
 * Note
 */
contract ExampleDeflationaryToken is DeflationaryToken {
    uint256 private constant INITIAL_SUPPLY = 10**8 * (10**18);
    uint256 private constant FINAL_SUPPLY = 8888 * (10**18);

    constructor() DeflationaryToken('Deflationary Token', 'DEFT', INITIAL_SUPPLY, FINAL_SUPPLY, 500) {
    }
}