import { writeJSONToFile } from './helpers/files'
import { Contract } from '@ethersproject/contracts'

// Encode Timelock Transactions
import Timelock from '../build/contracts/Timelock.json'

// Find timestamp based on a date
// const dateTimestamp = Math.floor(+new Date('March 12, 2021 19:00:00') / 1000)

const DEFAULT_OFFSET = 3600 * 24.5;
const getTimestamp = (offsetSeconds = 0): number => {
    const currentTimestamp = Math.floor(Date.now() / 1000);
    return currentTimestamp + offsetSeconds;
}

/*
 * TESTNET or MAINNET? 
 */
const TIMELOCK_ADDRESS = '0x2F07969090a2E9247C761747EA2358E5bB033460';

const timelockContract = new Contract(TIMELOCK_ADDRESS, Timelock.abi);

const encode = async () => {
    /**
     * Update timelock delay 
     * function setDelay(uint delay_) public
     */
    const ETA = getTimestamp(DEFAULT_OFFSET);
    const method = 'setDelay';
    const timelockContractTXEncodeFunction = timelockContract.populateTransaction[method];
    const timelockContractArgsArray = [
        [21600], // 6 hours
    ]

    let outputs = [];

    for (const timelockArgs of timelockContractArgsArray) {
        /**
     * Encode child tx
     */
        const encodedTx = await timelockContractTXEncodeFunction(...timelockArgs);

        // TODO: Update encode to use signature
        // queueTransaction(address target, uint value, string memory signature, bytes memory data, uint eta)
        const timelockQueueEncoded = await timelockContract.populateTransaction
            .queueTransaction(
                TIMELOCK_ADDRESS,
                0,
                '',
                encodedTx.data,
                ETA
            )

        // executeTransaction(address target, uint value, string memory signature, bytes memory data, uint eta) public payable returns (bytes memory)
        const timelockExecuteEncoded = await timelockContract.populateTransaction
            .executeTransaction(
                TIMELOCK_ADDRESS,
                0,
                '',
                encodedTx.data,
                ETA
            )

        // cancelTransaction(address target, uint value, string memory signature, bytes memory data, uint eta)
        const timelockCancelEncoded = await timelockContract.populateTransaction
            .cancelTransaction(
                TIMELOCK_ADDRESS,
                0,
                '',
                encodedTx.data,
                ETA
            )

        const output = {
            'ETA-Timestamp': ETA,
            'Date': new Date(ETA * 1000),
            queueTx: "",
            executeTx: "",
            cancelTx: "",
            masterApeTXEncodeFunction: method,
            masterApeArgs: timelockArgs,
            masterApeTXEncoded: encodedTx,
            timelockQueueEncoded,
            timelockExecuteEncoded,
            timelockCancelEncoded
        }

        outputs.push(output);
    }



    console.dir(outputs);
    await writeJSONToFile('./scripts/encode-output.json', outputs);
}

encode().then(() => {
    console.log('Done encoding!');
})
