// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import './ManagerInterface.sol';

contract GameERC20 is Ownable, ERC20 {
    uint256 public amountPlayToEarn = 280 * 10**6 * 1 ether;
    uint256 internal amountFarm = 150 * 10**6 * 1 ether;
    uint256 public tokenForBosses = 2 * 10**6 * 1 ether;
    uint256 public playToEarnReward;
    uint256 private farmReward;
    address public addressForBosses;
    uint256 public sellFeeRate = 5;
    uint256 public buyFeeRate = 2;

    ManagerInterface public manager;

    constructor(string memory name, string memory symbol) ERC20(name, symbol) {
        addressForBosses = _msgSender();
    }

    modifier onlyFarmOwners() {
        require(manager.farmOwners(_msgSender()), 'caller is not the farmer');
        _;
    }

    modifier onlyEvolver() {
        require(manager.evolvers(_msgSender()), 'caller is not the evolver');
        _;
    }

    function setManager(address _manager) public onlyOwner {
        manager = ManagerInterface(_manager);
    }

    function setTransferFeeRate(uint256 _sellFeeRate, uint256 _buyFeeRate) public onlyOwner {
        sellFeeRate = _sellFeeRate;
        buyFeeRate = _buyFeeRate;
    }

    function setMinTokensBeforeSwap(uint256 _tokenForBosses) public onlyOwner {
        require(_tokenForBosses < 20 * 10**6 * 10**18, 'low token balance for bosses');
        tokenForBosses = _tokenForBosses;
    }

    function farm(address recipient, uint256 amount) external onlyFarmOwners {
        require(amountFarm != farmReward, 'Over cap farm');
        require(recipient != address(0), '0x is not accepted here');
        require(amount > 0, 'not accept 0 value');

        farmReward += amount;
        if (farmReward <= amountFarm) {
            _mint(recipient, amount);
        } else {
            uint256 availableReward = farmReward - amountFarm;
            _mint(recipient, availableReward);
            farmReward = amountFarm;
        }
    }

    function win(address winner, uint256 reward) external onlyEvolver {
        require(playToEarnReward != amountPlayToEarn, 'Over cap farm');
        require(winner != address(0), '0x is not accepted here');
        require(reward > 0, 'not accept 0 value');

        playToEarnReward += reward;
        if (playToEarnReward <= amountPlayToEarn) {
            _mint(winner, reward);
        } else {
            uint256 availableReward = playToEarnReward - amountPlayToEarn;
            _mint(winner, availableReward);
            playToEarnReward = amountPlayToEarn;
        }
    }
}
