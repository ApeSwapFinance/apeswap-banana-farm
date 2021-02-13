const { BigNumber } = require("@ethersproject/bignumber");
const MasterApe = artifacts.require("MasterApe");
const SupportApe = artifacts.require("SupportApe");
const BananaToken = artifacts.require("BananaToken");
const BananaSplitBar = artifacts.require("BananaSplitBar");
const MultiCall = artifacts.require("MultiCall");
const Timelock = artifacts.require("Timelock");
const ApeSwapBurn = artifacts.require("ApeSwapBurn");
const BnbStaking = artifacts.require("BnbStaking");

const INITIAL_MINT = '25000';
const BLOCKS_PER_HOUR = (3600 / 3) // 3sec Block Time
const TOKENS_PER_BLOCK = '10';
const BLOCKS_PER_DAY = 24 * BLOCKS_PER_HOUR
const TIMELOCK_DELAY_SECS = (3600 * 24); 
const STARTING_BLOCK = 4853714;
const REWARDS_START = String(STARTING_BLOCK + (BLOCKS_PER_HOUR * 6))
const FARM_FEE_ACCOUNT = '0xCEf34e4db130c8A64493517985b23af5B13E8cc6'
 
const logTx = (tx) => {
    console.dir(tx, {depth: 3});
}

// let block = await web3.eth.getBlock("latest")
module.exports = async function(deployer, network, accounts) {
    console.log({network});

    let currentAccount = accounts[0];
    let feeAccount = FARM_FEE_ACCOUNT;
    if (network == 'testnet') {
        console.log(`WARNING: Updating current account for testnet`)
        currentAccount = accounts[1];
    }

    if (network == 'development' || network == 'testnet') {
        console.log(`WARNING: Updating feeAcount for testnet/development`)
        feeAccount = accounts[3];
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
        /**
         * Deploy BananaSplitBar
         */
        return deployer.deploy(BananaSplitBar, BananaToken.address)
    }).then((instance)=> {
        bananaSplitBarInstance = instance;
        /**
         * Deploy MasterApe
         */
        if(network == "bsc" || network == "bsc-fork") {
            console.log(`Deploying MasterApe with BSC MAINNET settings.`)
            return deployer.deploy(MasterApe, 
                BananaToken.address,                                         // _banana
                BananaSplitBar.address,                                      // _bananaSplit
                feeAccount,                                                   // _devaddr
                BigNumber.from(TOKENS_PER_BLOCK).mul(BigNumber.from(String(10**18))),  // _bananaPerBlock
                REWARDS_START,                                                // _startBlock
                4                                                            // _multiplier
            )
        }
        console.log(`Deploying MasterApe with DEV/TEST settings`)
        return deployer.deploy(MasterApe, 
            BananaToken.address, 
            BananaSplitBar.address, 
            feeAccount,
            BigNumber.from(TOKENS_PER_BLOCK).mul(BigNumber.from(String(10**18))), 
            0, 
            4
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
        if(network == "bsc" || network == "bsc-fork") {
            console.log(`Deploying SupportApe with BSC MAINNET settings.`)
            return deployer.deploy(SupportApe, 
                BananaSplitBar.address,                  //_bananaSplit
                BigNumber.from(TOKENS_PER_BLOCK).mul(BigNumber.from(String(10**18))),                                      // _rewardPerBlock
                REWARDS_START,                            // _startBlock
                STARTING_BLOCK + (BLOCKS_PER_DAY * 365),  // _endBlock
            )
        }
        console.log(`Deploying SupportApe with DEV/TEST settings`)
        return deployer.deploy(SupportApe, 
            BananaSplitBar.address,                  //_bananaSplit
            BigNumber.from(TOKENS_PER_BLOCK).mul(BigNumber.from(String(10**18))),                                      // _rewardPerBlock
            STARTING_BLOCK + (BLOCKS_PER_HOUR * 6),   // _startBlock
            '99999999999999999',                      // _endBlock
        )
    }).then(()=> {
        /**
         * Deploy BnbStakingContract
         */
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
        if(network == "bsc" || network == "bsc-fork") {

        }

        // return deployer.deploy(BnbStaking, BananaToken.address)
    }).then(()=> {
        /**
         * Deploy MultiCall
         */
        return deployer.deploy(MultiCall);
    }).then(()=> {
        /**
         * Deploy Timelock
         */
        return deployer.deploy(Timelock, currentAccount, TIMELOCK_DELAY_SECS);
    }).then(()=> {
        /**
         * Deploy ApeSwapBurn
         */
        return deployer.deploy(ApeSwapBurn);
    }).then(()=> {
        console.log('Rewards Start at block: ', REWARDS_START)
        console.table({
            MasterApe:MasterApe.address,
            SupportApe:SupportApe.address,
            BananaToken:BananaToken.address,
            BananaSplitBar:BananaSplitBar.address,
            MultiCall:MultiCall.address,
            Timelock:Timelock.address,
            ApeSwapBurn:ApeSwapBurn.address
            // BnbStaking:BnbStaking.address,
        })
    });
};
