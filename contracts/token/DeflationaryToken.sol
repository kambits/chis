//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import '../libraries/SafeMath.sol';

/**
 * @title DeflationaryToken
 * @dev n% Deflation
 * Note
 */
contract DeflationaryToken is ERC20, Ownable {
    address private constant BLACK_HOLE = address(0x0000000000000000000000000000000000dead);

    using SafeMath for uint256;
    uint256 public finalSupply = 0;
    uint256 public burnRate = 500;
    address[] public swapAddressList;
    mapping(address => uint256) public swapAddressMap;

    constructor(
        string memory name_,
        string memory symbol_,
        uint256 initialSupply_,
        uint256 finalSupply_,
        uint256 burnRate_
    ) ERC20(name_, symbol_) {
        _mint(msg.sender, initialSupply_);
        finalSupply = finalSupply_;
        burnRate = burnRate_;
    }

    function addSwapAddress(address _address) public onlyOwner {
        require(_address != address(0), 'ERC20: addSwapAddress from the zero address');
        require(swapAddressMap[_address] == 0, 'ERC20: addSwapAddress address exists');

        swapAddressMap[_address] = swapAddressList.length;
        swapAddressList.push(_address);
    }

    function removeSwapAddress(address _address) public onlyOwner {
        require(_address != address(0), 'ERC20: removeSwapAddress from the zero address');
        require(swapAddressMap[_address] != 0, 'ERC20: addSwapAddress address does not exist');
        swapAddressMap[_address] = 0;
    }

    function isSwapAddress(address _address) public view returns (bool) {
        return swapAddressMap[_address] != 0;
    }

    function _transfer(
        address sender,
        address recipient,
        uint256 amount
    ) internal override {
        if (isSwapAddress(sender) && totalSupply() > balanceOf(BLACK_HOLE).add(finalSupply)) {
            uint256 burnAmount = amount.mul(burnRate) / 10000;
            ERC20._transfer(sender, recipient, amount.sub(burnAmount));
            ERC20._transfer(sender, BLACK_HOLE, burnAmount);
        } else {
            ERC20._transfer(sender, recipient, amount);
        }

        _afterTokenTransfer(sender, recipient, amount);
    }
}
