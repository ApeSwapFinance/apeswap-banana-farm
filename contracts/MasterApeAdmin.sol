// SPDX-License-Identifier: MIT
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


import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./interfaces/IMasterApe.sol";

// TEST: Needs tests written
// NOTE: dev address must be changed by dev address
// TODO: Add naatspec comments
// TODO: Add sweepToken function
// TODO: batchUpdatePools function to update masterape pools in batches to avoid out of gas 


contract MasterApeAdmin is Ownable {
    using SafeMath for uint256;

    struct FixedPercentFarmInfo {
        uint256 pid;
        uint256 allocationPercent;
        bool isActive;
    }

    // Farm admin can manage master ape farms and fixed percent farms
    address public farmAdmin;
    // MasterApe Address
    IMasterApe public masterApe;
    // Array of MasterApe pids that are active fixed percent farms
    uint256[] public fixedPercentFarmPids;
    // mapping of MasterApe pids to FixedPercentFarmInfo
    mapping(uint256 => FixedPercentFarmInfo) public getFixedPercentFarmFromPid;
    // The percentages are divided by 1000
    uint256 constant public PERCENTAGE_PRECISION = 1e3;
    // Percentage of base pool allocation managed by MasterApe internally
    /// @dev The BASE_PERCENTAGE needs to be considered in fixed percent farm allocation updates as it's allocation is based on a percentage
    uint256 constant public BASE_PERCENTAGE = PERCENTAGE_PRECISION / 4; // The base staking pool always gets 25%
    // Approaching max fixed farm percentage makes the fixed farm allocations go to infinity
    uint256 constant public MAX_FIXED_FARM_PERCENTAGE_BUFFER = 100; // 10% Buffer
    // Percentage available to additional fixed percent farms
    uint256 constant public MAX_FIXED_FARM_PERCENTAGE = PERCENTAGE_PRECISION - BASE_PERCENTAGE - MAX_FIXED_FARM_PERCENTAGE_BUFFER;
    // Total allocation percentage for fixed percent farms
    uint256 public totalFixedPercentFarmPercentage = 0;

    event AddFarm(IERC20 indexed lpToken, uint256 allocation);
    event SetFarm(uint256 indexed pid, uint256 allocation);
    event SyncFixedPercentFarm(uint256 indexed pid, uint256 allocation);
    event AddFixedPercentFarm(uint256 indexed pid, uint256 allocationPercentage);
    event SetFixedPercentFarm(uint256 indexed pid, uint256 previousAllocationPercentage, uint256 allocationPercentage);
    event TransferredFarmAdmin(address indexed previousFarmAdmin, address indexed newFarmAdmin);
    event SweepWithdraw(address indexed to, IERC20 indexed token, uint256 amount);


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
        // Event emitted in MasterApe
        masterApe.transferOwnership(owner());
    }

    function updateMasterApeMultiplier(uint256 multiplier) external onlyOwner {
        masterApe.updateMultiplier(multiplier);
    }

    // TEST: sweep
    /// @notice A public function to sweep accidental ERC20 transfers to this contract. 
    ///   Tokens are sent to owner
    /// @param tokens Array of ERC20 addresses to sweep
    /// @param to Address to send tokens to
    function sweepToken(IERC20[] memory tokens, address to) external onlyOwner {
        for (uint256 index = 0; index < tokens.length; index++) {
            IERC20 token = tokens[index];
            uint256 balance = token.balanceOf(address(this));
            token.transfer(to, balance);
            emit SweepWithdraw(to, token, balance);
        }
    }

    function transferFarmAdminOwnership(address newFarmAdmin) external onlyFarmAdmin {
        require(newFarmAdmin != address(0), 'cannot transfer farm admin to address(0)');
        address previousFarmAdmin = farmAdmin;
        farmAdmin = newFarmAdmin;
        emit TransferredFarmAdmin(previousFarmAdmin, newFarmAdmin);
    }

    function addMasterApeFarms(
        uint256[] memory _allocPoints,
        IERC20[] memory _lpTokens,
        bool _withUpdate
    ) external onlyFarmAdmin {
        require(_allocPoints.length == _lpTokens.length, "array length mismatch");

        if (_withUpdate) {
            masterApe.massUpdatePools();
        }

        for (uint256 index = 0; index < _allocPoints.length; index++) {
            masterApe.add(_allocPoints[index], address(_lpTokens[index]), false);
            emit AddFarm(_lpTokens[index], _allocPoints[index]);
        }
        syncFixedPercentFarmInternal();
    }

    function setMasterApeFarms(
        uint256[] memory _pids,
        uint256[] memory _allocPoints,
        bool _withUpdate
    ) external onlyFarmAdmin {
        require(_pids.length == _allocPoints.length, "array length mismatch");

        if (_withUpdate) {
            masterApe.massUpdatePools();
        }

        uint256 pidIndexes = masterApe.poolLength();
        for (uint256 index = 0; index < _pids.length; index++) {
            require(_pids[index] < pidIndexes, "pid is out of bounds of MasterApe");
            // Set all pids with no update
            masterApe.set(_pids[index], _allocPoints[index], false);
            emit SetFarm(_pids[index], _allocPoints[index]);
        }

        syncFixedPercentFarmInternal();
    }

    function addFixedPercentFarmAllocation(
        uint256 _pid,
        uint256 _allocPercentage,
        bool _withUpdate
    ) external onlyFarmAdmin {
        require(_pid < masterApe.poolLength(), "pid is out of bounds of MasterApe");
        require(!getFixedPercentFarmFromPid[_pid].isActive, "fixed percent farm already added");
        uint256 newTotalFixedPercentage = totalFixedPercentFarmPercentage.add(_allocPercentage);
        require(newTotalFixedPercentage <= MAX_FIXED_FARM_PERCENTAGE, "allocation out of bounds");
    
        totalFixedPercentFarmPercentage = newTotalFixedPercentage;
        getFixedPercentFarmFromPid[_pid] = FixedPercentFarmInfo(_pid, _allocPercentage, true);
        fixedPercentFarmPids.push(_pid);
        emit AddFixedPercentFarm(_pid, _allocPercentage);
       
        if (_withUpdate) {
            masterApe.massUpdatePools();
        }
        syncFixedPercentFarmInternal();
    }

    function setFixedPercentFarmAllocation(
        uint256 _pid,
        uint256 _allocPercentage,
        bool _withUpdate
    ) external onlyFarmAdmin {
        FixedPercentFarmInfo storage fixedPercentFarm = getFixedPercentFarmFromPid[_pid];
        require(fixedPercentFarm.isActive, "not a valid farm pid");
        uint256 newTotalFixedPercentFarmPercentage = _allocPercentage.add(totalFixedPercentFarmPercentage).sub(fixedPercentFarm.allocationPercent);
        require(newTotalFixedPercentFarmPercentage <= MAX_FIXED_FARM_PERCENTAGE, "new allocation out of bounds");

        totalFixedPercentFarmPercentage = newTotalFixedPercentFarmPercentage;
        uint256 previousAllocation = fixedPercentFarm.allocationPercent;
        fixedPercentFarm.allocationPercent = _allocPercentage;

        if(_allocPercentage == 0) {
            // Disable fixed percentage farm and MasterApe allocation
            fixedPercentFarm.isActive = false;
            // Remove fixed percent farm from pid array
            for (uint256 index = 0; index < fixedPercentFarmPids.length; index++) {
                if(fixedPercentFarmPids[index] == _pid) {
                    removeFromArray(index, fixedPercentFarmPids);
                    break;
                }
            }
            // Disable farm on MasterApe
            // Update pool for pid before disabling without mass update
            masterApe.updatePool(_pid);
            masterApe.set(_pid, 0, false); // NOTE: When disabling a fixed farm, it sets the allocation point to zero
        }
        emit SetFixedPercentFarm(_pid, previousAllocation, _allocPercentage);
      
        if (_withUpdate) {
            masterApe.massUpdatePools();
        }
        syncFixedPercentFarmInternal();
    }

    /** Public Functions  */

    function getNumberOfFixedPercentFarms() public view returns (uint256) {
        return fixedPercentFarmPids.length;
    }

    function getTotalAllocationPercent() public view returns (uint256) {
        return totalFixedPercentFarmPercentage + BASE_PERCENTAGE;
    }

    /** Internal Functions  */

    function syncFixedPercentFarmInternal() internal {
        if(getNumberOfFixedPercentFarms() == 0) {
            return; 
        }
        uint256 masterApeTotalAllocation = masterApe.totalAllocPoint();
        ( ,uint256 poolAllocation,,) = masterApe.getPoolInfo(0);
        uint256 currentTotalFixedPercentFarmAllocation = 0;
        // Calculate the total allocation points of the fixed percent farms
        for (uint256 index = 0; index < fixedPercentFarmPids.length; index++) {
            ( ,uint256 fixedPercentFarmAllocation,,) = masterApe.getPoolInfo(fixedPercentFarmPids[index]);
            currentTotalFixedPercentFarmAllocation = currentTotalFixedPercentFarmAllocation.add(fixedPercentFarmAllocation);
        }
        // Calculate alloted allocations
        uint256 nonPercentageBasedAllocation = masterApeTotalAllocation.sub(poolAllocation).sub(currentTotalFixedPercentFarmAllocation);
        uint256 percentageIncrease = (PERCENTAGE_PRECISION * PERCENTAGE_PRECISION) / (PERCENTAGE_PRECISION.sub(getTotalAllocationPercent()));
        uint256 finalAllocation = nonPercentageBasedAllocation.mul(percentageIncrease).div(PERCENTAGE_PRECISION);
        uint256 allotedFixedPercentFarmAllocation = finalAllocation.sub(nonPercentageBasedAllocation);
        // Update fixed percentage farm allocations
        for (uint256 index = 0; index < fixedPercentFarmPids.length; index++) {
            FixedPercentFarmInfo memory fixedPercentFarm = getFixedPercentFarmFromPid[fixedPercentFarmPids[index]];
            uint256 newFixedPercentFarmAllocation = allotedFixedPercentFarmAllocation.mul(fixedPercentFarm.allocationPercent).div(getTotalAllocationPercent());
            masterApe.set(fixedPercentFarm.pid, newFixedPercentFarmAllocation, false);
            emit SyncFixedPercentFarm(fixedPercentFarm.pid, newFixedPercentFarmAllocation);
        }
    }

    // Move the last element to the deleted spot.
    // Delete the last element, then correct the length.
    function removeFromArray(uint index, uint256[] storage array) internal {
        require(index < array.length, "Incorrect index");
        array[index] = array[array.length-1];
        array.pop();
    }
}
