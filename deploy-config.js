
function getNetworkConfig(network, accounts) {
    if(["bsc", "bsc-fork"].includes(network)) {
        console.log(`Deploying with BSC MAINNET config.`)
        return {
            adminAddress: '0x6c905b4108A87499CEd1E0498721F2B831c6Ab13', // General Admin
            feeAccount: '0xCEf34e4db130c8A64493517985b23af5B13E8cc6', // Proxy Admin
            STARTING_BLOCK: 4853714,
            TOKENS_PER_BLOCK: 10,
            TIMELOCK_DELAY_SECS: 3600 * 6,
            INITIAL_MINT: '25000',
        }
    } else if (['bsc-testnet', 'bsc-testnet-fork'].includes(network)) {
        console.log(`Deploying with BSC testnet config.`)
        return {
            adminAddress: '0xE375D169F8f7bC18a544a6e5e546e63AD7511581', // General Admin
            feeAccount: '0xE375D169F8f7bC18a544a6e5e546e63AD7511581', // Proxy Admin
            STARTING_BLOCK: 12338486,
            TOKENS_PER_BLOCK: 10,
            TIMELOCK_DELAY_SECS: 3600 * 6,
            INITIAL_MINT: '25000',
        }
    } else if (['development'].includes(network)) {
        console.log(`Deploying with development config.`)
        return {
            adminAddress: '0x6c905b4108A87499CEd1E0498721F2B831c6Ab13', // General Admin
            feeAccount: '0xCEf34e4db130c8A64493517985b23af5B13E8cc6', // Proxy Admin
            STARTING_BLOCK: 0,
            TOKENS_PER_BLOCK: 10,
            TIMELOCK_DELAY_SECS: 3600 * 6,
            INITIAL_MINT: '25000',
        }
    } else {
        throw new Error(`No config found for network ${network}.`)
    }
}

module.exports = { getNetworkConfig };
