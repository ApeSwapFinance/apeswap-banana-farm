# Send Timelock TX
Timelock transactions are sent as encoded data to the timelock contract. This data first encodes the tx data that the timelock needs to send, then it wraps this data in a newly encoded tx for the timelock.  

The timelock has three main functions for interacting with timelocked txs:  
1. `queueTransaction` - Queue a transaction that can be sent no earlier than the current timestamp plus the timelock delay
2. `executeTransaction` - Execute a timelocked tx after the delay set in `queueTransaction`
3. `cancelTransaction` - Cancel a queued transaction to prevent it from being executed

## Configure Metamask
*Metamask is not required, but you will need a Binance Smart Chain compatible wallet that allows you to send custom data along with the tx.*  

Install from: https://metamask.io/  

### Setup BSC on Metamask
Because Metamask doesn't natively support Binance Smart Chain, follow the guide to add it as a custom network if you don't already have it.  

https://academy.binance.com/en/articles/connecting-metamask-to-binance-smart-chain  


### Metamask Advanced Settings
One you have a Metamask wallet setup, click the colorful circle at the top right and open the settings page. Go to the Advanced tab and enable "Advanced gas controls" as well as "Show Hex Data".  
  
This will let you add in the encoded data needed for the tx as well as adjust your gas settings.  

## Encode TX
Configure `scripts/encode.ts` as needed and run the script with `yarn encode`  

The `encode-output.json` will hold the important data for the tx.  

This section of the output shows the details needed for each of the timelock txs. 
```json
    "timelockQueueEncoded": {
        "data": "0x...",
        "to": "0x2F07969090a2E9247C761747EA2358E5bB033460"
    },
    "timelockExecuteEncoded": {
        "data": "0x...",
        "to": "0x2F07969090a2E9247C761747EA2358E5bB033460"
    },
    "timelockCancelEncoded": {
        "data": "0x...",
        "to": "0x2F07969090a2E9247C761747EA2358E5bB033460"
    }
```

## Send TX
To send a timelock tx, open up Metamask and click "Send". Paste in the "to" address of the output (this should be the timelock contract). After this you are able to paste in the "data" of the output into the "Hex Data" field on Metamask. Sometimes the txs fail due to being out of gas as it's hard to estimate the cost so generally it's a good idea to add about 20,000 gas to each tx.  