// SPDX-License-Identifier: MIT
// https://bscscan.com/address/0x8bbe571b381ee58dd8f2335a8f0a5b42e83bdcfa#readProxyContract

pragma solidity ^0.8.0;
pragma abicoder v2;

import '@openzeppelin/contracts-upgradeable/utils/math/SafeMathUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol';
import '@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol';
import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import './IPlayToEarnRouter.sol';

contract PlayToEarnUpgradeable is Initializable, AccessControlUpgradeable, ERC721Upgradeable {
    using SafeMathUpgradeable for uint256;

    enum Tribe {
        SKYLER,
        HYDREIN,
        PLASMER,
        STONIC
    }

    event Migration(uint256 indexed tokenId, address user);
    event LayEgg(uint256 indexed tokenId, address buyer);
    event CreateCollections(uint256 indexed tokenId, address buyer, Tribe tribe, uint256 dna, uint256 collections);
    event Evolve(uint256 indexed tokenId, uint256 dna);
    event UpdateTribe(uint256 indexed tokenId, Tribe tribe);
    event UpgradeGeneration(uint256 indexed tokenId, uint256 newGeneration);
    event Exp(uint256 indexed tokenId, uint256 exp);
    event Working(uint256 indexed tokenId, uint256 time);

    struct Zoan {
        uint256 collections;
        uint256 generation;
        Tribe tribe;
        uint256 exp;
        uint256 dna;
        uint256 bornTime;
    }

    struct ItemSale {
        uint256 tokenId;
        address owner;
        uint256 price;
    }

    mapping(uint256 => uint256) public latestBlockTransfer;

    IPlayToEarnRouter public router;
    uint256 public latestTokenId;
    mapping(uint256 => bool) public isEvolved;

    mapping(uint256 => Zoan) internal zoans;

    IERC20 public zoonToken;
    address public dev;
    address public migration;

    bytes32 public constant ZOAN_ADMIN = keccak256('ZOAN_ADMIN');

    function initialize(
        string memory _name,
        string memory _symbol,
        address _router,
        address _erc20Token
    ) public initializer {
        __ERC721_init(_name, _symbol);
        __AccessControl_init_unchained();

        _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
        _setupRole(ZOAN_ADMIN, _msgSender());
        zoonToken = IERC20(_erc20Token);
        dev = _msgSender();

        router = IPlayToEarnRouter(_router);
    }

    modifier onlyEvolver() {
        require(router.evolvers(_msgSender()), 'require Evolver.');
        _;
    }

    modifier onlyMigration() {
        require(_msgSender() == migration, 'require Migration.');
        _;
    }

    modifier onlyBattlefield() {
        require(router.battlefields(_msgSender()), 'require Battlefield.');
        _;
    }

    modifier mustEvolved(uint256 _tokenId) {
        require(isEvolved[_tokenId], 'require Evolved.');
        _;
    }

    function priceEgg() public view returns (uint256) {
        return router.priceEgg();
    }

    function feeEvolve() public view returns (uint256) {
        return router.feeEvolve();
    }

    function _mint(address to, uint256 tokenId) internal override(ERC721Upgradeable) {
        super._mint(to, tokenId);

        _incrementTokenId();
    }

    function setMigration(address _migration) external {
        require(_msgSender() == dev);
        migration = _migration;
    }

    function migrate(
        address _receiver,
        Tribe _tribe,
        uint256 _dna,
        uint256 _exp
    ) public onlyMigration {
        uint256 nextTokenId = _getNextTokenId();
        _mint(_receiver, nextTokenId);

        zoans[nextTokenId] = Zoan({
            collections: 0,
            generation: router.generation(),
            tribe: _tribe,
            exp: _exp,
            dna: _dna,
            bornTime: block.timestamp
        });
        if (_dna > 0) {
            isEvolved[nextTokenId] = true;
        }

        emit Migration(nextTokenId, _receiver);
    }

    function exp(uint256 _tokenId, uint256 _exp) public onlyBattlefield {
        require(_exp > 0, 'no exp');

        Zoan storage zoan = zoans[_tokenId];
        zoan.exp = zoan.exp.add(_exp);
        emit Exp(_tokenId, _exp);
    }

    function evolve(
        uint256 _tokenId,
        uint256 _dna,
        uint256 _generation
    ) public onlyEvolver {
        require(latestBlockTransfer[_tokenId] < block.number, 'evolve after transfer');

        Zoan storage zoan = zoans[_tokenId];
        require(!isEvolved[_tokenId], 'require: not evolved');

        zoan.bornTime = block.timestamp;
        zoan.dna = _dna;
        zoan.generation = _generation;

        isEvolved[_tokenId] = true;

        emit Evolve(_tokenId, _dna);
    }

    function changeTribe(uint256 _tokenId, Tribe tribe) external onlyEvolver {
        Zoan storage zoan = zoans[_tokenId];
        zoan.tribe = tribe;

        emit UpdateTribe(_tokenId, tribe);
    }

    function upgradeGeneration(uint256 _tokenId, uint256 _generation) external onlyEvolver {
        Zoan storage zoan = zoans[_tokenId];
        zoan.generation = _generation;

        emit UpgradeGeneration(_tokenId, _generation);
    }

    function layEgg(
        address receiver,
        Tribe[] memory tribes,
        uint256 _collections
    ) external onlyEvolver {
        uint256 amount = tribes.length;
        require(amount > 0, 'require: >0');
        if (amount == 1) {
            _layEgg(receiver, tribes[0], _collections);
        } else {
            for (uint256 index = 0; index < amount; index++) {
                _layEgg(receiver, tribes[index], _collections);
            }
        }
    }

    function _layEgg(
        address receiver,
        Tribe tribe,
        uint256 _collections
    ) internal {
        uint256 nextTokenId = _getNextTokenId();
        _mint(receiver, nextTokenId);

        zoans[nextTokenId] = Zoan({
            collections: _collections,
            generation: router.generation(),
            tribe: tribe,
            exp: 0,
            dna: 0,
            bornTime: block.timestamp
        });

        emit LayEgg(nextTokenId, receiver);
    }

    function createCollections(
        address receiver,
        Tribe tribe,
        uint256 _collections,
        uint256 _dna
    ) public onlyEvolver {
        uint256 nextTokenId = _getNextTokenId();
        _mint(receiver, nextTokenId);

        zoans[nextTokenId] = Zoan({
            collections: _collections,
            generation: router.generation(),
            tribe: tribe,
            exp: 0,
            dna: _dna,
            bornTime: block.timestamp
        });
        isEvolved[nextTokenId] = true;

        emit CreateCollections(nextTokenId, receiver, tribe, _dna, _collections);
    }

    /**
     * @dev calculates the next token ID based on value of latestTokenId
     * @return uint256 for the next token ID
     */
    function _getNextTokenId() private view returns (uint256) {
        return latestTokenId.add(1);
    }

    /**
     * @dev increments the value of latestTokenId
     */
    function _incrementTokenId() private {
        latestTokenId++;
    }

    function getZoan(uint256 _tokenId) public view returns (Zoan memory) {
        return zoans[_tokenId];
    }

    function isApprovedForAll(address owner, address operator) public view virtual override returns (bool) {
        if (router.markets(operator)) return true;
        return super.isApprovedForAll(owner, operator);
    }

    function _transfer(
        address from,
        address to,
        uint256 tokenId
    ) internal virtual override {
        if (router.usersLock(to) || router.usersLock(from) || router.tokensLock(tokenId)) {
            revert('locked.');
        }

        latestBlockTransfer[tokenId] = block.number;
        return super._transfer(from, to, tokenId);
    }

    function recoverZoon(uint256 amount) public {
        require(_msgSender() == dev);
        zoonToken.transfer(_msgSender(), amount); // dont expect we'll hold tokens here but might as well
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(ERC721Upgradeable, AccessControlUpgradeable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
