const { BigNumber } = require("@ethersproject/bignumber");
const { getNetworkConfig } = require('../deploy-config')
const MasterApe = artifacts.require("MasterApe");
const SupportApe = artifacts.require("SupportApe");
const BananaToken = artifacts.require("BananaToken");
const BananaSplitBar = artifacts.require("BananaSplitBar");
const MultiCall = artifacts.require("MultiCall");
const Timelock = artifacts.require("Timelock");

const logTx = (tx) => {
    console.dir(tx, { depth: 3 });
}

// let block = await web3.eth.getBlock("latest")
module.exports = async function (deployer, network, accounts) {
    const { adminAddress, feeAccount, STARTING_BLOCK, TOKENS_PER_BLOCK, TIMELOCK_DELAY_SECS, INITIAL_MINT } = getNetworkConfig(network, accounts);
    const BLOCKS_PER_HOUR = (3600 / 3) // 3sec Block Time
    const REWARDS_START = String(STARTING_BLOCK + (BLOCKS_PER_HOUR * 6))


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
        return bananaTokenInstance.mint(BigNumber.from(INITIAL_MINT).mul(BigNumber.from(String(10 ** 18))));
    }).then((tx) => {
        logTx(tx);
        /**
         * Deploy BananaSplitBar
         */
        return deployer.deploy(BananaSplitBar, BananaToken.address)
    }).then((instance) => {
        bananaSplitBarInstance = instance;
        /**
         * Deploy MasterApe
         */
        return deployer.deploy(MasterApe,
            BananaToken.address,                                         // _banana
            BananaSplitBar.address,                                      // _bananaSplit
            feeAccount,                                                   // _devaddr
            BigNumber.from(TOKENS_PER_BLOCK).mul(BigNumber.from(String(10 ** 18))),  // _bananaPerBlock
            REWARDS_START,                                                // _startBlock
            4                                                            // _multiplier
        )
    }).then((instance) => {
        masterApeInstance = instance;
        /**
         * TransferOwnership of BANANA to MasterApe
         */
        return bananaTokenInstance.transferOwnership(MasterApe.address);
    }).then((tx) => {
        logTx(tx);
        /**
         * TransferOwnership of BANANASPLIT to MasterApe
         */
        return bananaSplitBarInstance.transferOwnership(MasterApe.address);
    }).then((tx) => {
        logTx(tx);
        /**
         * Deploy SupportApe
         */
        return deployer.deploy(SupportApe,
            BananaSplitBar.address,                  //_bananaSplit
            BigNumber.from(TOKENS_PER_BLOCK).mul(BigNumber.from(String(10 ** 18))),                                      // _rewardPerBlock
            REWARDS_START,                            // _startBlock
            STARTING_BLOCK + (BLOCKS_PER_HOUR * 24 * 365),  // _endBlock
        )
    }).then(() => {
        /**
         * Deploy MultiCall
         */
        return deployer.deploy(MultiCall);
    }).then(() => {
        /**
         * Deploy Timelock
         */
        return deployer.deploy(Timelock, adminAddress, TIMELOCK_DELAY_SECS);
    }).then(() => {
        console.log('Rewards Start at block: ', REWARDS_START)
        console.table({
            MasterApe: MasterApe.address,
            SupportApe: SupportApe.address,
            BananaToken: BananaToken.address,
            BananaSplitBar: BananaSplitBar.address,
            MultiCall: MultiCall.address,
            Timelock: Timelock.address
        })
    });
};
