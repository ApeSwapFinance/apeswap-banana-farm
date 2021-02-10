const { BigNumber } = require("@ethersproject/bignumber");
const MasterApe = artifacts.require("MasterApe");
const SupportApe = artifacts.require("SupportApe");
const BananaToken = artifacts.require("BananaToken");
const BananaSplitBar = artifacts.require("BananaSplitBar");
const Timelock = artifacts.require("Timelock");
const BnbStaking = artifacts.require("BnbStaking");
// TODO: Import UniswapInterface and create liquidity pool from the start
 
const logTx = (tx) => {
    console.dir(tx, {depth: 3});
}

const INITIAL_MINT = '10000';

module.exports = async function(deployer, network, accounts) {
    let currentAccount = accounts[0];
    if(network=='testnet') {
        currentAccount = accounts[1];
    }

    let bananaTokenInstance;
    let bananaSplitBarInstance;
    let masterApeInstance;

    // No constructor
    deployer.deploy(BananaToken).then((instance) => {
        bananaTokenInstance = instance;
        return bananaTokenInstance.mint(BigNumber.from(INITIAL_MINT).mul(BigNumber.from(String(10**18))));
    }).then((tx)=> {
        logTx(tx);
        return deployer.deploy(BananaSplitBar, BananaToken.address)
    }).then((instance)=> {
        bananaSplitBarInstance = instance;
        // constructor(
        //     BananaToken _banana,
        //     BananaSplitBar _bananaSplit,
        //     address _devaddr,
        //     uint256 _bananaPerBlock,
        //     uint256 _startBlock,
        //     uint256 _multiplier,
        //     uint256 _bonusEndBlock
        // )
        return deployer.deploy(MasterApe, 
            BananaToken.address, 
            BananaSplitBar.address, 
            currentAccount,
            4, 
            1, 
            4, 
            // TODO Set endblock:
            999999999999999,
            
        )
    }).then((instance)=> {
        masterApeInstance = instance;
        return bananaTokenInstance.transferOwnership(MasterApe.address);
    }).then((tx)=> {
        logTx(tx);
        return bananaSplitBarInstance.transferOwnership(MasterApe.address);
    }).then((tx)=> {
        logTx(tx);
        // TODO:
        // constructor(
        //     IBEP20 _bananaSplit,
        //     uint256 _rewardPerBlock,
        //     uint256 _startBlock,
        //     uint256 _endBlock
        // ) public {
        return deployer.deploy(SupportApe, 
            BananaSplitBar.address,
            4,
            0,
            // TODO Set endblock:
            999999999999999,
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
