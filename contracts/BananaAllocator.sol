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

// Stubbed import to get price for allocation token
import "./PriceGetter.sol";

// TODO: Write tests 

contract BananaAllocator is Ownable {
    using SafeMath for uint256;

    IERC20 public allocationToken; // BANANA token
    PriceGetter public priceGetter;

    // Information for each allocation
    struct AllocationInfo {
        string allocationName; // For recordkeeping purposes
        uint256 allocationAmount; // Amount (intended to be percentages, but can be treated similarly to farm multipliers)
        address[] allocationAdmins; // People approved to extract tokens allocated to a specific allocation
        uint256 tokensAvailable; // The current amount of 
    }

    // VARIABLES
    AllocationInfo[] public allocationInfo;
    uint256 public totalAllocations;

    // EVENTS
    event AllocationAdded(string name, uint256 allocationAmount, address[] allocationAdmins);
    event AllocationWithdrawn(uint256 aid, uint256 allocationAmount, uint256 usdAmount, address to);
    event AllocationsSynced();
    event AllocationSet(uint256 aid, uint256 allocationAmount);
    event AdminsAdded(uint256 aid, address[] newAllocationAdmins);
    event AdminsRemoved(uint256 aid, address[] removedAllocationAdmins);
    event TokenSweep(address sender, IERC20 token, uint256 balance);

    constructor(
        IERC20 _allocationToken,
        PriceGetter _priceGetter
    ) public {
        allocationToken = _allocationToken;
        priceGetter = _priceGetter;
    }

    modifier onlyAllocationAdmin(uint256 aid) {
        // Most elegant way to see if array includes an item?
        _;
    }

    function withdrawAllocation(
        uint256 aid, 
        uint256 amount
    ) external onlyAllocationAdmin(aid) {
        if(amount > 0 && amount <= allocationInfo[aid].tokensAvailable) {
            allocationInfo[aid].tokensAvailable = allocationInfo[aid].tokensAvailable.sub(amount);
            allocationToken.transfer(msg.sender, amount);
        }

        uint256 allocationTokenUsdValue = priceGetter.getTokenUsdPrice(address(allocationToken));
        uint256 usdAmount = allocationTokenUsdValue.mul(amount).div(1e18);

        syncAllocations();
        emit AllocationWithdrawn(aid, amount, usdAmount, msg.sender);
    }

    // TODO: Update once withdrawAllocation logic is finalized
    function withdrawAllocationTo(uint256 aid, uint256 amount, address to) external onlyAllocationAdmin(aid) {}

    function syncAllocations() internal {
        uint256 length = allocationInfo.length;
        uint256 totalTokensOwed = 0;
        uint256 tokensInContract = allocationToken.balanceOf(address(this));

        for (uint256 aid = 0; aid < length; aid++) {
            totalTokensOwed += allocationInfo[aid].tokensAvailable;
        }

        uint256 tokensToAllocate = tokensInContract.sub(totalTokensOwed);
        
        for (uint256 aid = 0; aid < length; aid++) {
            uint256 _tokensOwedToAllocation = allocationInfo[aid].allocationAmount.div(totalAllocations).mul(tokensToAllocate);
            allocationInfo[aid].tokensAvailable += _tokensOwedToAllocation;
        }
        
        emit AllocationsSynced();
    }

    function setSyncDelay() external {}

    function addAllocation(
        string memory allocationName, 
        uint256 allocationAmount, 
        address[] memory allocationAdmins
    ) external onlyOwner {
        totalAllocations += allocationAmount;
        
        allocationInfo.push(AllocationInfo({
            allocationName: allocationName,
            allocationAmount: allocationAmount, 
            allocationAdmins: allocationAdmins, // Need to add msg.sender to allocationAdmins array 
            tokensAvailable: 0
        }));

        emit AllocationAdded(allocationName, allocationAmount, allocationAdmins);
    }

    function setAllocation(
        uint256 aid, 
        uint256 allocationAmount
    ) external onlyOwner {
        uint256 prevAllocationAmount = allocationInfo[aid].allocationAmount;

        allocationInfo[aid].allocationAmount = allocationAmount;
        if (prevAllocationAmount != allocationAmount) {
            totalAllocations = totalAllocations.sub(prevAllocationAmount).add(allocationAmount);
        }

        emit AllocationSet(aid, allocationAmount);
    }

    function addAdminsToAllocation(
        uint256 aid, 
        address[] memory newAllocationAdmins
    ) external onlyOwner {
        for(uint256 i = 0; i < newAllocationAdmins.length; i++) {
            // TODO: Add no duplicates require statement
            allocationInfo[aid].allocationAdmins.push(newAllocationAdmins[i]);
        }

        emit AdminsAdded(aid, newAllocationAdmins);
    }

    // TODO: Finish function logic
    function removeAdminsFromAllocation(
        uint256 aid, 
        address[] memory allocationAdminsToRemove
    ) external onlyOwner {
        for(uint256 i = 0; i < allocationAdminsToRemove.length; i++) {
            // TODO: contruct logic to remove here
        }

        emit AdminsRemoved(aid, allocationAdminsToRemove);
    }

    // TODO: Determine intended use of this function
    function transferDevToOwner() external {}

    /// @notice A public function to sweep accidental ERC20 transfers to this contract. 
    ///   Tokens are sent to owner
    /// @param token The address of the ERC20 token to sweep
    function sweepToken(IERC20 token) external onlyOwner {
        uint256 balance = token.balanceOf(address(this));
        token.transfer(msg.sender, balance);
        emit TokenSweep(msg.sender, token, balance);
    }

    /* 
        Helper Functions
    */ 

    // Move the last element to the deleted spot.
    // Delete the last element, then correct the length.
    function removeFromArray(uint index, uint256[] storage array) internal {
        require(index < array.length, "Incorrect index");
        array[index] = array[array.length-1];
        array.pop();
    }
}
