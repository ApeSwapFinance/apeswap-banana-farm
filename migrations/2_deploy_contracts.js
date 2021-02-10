const { BigNumber } = require("@ethersproject/bignumber");
const MasterApe = artifacts.require("MasterApe");
const SupportApe = artifacts.require("SupportApe");
const BananaToken = artifacts.require("BananaToken");
const BananaSplitBar = artifacts.require("BananaSplitBar");
const Timelock = artifacts.require("Timelock");
const BnbStaking = artifacts.require("BnbStaking");
// TODO: Import UniswapInterface and create liquidity pool from the start


// TODO: Use web3 to obtain current block
// https://bscscan.com/
const CURRENT_BLOCK = 4748684
const INITIAL_MINT = '100';
// 3sec Block Time
const BLOCKS_PER_DAY = 24 * (3600 / 3)
 
const logTx = (tx) => {
    console.dir(tx, {depth: 3});
}
// let specificInstance = await MetaCoin.at("0x1234...");


module.exports = async function(deployer, network, accounts) {
    let currentAccount = accounts[0];
    if(network=='testnet') {
        currentAccount = accounts[1];
    }

    let bananaTokenInstance;
    let bananaSplitBarInstance;
    let masterApeInstance;

    /**
     * Deploy BananaToken
     */
    deployer.deploy(BananaToken).then((instance) => {
        bananaTokenInstance = instance;
        /**
         * Mint intial tokens for liquidity pool
         */
        return bananaTokenInstance.mint(BigNumber.from(INITIAL_MINT).mul(BigNumber.from(String(10**18))));
    }).then((tx)=> {
        logTx(tx);
        return deployer.deploy(BananaSplitBar, BananaToken.address)
    }).then((instance)=> {
        bananaSplitBarInstance = instance;
        /**
         * Deploy MasterApe
         */
        if(network == "bsc") {
            console.log(`Deploying MasterApe with BSC MAINNET settings.`)
            return deployer.deploy(MasterApe, 
                BananaToken.address,                        // _banana
                BananaSplitBar.address,                     // _bananaSplit
                currentAccount,                             // _devaddr
                10,                                         // _bananaPerBlock
                CURRENT_BLOCK + (BLOCKS_PER_DAY),           // _startBlock
                4,                                          // _multiplier
                CURRENT_BLOCK + (BLOCKS_PER_DAY * 365),     // _bonusEndBlock
            )
        }
        console.log(`Deploying MasterApe with DEV/TEST settings`)
        return deployer.deploy(MasterApe, 
            BananaToken.address, 
            BananaSplitBar.address, 
            currentAccount,
            10, 
            0, 
            4, 
            '99999999999999999',
        )
        
    }).then((instance)=> {
        masterApeInstance = instance;
        /**
         * TransferOwnership of BANANA to MasterApe
         */
        return bananaTokenInstance.transferOwnership(MasterApe.address);
    }).then((tx)=> {
        logTx(tx);
        /**
         * TransferOwnership of BANANASPLIT to MasterApe
         */
        return bananaSplitBarInstance.transferOwnership(MasterApe.address);
    }).then((tx)=> {
        logTx(tx);
        /**
         * Deploy SupportApe
         */
        if(network == "bsc") {
            console.log(`Deploying SupportApe with BSC MAINNET settings.`)
            return deployer.deploy(SupportApe, 
                BananaSplitBar.address,                  //_bananaSplit
                10,                                      // _rewardPerBlock
                CURRENT_BLOCK + (BLOCKS_PER_DAY),        // _startBlock
                CURRENT_BLOCK + (BLOCKS_PER_DAY * 365),  // _endBlock
            )
        }
        console.log(`Deploying MasterApe with DEV/TEST settings`)
        return deployer.deploy(SupportApe, 
            BananaSplitBar.address,                  //_bananaSplit
            10,                                      // _rewardPerBlock
            0,                                       // _startBlock
            '99999999999999999',                      // _endBlock
        )
    }).then(()=> {
        // TODO:
        // constructor(
        //     IBEP20 _lp,
        //     IBEP20 _rewardToken,
        //     uint256 _rewardPerBlock,
        //     uint256 _startBlock,
        //     uint256 _bonusEndBlock,
        //     address _adminAddress,
        //     address _wbnb
        // ) 
        // return deployer.deploy(BnbStaking, BananaToken.address)
    }).then(()=> {
        console.table({
            MasterApe:MasterApe.address,
            SupportApe:SupportApe.address,
            BananaToken:BananaToken.address,
            BananaSplitBar:BananaSplitBar.address,
            // BnbStaking:BnbStaking.address,
            // Timelock:Timelock.address
        })
    });
};
