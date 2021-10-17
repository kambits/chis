// SPDX-License-Identifier: MIT
pragma solidity >=0.4.16 <0.9.0;
import "../libraries/VectorSum.sol";

contract ExampleVectorSum {
    uint256 public sumValue;

    function sumSolidity(uint256[] memory _data) external {
        sumValue = VectorSum.sumSolidity(_data);
    }

    function sumAsm(uint256[] memory _data) external {
        sumValue = VectorSum.sumAsm(_data);
    }

    function sumPureAsm(uint256[] memory _data) external {
        sumValue = VectorSum.sumPureAsm(_data);
    }
}
