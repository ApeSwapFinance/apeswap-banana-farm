import { writeJSONToFile, readCSVFile } from './helpers/files'

const FARM_DATA_FILE = __dirname + '/inputs/TIMELOCK-Table.csv';

interface FarmData {
    PID: string;
    LP: string;
    MULT: string;
    'NEW MULT': string;
    DIFF: string;
};

interface FarmSet {
    pid: number;
    allocation: number
}

interface FarmAdd {
    address: string;
    allocation: number
}

const processFarms = async () => {
    const headers = ['PID', 'LP', 'MULT', 'NEW MULT', 'DIFF'];

    const farmSetData = await readCSVFile<FarmData[]>(FARM_DATA_FILE, headers);
    if(!farmSetData) {
        throw new Error('No returned data reading csv');
    }

    let farmSetBatches: FarmSet[][] = [];
    let farmSetInput: FarmSet[] = [];
    const MAX_PER_BATCH = 30;
    for (let index = 0; index < farmSetData.length; index++) {
        const farmSet = farmSetData[index];

        if((farmSet as any)[headers[0]] as string == headers[0]) {
            // Skip the headers element
            console.log(`Skipping header.`)
            continue;
        }

        farmSetInput.push({
            pid: Number(farmSet.PID),
            allocation: Math.round(Number(farmSet['NEW MULT']) * 100),
        })

        if(index % MAX_PER_BATCH == 0 || index >= farmSetData.length - 1) {
            farmSetBatches.push(farmSetInput);
            farmSetInput = [];
        }
    }

    await writeJSONToFile('./scripts/farm-set-output.json', farmSetBatches);
}

processFarms().then(() => {
    console.log('Done encoding!');
})
