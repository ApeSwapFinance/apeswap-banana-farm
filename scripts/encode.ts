import { Contract } from '@ethersproject/contracts'

// Encode Timelock Transactions
import MasterApe from '../build/contracts/MasterApe.json'
import Timelock from '../build/contracts/Timelock.json'

// https://www.unixtimestamp.com/
const currentTimestamp = Math.floor(Date.now() / 1000);
const OFFSET = 100;
// const ETA = currentTimestamp + OFFSET;
const ETA = 1613786400

// TESTNET
// const MASTER_APE_ADDRESS = '0xbbC5e1cD3BA8ED639b00927115e5f0e0040aA613';
// const TIMELOCK_ADDRESS = '0xA350F1e2e7ca4d1f5032a8C73f8543Db031A6D51';
// MAINNET 
const MASTER_APE_ADDRESS = '0x5c8D727b265DBAfaba67E050f2f739cAeEB4A6F9';
const TIMELOCK_ADDRESS = '0x2F07969090a2E9247C761747EA2358E5bB033460';

const masterApeContract = new Contract(MASTER_APE_ADDRESS, MasterApe.abi);
const timelockContract = new Contract(TIMELOCK_ADDRESS, Timelock.abi);

const encode = async () => {
    // updateMultiplier(uint256 multiplierNumber)
    const masterApeTXEncoded = await masterApeContract.populateTransaction.updateMultiplier(1)
    // set(uint256 _pid, uint256 _allocPoint, bool _withUpdate)
    // const masterApeTXEncoded = await masterApeContract.populateTransaction.set(1, 3555, false)

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

    console.log({
        'ETA-Timestamp': ETA, 
        'Date': new Date(ETA * 1000),
        MASTER_APE_ADDRESS,
        masterApeTXEncoded,
        timelockQueueEncoded, 
        timelockExecuteEncoded, 
        timelockCancelEncoded 
    })
}

encode().then(()=> {
    console.log('Done encoding!');
})
