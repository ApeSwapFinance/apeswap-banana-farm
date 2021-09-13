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
    {
      name: "GNANA -> BHC Reward Pool",
      stakeToken: '0xdDb3Bd8645775F59496c821E4F55A7eA6A6dc299', // GNANA
      rewardToken: '0x6fd7c98458a943f469E1Cf4eA85B173f5Cd342F4', // BHC
      rewardPerBlock: '2474537037000000', // 0.002474537037 / Block (18 decimals)
      startBlock: '9807952', // x_date x_time UTC
      bonusEndBlock: '10671952' // 30 Days / 864000 Blocks
    },
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