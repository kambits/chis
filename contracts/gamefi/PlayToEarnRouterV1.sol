// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import '@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol';
import './IPlayToEarnRouter.sol';

contract PlayToEarnRouterV1 is IPlayToEarnRouter, AccessControlUpgradeable {
    bytes32 public constant CONFIG_ADMIN = keccak256('CONFIG_ADMIN');
    bytes32 public constant BATTLE_FIELD = keccak256('BATTLE_FIELD');
    bytes32 public constant EVOLVER = keccak256('EVOLVER');
    bytes32 public constant MARKET = keccak256('MARKET');

    function initialize() public initializer {
        __AccessControl_init();

        _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
        _setupRole(CONFIG_ADMIN, _msgSender());
        _setupRole(BATTLE_FIELD, _msgSender());
        _setupRole(EVOLVER, _msgSender());
        _setupRole(MARKET, _msgSender());
    }

    modifier onlyConfigAdmin() {
        require(hasRole(CONFIG_ADMIN, _msgSender()), 'only config admin');
        _;
    }

    mapping(address => bool) public userLocker;
    mapping(uint256 => bool) public tokenLocker;
    uint256 private _priceEgg;
    uint256 private _feeEvolve;

    function battlefields(address _address) external view override returns (bool) {
        return hasRole(BATTLE_FIELD, _address);
    }

    function evolvers(address _address) external view override returns (bool) {
        return hasRole(EVOLVER, _address);
    }

    function markets(address _address) external view override returns (bool) {
        return hasRole(MARKET, _address);
    }

    function usersLock(address _user) external view override returns (bool) {
        return userLocker[_user];
    }

    function tokensLock(uint256 _tokenId) external view override returns (bool) {
        return tokenLocker[_tokenId];
    }

    function generation() external view override returns (uint256) {
        return 1;
    }

    function priceEgg() external view override returns (uint256) {
        return _priceEgg;
    }

    function feeEvolve() external view override returns (uint256) {
        return _feeEvolve;
    }

    function setPriceEgg(uint256 fee) external onlyConfigAdmin {
        _priceEgg = fee;
    }

    function setFeeEvolve(uint256 fee) external onlyConfigAdmin {
        _feeEvolve = fee;
    }
}
