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
import "./interfaces/IMasterApe.sol";

// TODO: Write tests 

contract BananaAllocator is Ownable {
    using SafeMath for uint256;

    IERC20 public allocationToken; // BANANA token
    PriceGetter public priceGetter; // Stubbed way to grab price
    IMasterApe public masterApe; // Stubbed way to grab price

    // Information for each allocation
    struct AllocationInfo {
        string allocationName; // For recordkeeping purposes
        uint256 allocationAmount; // Amount (intended to be percentages, but can be treated similarly to farm multipliers)
        uint256 tokensAvailable; // The current amount of tokens available to a specific allocation
        mapping(address => bool) allocationAdmins; // People approved to extract tokens allocated to a specific allocation
    }

    AllocationInfo[] public allocationInfo;
    uint256 public totalAllocations;
    uint256 public syncDelay;
    uint256 public lastSyncTimestamp;

    event AllocationAdded(string name, uint256 allocationAmount, address[] allocationAdmins);
    event AllocationWithdrawn(uint256 aid, uint256 allocationAmount, uint256 usdAmount, address to);
    event AllocationsSynced();
    event AllocationSet(uint256 aid, uint256 allocationAmount);
    event AdminsAdded(uint256 aid, address[] newAllocationAdmins);
    event AdminsRemoved(uint256 aid, address[] removedAllocationAdmins);
    event SweepWithdraw(address indexed to, IERC20 indexed token, uint256 amount);
    event SyncDelaySet(uint256 syncDelay);
    event MasterApeDevTransferred();

    constructor(
        IERC20 _allocationToken,
        PriceGetter _priceGetter,
        IMasterApe _masterApe
    ) public {
        allocationToken = _allocationToken;
        priceGetter = _priceGetter;
        masterApe = _masterApe;
        syncDelay = 0;
        lastSyncTimestamp = 0;
    }

    modifier onlyAllocationAdmin(uint256 aid, address adminAddress) {
        require(allocationInfo[aid].allocationAdmins[adminAddress], "Not an admin ser.");
        _;
    }

    /// @notice A function to withdraw from an allocation to the sending address
    /// @param aid number referencing the applicable allocation
    /// @param amount the amount of tokens to be withdrawn
    function withdrawAllocation(
        uint256 aid, 
        uint256 amount
    ) external onlyAllocationAdmin(aid, msg.sender) {
        if(amount > 0 && amount <= allocationInfo[aid].tokensAvailable) {
            allocationInfo[aid].tokensAvailable = allocationInfo[aid].tokensAvailable.sub(amount);
            allocationToken.transfer(msg.sender, amount);

            uint256 allocationTokenUsdValue = priceGetter.getTokenUsdPrice(address(allocationToken));
            uint256 usdAmount = allocationTokenUsdValue.mul(amount).div(1e18);

            emit AllocationWithdrawn(aid, amount, usdAmount, msg.sender);
        }

        if (lastSyncTimestamp + syncDelay < block.timestamp) {
            syncAllocations();
        }
    }

    /// @notice A function to withdraw from an allocation to another address
    /// @param aid number referencing the applicable allocation
    /// @param amount the amount of tokens to be withdrawn
    /// @param to the address to withdraw tokens to
    function withdrawAllocationTo(
        uint256 aid, 
        uint256 amount, 
        address to
    ) external onlyAllocationAdmin(aid, msg.sender) {
        if(amount > 0 && amount <= allocationInfo[aid].tokensAvailable) {
            allocationInfo[aid].tokensAvailable = allocationInfo[aid].tokensAvailable.sub(amount);
            allocationToken.transfer(to, amount);

            uint256 allocationTokenUsdValue = priceGetter.getTokenUsdPrice(address(allocationToken));
            uint256 usdAmount = allocationTokenUsdValue.mul(amount).div(1e18);

            emit AllocationWithdrawn(aid, amount, usdAmount, msg.sender);
        }

        if (lastSyncTimestamp + syncDelay < block.timestamp) {
            syncAllocations();
        }
    }

    /// @notice An internal function to sync all the allocation amounts
    function syncAllocations() internal {
        uint256 length = allocationInfo.length;
        uint256 totalTokensOwed = 0;
        uint256 tokensInContract = allocationToken.balanceOf(address(this));

        for (uint256 aid = 0; aid < length; aid++) {
            totalTokensOwed = totalTokensOwed.add(allocationInfo[aid].tokensAvailable);
        }

        uint256 tokensToAllocate = tokensInContract.sub(totalTokensOwed);
        
        for (uint256 i = 0; i < length; i++) {
            allocationInfo[i].tokensAvailable += allocationInfo[i].allocationAmount.mul(tokensToAllocate).div(totalAllocations);
        }

        lastSyncTimestamp = block.timestamp;
        
        emit AllocationsSynced();
    }

    /// @notice A function to adjust the sync delay
    /// @param _syncDelay number to adjust the sync delay to
    ///     in milliseconds
    function setSyncDelay(uint256 _syncDelay) external onlyOwner {
        syncDelay = _syncDelay;

        emit SyncDelaySet(_syncDelay);
    }

    /// @notice A function to add a new allocation
    /// @param allocationName string referencing the name of an allocation
    /// @param allocationAmount amount for allocation to recieve
    /// @param newAllocationAdmins array of addresses to be admins in this specific allocation
    function addAllocation(
        string memory allocationName, 
        uint256 allocationAmount, 
        address[] memory newAllocationAdmins
    ) external onlyOwner {
        totalAllocations += allocationAmount;

        allocationInfo.push(AllocationInfo({
            allocationName: allocationName,
            allocationAmount: allocationAmount, 
            tokensAvailable: 0
        }));

        uint256 _aid = allocationInfo.length - 1;

        for(uint256 i = 0; i < newAllocationAdmins.length; i++) {
            allocationInfo[_aid].allocationAdmins[newAllocationAdmins[i]] = true;
        }
    
        emit AllocationAdded(allocationName, allocationAmount, newAllocationAdmins);
    }

    /// @notice An external function to adjust the amount an allocation has
    /// @param aid number referencing the applicable allocation
    /// @param allocationAmount the updated amount to set an allocation to
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

    /// @notice An external function to add admins to an allocation
    /// @param aid number referencing the applicable allocation
    /// @param newAllocationAdmins array of addresses to add to a specific allocation
    function addAdminsToAllocation(
        uint256 aid, 
        address[] memory newAllocationAdmins
    ) external onlyOwner {
        for(uint256 i = 0; i < newAllocationAdmins.length; i++) {
            allocationInfo[aid].allocationAdmins[newAllocationAdmins[i]] = true;
        }

        emit AdminsAdded(aid, newAllocationAdmins);
    }

    /// @notice An external function to remove admins from an allocation
    /// @param aid number referencing the applicable allocation
    /// @param allocationAdminsToRemove array of addresses to remove from a specific allocation
    function removeAdminsFromAllocation(
        uint256 aid, 
        address[] memory allocationAdminsToRemove
    ) external onlyOwner {
        for(uint256 i = 0; i < allocationAdminsToRemove.length; i++) {
            allocationInfo[aid].allocationAdmins[allocationAdminsToRemove[i]] = false;
        }

        emit AdminsRemoved(aid, allocationAdminsToRemove);
    }

    /// @notice An enternal function to transfer dev role of the MasterApe contract
    function transferDevToOwner() external onlyOwner {
        masterApe.dev(msg.sender);
        emit MasterApeDevTransferred();
    }

    /// @notice An external function to sweep accidental ERC20 transfers to this contract. 
    ///   Tokens are sent to owner
    /// @param _tokens Array of ERC20 addresses to sweep
    /// @param _to Address to send tokens to
    function sweepTokens(IERC20[] memory _tokens, address _to) external onlyOwner {
        for (uint256 index = 0; index < _tokens.length; index++) {
            IERC20 token = _tokens[index];
            uint256 balance = token.balanceOf(address(this));
            token.transfer(_to, balance);
            emit SweepWithdraw(_to, token, balance);
        }
    }
}
