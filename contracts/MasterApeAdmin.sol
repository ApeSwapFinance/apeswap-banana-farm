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

// TODO: transferMasterApeOwnership(address _newOwner) public onlyOwner
// TODO: transferMasterApeOwnershipToThisOwner() external onlyOwner
// TODO: transferFarmAdmin()
// TEST: Needs tests written
// NOTE: dev address must be changed by dev address


contract MasterApe is Ownable {
    using SafeMath for uint256;
    using SafeBEP20 for IBEP20;
    // TODO: Create function to update this.
    // MasterApe Address
    IMasterApe public masterApe;


    struct GhostFarmInfo {
        uint256 pid;
        uint256 allocationPercent;
        bool isActive;
    }

    uint256[] public ghostFarmPids;
    mapping(uint256 => GhostFarmInfo) public getGhostFarmFromPid;

    
    // NOTE: percentages are divided by 1000;
    uint256 constant public PERCENTAGE_PRECISION = 1000;
    // NOTE: pid(0) always gets 25%
    uint256 constant public MAX_GHOST_FARM_PERCENTAGE = PERCENTAGE_PRECISION * 3 / 4;
    // Total allocation percentage for ghost farms
    uint256 public totalGhostFarmPercentage = 0;
    // TODO: Make a function to update this
    address public farmAdmin;

    event AddFarmBatch(uint256 numBatches);
    event SetFarmBatch(uint256 numBatches);
    event GhostFarmAdded(uint256 indexed pid, uint256 allocationPercentage);
    event GhostFarmUpdated(uint256 indexed pid, uint256 previousAllocationPercentage, uint256 allocationPercentage);
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

    function updateMultiplier(uint256 multiplierNumber) public onlyOwner {
        masterApe.updateMultiplier(multiplierNumber);
    }


    function addBatch(
        uint256[] memory _allocPoints,
        IBEP20[] memory _lpTokens,
        bool _withUpdate
    ) public onlyFarmAdmin {
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

    // Update the given pool's BANANA allocation point. Can only be called by the owner.
    function setBatch(
        uint256[] memory _pids,
        uint256[] memory _allocPoints,
        bool _withUpdate
    ) public onlyFarmAdmin {
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

    function getNumberOfGhostFarms() public view returns (uint256) {
        return ghostFarmPids.length;
    }

    function syncGhostFarmWithAllocationsInternal() internal {
        uint256 masterApeTotalAllocation = masterApe.totalAllocPoint();
        uint256 poolAllocation = masterApe.poolInfo(0).allocPoint;
        uint256 ghostFarmAllocation = 0;
        // Calculate the total allocation points of the ghost farms
        for (uint256 index = 0; index < ghostFarmPids.length; index++) {
            ghostFarmAllocation = ghostFarmAllocation.add(masterApe.poolInfo(ghostFarmPids[index]).allocPoint);
        }
        // Calculate alloted allocations
        uint256 excessAllocation = masterApeTotalAllocation.sub(poolAllocation).sub(ghostFarmAllocation);
        uint256 allotedGhostFarmAllocation = excessAllocation.mul(totalGhostFarmPercentage).div(PERCENTAGE_PRECISION);
        // Update Ghost farm allocations
        for (uint256 index = 0; index < ghostFarmPids.length; index++) {
            GhostFarmInfo memory ghostFarm = getGhostFarmFromPid[ghostFarmPids[index]];
            uint256 newGhostFarmAllocation = allotedGhostFarmAllocation.mul(ghostFarm.allocationPercent).div(totalGhostFarmPercentage);
            masterApe.set(ghostFarm.pid, newGhostFarmAllocation, false);
        }

        emit SyncGhostFarms();
    }

    function addGhostFarmAllocation(
        uint256 _pid,
        uint256 _allocPercentage,
        bool _withUpdate
    ) public onlyFarmAdmin {
        require(_pid < masterApe.poolLength(), "pid is out of bounds of MasterApe");
        require(!getGhostFarmFromPid[_pid].isActive, "ghost farm already added");
        require(_allocPercentage.add(totalGhostFarmPercentage) <= MAX_GHOST_FARM_PERCENTAGE, "allocation out of bounds");
 
        if (_withUpdate) {
            masterApe.massUpdatePools();
        }

        getGhostFarmFromPid[_pid].isActive = true;
        totalGhostFarmPercentage += totalGhostFarmPercentage.add(_allocPercentage);

        getGhostFarmFromPid[_pid] = GhostFarmInfo(_pid, _allocPercentage, true);
        ghostFarmPids.push(_pid);
        syncGhostFarmWithAllocationsInternal();
        emit GhostFarmAdded(_pid, _allocPercentage);
    }

    // Move the last element to the deleted spot.
    // Delete the last element, then correct the length.
    function removeFromArray(uint index, uint256[] storage array) internal {
        require(index < array.length, "Incorrect index");
        array[index] = array[array.length-1];
        array.pop();
    }

    function setGhostFarmAllocation(
        uint256 _pid,
        uint256 _allocPercentage,
        bool _withUpdate
    ) public onlyFarmAdmin {
        GhostFarmInfo storage ghostFarm = getGhostFarmFromPid[_pid];
        require(ghostFarm.isActive, "not a valid farm pid");
        uint256 newAllocationPercentage = _allocPercentage.add(totalGhostFarmPercentage).sub(ghostFarm.allocationPercent);
        require(newAllocationPercentage <= MAX_GHOST_FARM_PERCENTAGE, "new allocation out of bounds");

        totalGhostFarmPercentage = newAllocationPercentage;
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
}
