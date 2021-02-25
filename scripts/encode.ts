import { Contract } from '@ethersproject/contracts'

// Encode Timelock Transactions
import MasterApe from '../build/contracts/MasterApe.json'
import Timelock from '../build/contracts/Timelock.json'

const currentTimestamp = Math.floor(Date.now() / 1000);
const OFFSET = 100;
/*
 * Set unix ETA of tx (secs) based on currentTimestamp or an absolute value
 * https://www.unixtimestamp.com/
 */ 
// const ETA = currentTimestamp + OFFSET;
const ETA = 1614207600

/*
 * TESTNET or MAINNET? 
 */ 
// TESTNET
// const MASTER_APE_ADDRESS = '0xbbC5e1cD3BA8ED639b00927115e5f0e0040aA613';
// const TIMELOCK_ADDRESS = '0xA350F1e2e7ca4d1f5032a8C73f8543Db031A6D51';
// MAINNET 
const MASTER_APE_ADDRESS = '0x5c8D727b265DBAfaba67E050f2f739cAeEB4A6F9';
const TIMELOCK_ADDRESS = '0x2F07969090a2E9247C761747EA2358E5bB033460';

const masterApeContract = new Contract(MASTER_APE_ADDRESS, MasterApe.abi);
const timelockContract = new Contract(TIMELOCK_ADDRESS, Timelock.abi);

const encode = async () => {
   /*
    * General use MasterApe functions
    */ 
    // updateMultiplier(uint256 multiplierNumber)
    // const masterApeTXEncoded = await masterApeContract.populateTransaction.updateMultiplier(1)
    // set(uint256 _pid, uint256 _allocPoint, bool _withUpdate)
    // const masterApeTXEncoded = await masterApeContract.populateTransaction.set(1, 3555, false)
    // add(uint256 _allocPoint, IBEP20 _lpToken, bool _withUpdate)
    const masterApeTXEncoded = await masterApeContract.populateTransaction.add(800, "0x51bB531A5253837A23cE8de478a4941A71A4202C", false)

    // queueTransaction(address target, uint value, string memory signature, bytes memory data, uint eta)
    const timelockQueueEncoded = await timelockContract.populateTransaction
        .queueTransaction(
            MASTER_APE_ADDRESS, 
            0, 
            '', 
            masterApeTXEncoded.data, 
            ETA
        )

    // executeTransaction(address target, uint value, string memory signature, bytes memory data, uint eta) public payable returns (bytes memory)
    const timelockExecuteEncoded = await timelockContract.populateTransaction
        .executeTransaction(
            MASTER_APE_ADDRESS, 
            0, 
            '', 
            masterApeTXEncoded.data, 
            ETA
        )

    // cancelTransaction(address target, uint value, string memory signature, bytes memory data, uint eta)
    const timelockCancelEncoded = await timelockContract.populateTransaction
        .cancelTransaction(
            MASTER_APE_ADDRESS, 
            0, 
            '', 
            masterApeTXEncoded.data, 
            ETA
        )

    const output = {
        'ETA-Timestamp': ETA, 
        'Date': new Date(ETA * 1000),
        MASTER_APE_ADDRESS,
        masterApeTXEncoded,
        timelockQueueEncoded, 
        timelockExecuteEncoded, 
        timelockCancelEncoded 
    }
    console.log(output);
    console.log(JSON.stringify(output));
}

encode().then(()=> {
    console.log('Done encoding!');
})
