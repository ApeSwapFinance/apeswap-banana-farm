[![GuardRails badge](https://api.guardrails.io/v2/badges/ApeSwapFinance/apeswap-banana-farm.svg?token=925e54e713b3ce19c5b66a91abef5ba2de561a804e3339502501d8224e56646b&provider=github)](https://dashboard.guardrails.io/gh/ApeSwapFinance/66547)

# Banana Farming 🍌

This repo is home to the Farming contracts for ApeSwap. Liquidity pools are initialized and added as a staking token to the MasterApe contract. This MasterApe contract is also in control of the number of minted $BANANA per block. As users stake LP and other tokens, the MasterApe distributes them according to the weight of rewards of a specific pool along with an accounts stake in that pool.

https://apeswap.finance. 

## Solidity Standard Input
With the help of solt we can easily verify our contracts on Etherscan: https://github.com/hjubb/solt

## Updates to MasterApe
As MasterApe is fork of Pancake's MasterChef, we want to be transparent about the updates that have been made: https://www.diffchecker.com/XSrDXXBe

- Migrator Function removed: This function has been used in rug pulls before and as we want to build trust in the community we have decided to remove this. We don't claim to be the first, but we agree with the decision. 
- Farm safety checks. When setting allocations for farms, if a pool is added twice it can cause inconsistencies.
- Helper view functions. View functions can only read data from the contract, but not alter anything which means these can not be used for attacks. 
- Only one admin. A recent project was exploited that used multiple forms of admins to control the project. An admin function that was not timelocked was used to make the exploit. We want the timelock to have full control over the contract so there are no surprises

## Updates BNBRewardApe 
BNBRewardApe contract is a spin off of Pankcake's SmartChef contract, but will provide a means to distribute BNB for staking tokens in place of a BEP20 token. The updates may be found here: https://www.diffchecker.com/BWzELIHw

## BEP20RewardApe
BEP20RewardApe contract is similar to the BNBRewardApe contract, but it gives out a BEP20 token as the reward in place of BNB. Find the updates from the BNBRewardApe here: https://www.diffchecker.com/IYZFKbNf

## BEP20RewardApeV2
BEP20RewardApeV2 adds two admin functions which allow the pool rewards to be updated allowing the pool to be extended for a longer period of time. https://www.diffchecker.com/h96HRT2L

### BSCMAINNET

DEX Contracts
- **ApeFactory**: [0x0841BD0B734E4F5853f0dD8d7Ea041c241fb0Da6](https://bscscan.com/address/0x0841BD0B734E4F5853f0dD8d7Ea041c241fb0Da6)
    The ApeFactory is the primary DEX contract which is used to create and track all pairs created on the ApeSwap protocol. When a new pair needs to be created, this contract deploys a completely new pair contract specifically for these tokens and notes the address for future lookup.
- **ApeRouter**: [0xcF0feBd3f17CEf5b47b0cD257aCf6025c5BFf3b7](https://bscscan.com/address/0xcF0feBd3f17CEf5b47b0cD257aCf6025c5BFf3b7) 
    The ApeRouter is an external, non-value holding, contract which manages different sets of interactions with the ApeFactory related to adding/removing liquidity and swapping tokens. Because this contract holds no value it can be upgraded without needing to redeploy the ApeFactory. 

#### Farm Contracts
- **BananaToken**: [0x603c7f932ED1fc6575303D8Fb018fDCBb0f39a95](https://bscscan.com/token/0x603c7f932ED1fc6575303D8Fb018fDCBb0f39a95) 
    BananaToken represents the native token of the ApeSwap protocol. This token is distributed to farmers who stake tokens which are recognized by ApeSwap's farm. 
- **MasterApe**: [0x5c8D727b265DBAfaba67E050f2f739cAeEB4A6F9](https://bscscan.com/address/0x5c8D727b265DBAfaba67E050f2f739cAeEB4A6F9)
    The MasterApe contract represents the main farm contract which is in charge of distributing BANANA to farmers staking on the ApeSwap protocol. 
- **Timelock**: [0x2F07969090a2E9247C761747EA2358E5bB033460](https://bscscan.com/address/0x2F07969090a2E9247C761747EA2358E5bB033460)
    The Timelock acts as the owner of the MasterApe to limit how fast owner functions can be called on the protocol. A transaction must first be queued in this contract which emits an event that users can evaluate. After a set delay, this tx can be executed which updates a setting on the MasterApe. The Timelock is primarily used to manage the farm by adding new staking tokens and updating their reward weight. 
- **MultiCall**: [0x38ce767d81de3940CFa5020B55af1A400ED4F657](https://bscscan.com/address/0x38ce767d81de3940CFa5020B55af1A400ED4F657)
    The MultiCall contract is a non-value holding contract which is used by the front-end to batch calls to contracts. 

#### Deprecated Contracts
- **BananaSplitBar**: [0x86Ef5e73EDB2Fea111909Fe35aFcC564572AcC06](https://bscscan.com/address/0x86Ef5e73EDB2Fea111909Fe35aFcC564572AcC06)
     The BananaSplitBar is a token contract for the BananaSplit token. The BananaSplit token is deprecated because there is a known vulnerability in the MasterApe contract that allows unlimited BananaSplit tokens to be generated. As such, the BananaSplit token is not acknowledged on the ApeSwap protocol. 

- **SupportApe**: [0x54aff400858Dcac39797a81894D9920f16972D1D](https://bscscan.com/address/0x54aff400858Dcac39797a81894D9920f16972D1D)
    The SupportApe contract is meant to be used as a staking contract for BananaSplit tokens. As BananaSplit tokens are not used on the ApeSwap protocol, this contract has been deprecated. 

