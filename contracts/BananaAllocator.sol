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

// TODO: Write tests 

contract BananaAllocator is Ownable {
    using SafeMath for uint256;

    IERC20 public allocationToken;

    // STRUCTS
    struct AllocationInfo {
        string allocationName;
        uint256 allocationAmount;
        address[] allocationAdmins;
        uint256 bananaAvailable;
    }

    // VARIABLES
    AllocationInfo[] public allocationInfo;
    uint256 public totalAllocations;

    // EVENTS
    event AllocationAdded(string name, uint256 allocationAmount, address[] allocationAdmins);
    event AllocationWithdrawn(uint256 aid, uint256 bananaAmount, uint256 usdAmount);
    event AllocationsSynced();

    // TODO: Populate Constructor (or deem unnecessary)
    constructor(
        IERC20 _allocationToken
    ) public {
        allocationToken = _allocationToken;
    }

    modifier onlyAllocationAdmin(uint256 aid) {
        // Most elegant way to see if array includes an item?
        _;
    }

    function withdrawAllocation(
        uint256 aid, 
        uint256 amount
    ) external onlyOwner onlyAllocationAdmin(aid) {
        if(amount > 0 && amount <= allocationInfo[aid].bananaAvailable) {
            allocationInfo[aid].bananaAvailable = allocationInfo[aid].bananaAvailable.sub(amount);
            allocationToken.transfer(msg.sender, amount);
        }

        // TODO: Calculate true USD amount
        uint256 bananaUsdValue = 47;
        uint256 usdAmount = bananaUsdValue.mul(amount).div(1e18);

        syncAllocations();
        emit AllocationWithdrawn(aid, amount, usdAmount);
    }

    function syncAllocations() internal {
        uint256 length = allocationInfo.length;
        uint256 totalBananaOwed = 0;
        uint256 bananaInContract = allocationToken.balanceOf(address(this));

        for (uint256 aid = 0; aid < length; aid++) {
            totalBananaOwed += allocationInfo[aid].bananaAvailable;
        }

        uint256 bananaToAllocate = bananaInContract.sub(totalBananaOwed);
        
        for (uint256 aid = 0; aid < length; aid++) {
            uint256 _bananaOwedToAllocation = allocationInfo[aid].allocationAmount.div(totalAllocations).mul(bananaToAllocate);
            allocationInfo[aid].bananaAvailable += _bananaOwedToAllocation;
        }
        
        emit AllocationsSynced();
    }

    function addAllocation(
        string memory allocationName, 
        uint256 allocationAmount, 
        address[] memory allocationAdmins
    ) external onlyOwner {
        totalAllocations += allocationAmount;
        
        allocationInfo.push(AllocationInfo({
            allocationName: allocationName,
            allocationAmount: allocationAmount, 
            allocationAdmins: allocationAdmins, 
            bananaAvailable: 0
        }));

        emit AllocationAdded(allocationName, allocationAmount, allocationAdmins);
    }
}
