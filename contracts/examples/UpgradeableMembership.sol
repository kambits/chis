//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import '@openzeppelin/contracts/access/Ownable.sol';
import '../libraries/Initializable.sol';
import '../libraries/SafeMath.sol';
import './Membership.sol';

contract UpgradeableMembership{}
// contract UpgradeableMembership is Membership, Initializable {
//     function initialize(
//         address _owner,
//         uint256 _referralRate,
//         uint256 _discount,
//         uint256 _totalMember
//     ) external payable onlyOwner {
//         transferOwnership(_owner);
//         referralRate = _referralRate;
//         discount = _discount;
//         totalMember = _totalMember;
//     }
// }
