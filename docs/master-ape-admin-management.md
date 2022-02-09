# MasterApeAdmin Management
The [MasterApeAdmin](./../contracts/MasterApeAdmin.sol) contract acts as a parent to an already deployed [MasterApe](./../contracts/MasterApe.sol) contract.  

## Roles
There are two primary roles of the `MasterApeAdmin`:
- **Owner**: Has access to critical `MasterApe` functionality and is intended to be behind a secure multi-sig address
  - `setPendingMasterApeOwner`: Set a pending owner for the `MasterApe` contract.(`acceptMasterApeOwnership` must be called by the pending owner to take ownership)
  - `updateMasterApeMultiplier`: Change the BANANA distribution multiplier on the `MasterApe` contract.
  - `sweepTokens`: Unlock tokens which have been sent to this contract accidentally.  

- **FarmAdmin**:
  - `transferFarmAdminOwnership`: Transfer the `farmAdmin` role to another address.
  - `syncFixedPercentFarms`: Used to adjust the `fixedPercentFarms` (ghost farms) allocations to match their allocation percentage target. (This is optional when making any farm updates.)
  - `addMasterApeFarms`: Add a batch of farms to the `MasterApe`.
  - `setMasterApeFarms`: Adjust a batch of 
  - `addFixedPercentFarmAllocation`:
  - `setFixedPercentFarmAllocation`:
  - Farm adjustment settings (options passed in four functions above):
    - `_withMassPoolUpdate` will add a lot of gas due to the amount of farms. Ideally only to it once before sending a lot of txs. 
    - `_syncFixedPercentageFarms` can be done at the end of a batch of txs in a separate tx to `syncFixedPercentFarms`, but the sync needs to happen after an update to ensure the percentages are accurate.  

- `batchUpdateMasterApePools`: Is a `public` function which allows for a way to batch update pools incase `massUpdatePools` on the `MasterApe` contract reaches the gas limit due to looping over every farm.

There is one more role which is important to take into consideration, but cannot be directly controlled by the `MasterApeAdmin` contract:
- dev: The dev address is the address which receives protocol BANANA rewards. **This address can only change itself.** Because of this, if the address is ever moved to a contract, the contract needs to support giving the dev address to another address.