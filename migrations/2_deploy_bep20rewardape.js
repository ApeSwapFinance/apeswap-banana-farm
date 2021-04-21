const BEP20RewardApeV2 = artifacts.require("BEP20RewardApeV2");


const deployConfigs = [
    // {
    //   name: " Reward Pool",
    //   stakeToken: '', // token
    //   rewardToken: '', // num token
    //   rewardPerBlock: '', // x_token / Block (x decimals) x Blocks total
    //   startBlock: '', // x_date x_time UTC
    //   bonusEndBlock: '' // x Months
    // },
  ]
  
// let block = await web3.eth.getBlock("latest")
module.exports = async function(deployer, network, accounts) {
    // mainnet
    const adminAddress = '0x6c905b4108A87499CEd1E0498721F2B831c6Ab13';

    const BLOCKS_PER_DAY = 28800;
    const BLOCK_DURATION = BLOCKS_PER_DAY * 7

    let deployLogs = [];

    for (const deployConfig of deployConfigs) {
        const { name, stakeToken, rewardToken, rewardPerBlock, startBlock, bonusEndBlock } = deployConfig;
    
        console.log("Deploying BEP20RewardApe with config:");
        console.dir(deployConfig);
    
        await deployer.deploy(BEP20RewardApeV2, stakeToken, rewardToken, rewardPerBlock, startBlock, bonusEndBlock);
        const bep20RewardApe = await BEP20RewardApeV2.deployed();
        await bep20RewardApe.transferOwnership(adminAddress);

        deployLogs.push({
            name,
            address: BEP20RewardApeV2.address,
            stakeToken,
            rewardToken,
            rewardPerBlock,
            startBlock,
            bonusEndBlock
        });
      }

    console.log(JSON.stringify(deployLogs));
};