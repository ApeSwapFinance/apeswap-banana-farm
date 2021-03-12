const BEP20RewardApeV2 = artifacts.require("BEP20RewardApeV2");

const BLOCKS_PER_HOUR = (3600 / 3) // 3sec Block Time
const BLOCKS_PER_DAY = 24 * BLOCKS_PER_HOUR
const STARTING_BLOCK = 5602450;
 
const logTx = (tx) => {
    console.dir(tx, {depth: 3});
}

// let block = await web3.eth.getBlock("latest")
module.exports = async function(deployer, network, accounts) {

    await deployer.deploy(
        BEP20RewardApeV2, 
        '0xa48271fF51900007D3b21Cecf30FDc8CCb63fEe6', // IBEP20 _stakeToken
        '0x67d012F731c23F0313CEA1186d0121779c77fcFE', // IBEP20 _rewardToken
        '39600000000', // uint256 _rewardPerBlock (decimals matching _rewardToken)
        STARTING_BLOCK, // uint256 _startBlock
        STARTING_BLOCK + (BLOCKS_PER_DAY * 7) // _bonusEndBlock
    )

};