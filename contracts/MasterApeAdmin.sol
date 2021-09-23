pragma solidity 0.6.12;

/*
 * ApeSwapFinance
 * App:             https://apeswap.finance
 * Medium:          https://medium.com/@ape_swap
 * Twitter:         https://twitter.com/ape_swap
 * Telegram:        https://t.me/ape_swap
 * Announcements:   https://t.me/ape_swap_news
 * GitHub:          https://github.com/ApeSwapFinance
 */

import "@pancakeswap/pancake-swap-lib/contracts/math/SafeMath.sol";
import "@pancakeswap/pancake-swap-lib/contracts/token/BEP20/IBEP20.sol";
import "@pancakeswap/pancake-swap-lib/contracts/token/BEP20/SafeBEP20.sol";
import "@pancakeswap/pancake-swap-lib/contracts/access/Ownable.sol";

import "./interfaces/IMasterApe.sol";
import "./BananaToken.sol";
import "./BananaSplitBar.sol";

// TEST: Needs tests written
// NOTE: dev address must be changed by dev address


contract MasterApe is Ownable {
    using SafeMath for uint256;
    using SafeBEP20 for IBEP20;

    struct GhostFarmInfo {
        uint256 pid;
        uint256 allocationPercent;
        bool isActive;
    }

    // Farm admin can manage master ape farms and ghost farms
    address public farmAdmin;
    // MasterApe Address
    IMasterApe public masterApe;
    // Array of MasterApe pids that are active ghost farms
    uint256[] public ghostFarmPids;
    // mapping of MasterApe pids to GhostFarmInfo
    mapping(uint256 => GhostFarmInfo) public getGhostFarmFromPid;
    // The amount which decimal precentages are expanded to
    uint256 constant public PERCENTAGE_PRECISION = 1e4;
    // Percentage of base pool allocation managed by MasterApe internally
    /// @dev The BASE_PERCENTAGE needs to be considered in ghost farm allocation updates as it's allocation is based on a percentage
    uint256 constant public BASE_PERCENTAGE = PERCENTAGE_PRECISION / 4; // The base staking pool always gets 25%
    // Percentage available to additional ghost farms
    uint256 constant public MAX_GHOST_FARM_PERCENTAGE = PERCENTAGE_PRECISION - BASE_PERCENTAGE;
    // Total allocation percentage for ghost farms
    uint256 public totalGhostFarmPercentage = 0;

    event AddFarmBatch(uint256 numBatches);
    event SetFarmBatch(uint256 numBatches);
    event GhostFarmAdded(uint256 indexed pid, uint256 allocationPercentage);
    event GhostFarmUpdated(uint256 indexed pid, uint256 previousAllocationPercentage, uint256 allocationPercentage);
    event TransferredFarmAdmin(address indexed previousFarmAdmin, address indexed newFarmAdmin);
    event SyncGhostFarms();


    constructor(
        IMasterApe _masterApe,
        address _farmAdmin
    ) public {
        masterApe = _masterApe;
        farmAdmin = _farmAdmin;
    }

    modifier onlyFarmAdmin() {
        require(msg.sender == farmAdmin, "must be called by farm admin");
        _;
    }

    /** External Functions  */

    function transferMasterApeOwnershipToCurrentOwner() external onlyOwner {
        masterApe.transferOwnership(owner());
    }

    function transferFarmAdminOwnership(address newFarmAdmin) external onlyFarmAdmin {
        require(newFarmAdmin != address(0), 'cannot transfer farm admin to address(0)');
        address previousFarmAdmin = farmAdmin;
        farmAdmin = newFarmAdmin;
        emit TransferredFarmAdmin(previousFarmAdmin, newFarmAdmin);
    }

    function updateMultiplier(uint256 multiplierNumber) external onlyOwner {
        masterApe.updateMultiplier(multiplierNumber);
    }

    function addBatch(
        uint256[] memory _allocPoints,
        IBEP20[] memory _lpTokens,
        bool _withUpdate
    ) external onlyFarmAdmin {
        require(
            _allocPoints.length == _lpTokens.length,
            "array length mismatch"
        );
        if (_withUpdate) {
            masterApe.massUpdatePools();
        }
        for (uint256 index = 0; index < _allocPoints.length; index++) {
            masterApe.add(_allocPoints[index], address(_lpTokens[index]), false);
        }

        syncGhostFarmWithAllocationsInternal();

        emit AddFarmBatch(_allocPoints.length);
    }

    function setBatch(
        uint256[] memory _pids,
        uint256[] memory _allocPoints,
        bool _withUpdate
    ) external onlyFarmAdmin {
        require(
            _pids.length == _allocPoints.length,
            "array length mismatch"
        );

        if (_withUpdate) {
            masterApe.massUpdatePools();
        }

        for (uint256 index = 0; index < _allocPoints.length; index++) {
            masterApe.set(_pids[index], _allocPoints[index], false);
        }

        syncGhostFarmWithAllocationsInternal();

        emit SetFarmBatch(_allocPoints.length);
    }

    function addGhostFarmAllocation(
        uint256 _pid,
        uint256 _allocPercentage,
        bool _withUpdate
    ) external onlyFarmAdmin {
        require(_pid < masterApe.poolLength(), "pid is out of bounds of MasterApe");
        require(!getGhostFarmFromPid[_pid].isActive, "ghost farm already added");
        require(_allocPercentage.add(totalGhostFarmPercentage) <= MAX_GHOST_FARM_PERCENTAGE, "allocation out of bounds");
 
        if (_withUpdate) {
            masterApe.massUpdatePools();
        }

        getGhostFarmFromPid[_pid].isActive = true;
        totalGhostFarmPercentage = totalGhostFarmPercentage.add(_allocPercentage);

        getGhostFarmFromPid[_pid] = GhostFarmInfo(_pid, _allocPercentage, true);
        ghostFarmPids.push(_pid);
        syncGhostFarmWithAllocationsInternal();
        emit GhostFarmAdded(_pid, _allocPercentage);
    }

    function setGhostFarmAllocation(
        uint256 _pid,
        uint256 _allocPercentage,
        bool _withUpdate
    ) external onlyFarmAdmin {
        GhostFarmInfo storage ghostFarm = getGhostFarmFromPid[_pid];
        require(ghostFarm.isActive, "not a valid farm pid");
        uint256 newTotalGhostFarmPercentage = _allocPercentage.add(totalGhostFarmPercentage).sub(ghostFarm.allocationPercent);
        require(newTotalGhostFarmPercentage <= MAX_GHOST_FARM_PERCENTAGE, "new allocation out of bounds");

        totalGhostFarmPercentage = newTotalGhostFarmPercentage;
        uint256 previousAllocation = ghostFarm.allocationPercent;
        ghostFarm.allocationPercent = _allocPercentage;

        if(_allocPercentage == 0) {
            ghostFarm.isActive = false;
            // Remove ghost farm from pid array
            for (uint256 index = 0; index < ghostFarmPids.length; index++) {
                if(ghostFarmPids[index] == _pid) {
                    removeFromArray(index, ghostFarmPids);
                    break;
                }
            }
        }
      
        if (_withUpdate) {
            masterApe.massUpdatePools();
        }
        syncGhostFarmWithAllocationsInternal();
        emit GhostFarmUpdated(_pid, previousAllocation, _allocPercentage);
    }

    /** Public Functions  */

    function getNumberOfGhostFarms() public view returns (uint256) {
        return ghostFarmPids.length;
    }

    function getTotalAllocationPercent() public view returns (uint256) {
        return totalGhostFarmPercentage + BASE_PERCENTAGE;
    }

    /** Internal Functions  */

    function syncGhostFarmWithAllocationsInternal() internal {
        uint256 masterApeTotalAllocation = masterApe.totalAllocPoint();
        ( ,uint256 poolAllocation,,) = masterApe.getPoolInfo(0);
        uint256 currentTotalGhostFarmAllocation = 0;
        // Calculate the total allocation points of the ghost farms
        for (uint256 index = 0; index < ghostFarmPids.length; index++) {
            ( ,uint256 ghostFarmAllocation,,) = masterApe.getPoolInfo(ghostFarmPids[index]);
            currentTotalGhostFarmAllocation = currentTotalGhostFarmAllocation.add(ghostFarmAllocation);
        }
        // Calculate alloted allocations
        uint256 nonPercentageBasedAllocation = masterApeTotalAllocation.sub(poolAllocation).sub(currentTotalGhostFarmAllocation);
        uint256 percentageIncrease = (PERCENTAGE_PRECISION.mul(PERCENTAGE_PRECISION)).div(PERCENTAGE_PRECISION.sub(getTotalAllocationPercent()));
        uint256 finalAllocation = nonPercentageBasedAllocation.mul(percentageIncrease).div(PERCENTAGE_PRECISION);
        uint256 allotedGhostFarmAllocation = finalAllocation.sub(nonPercentageBasedAllocation);
        // Update Ghost farm allocations
        for (uint256 index = 0; index < ghostFarmPids.length; index++) {
            GhostFarmInfo memory ghostFarm = getGhostFarmFromPid[ghostFarmPids[index]];
            uint256 newGhostFarmAllocation = allotedGhostFarmAllocation.mul(ghostFarm.allocationPercent).div(getTotalAllocationPercent());
            masterApe.set(ghostFarm.pid, newGhostFarmAllocation, false);
        }

        emit SyncGhostFarms();
    }

    // Move the last element to the deleted spot.
    // Delete the last element, then correct the length.
    function removeFromArray(uint index, uint256[] storage array) internal {
        require(index < array.length, "Incorrect index");
        array[index] = array[array.length-1];
        array.pop();
    }
}
