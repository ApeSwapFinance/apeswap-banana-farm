# Banana Farming 🍌

Feel free to read the code. More details coming soon.

https://apeswap.finance. 

## Solidity Standard Input
With the help of solt we can easily verify our contracts on Etherscan: https://github.com/hjubb/solt

## Updates to MasterApe
As MasterApe is fork of Pancake's MasterChef, we want to be transparent about the updates that have been made: https://www.diffchecker.com/XSrDXXBe

- Migrator Function removed: This function has been used in rug pulls before and as we want to build trust in the community we have decided to remove this. We don't claim to be the first, but we agree with the decision. 
- Farm safety checks. When setting allocations for farms, if a pool is added twice it can cause inconsistencies.
- Helper view functions. View functions can only read data from the contract, but not alter anything which means these can not be used for attacks. 
- Only one admin. A recent project was exploited that used multiple forms of admins to control the project. An admin function that was not timelocked was used to make the exploit. We want the timelock to have full control over the contract so there are no surprises

## Architecture
For a general overview of the architecture check out this diagram: 
![banana-farm-architecture](./images/ApeSwap-Architecture.png)

## Deployed Contracts / Hash

### BSCMAINNET

- BananaToken - https://bscscan.com/token/
- MasterApe - https://bscscan.com/address/
- (Uni|Cake)swapV2Factory - https://bscscan.com/address/
- (Uni|Cake)swapV2Router02 - https://bscscan.com/address/
- UniswapV2Pair init code hash - ``
- MultiCall - 
