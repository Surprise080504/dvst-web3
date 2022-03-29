/** 
 * bitcoin logic module
 * 
 */
import CoinInterface from "../CoinInterface";
import axios from 'axios';
import * as bitcoin from 'bitcoinjs-lib';

const NETWORKS_LIST = ['mainnet', 'testnet'];
const DEFAULT_NETWORK = 'testnet';
const SATOSHI_MULTIPLYER = 100000000.0;

type BitCoinLogicConfig = {
    network: string | undefined
};

/**
 * BitCoinLogic to handle the balance request and funds transfer to bitcoin network
 * @class BitCoinLogic
 * {@link CoinInterface} 
 * 
 */
export default class BitCoinLogic extends CoinInterface {
    private network: string = DEFAULT_NETWORK;
    /**
     * Constructor of BitCoinLogic class
     * @param config network and other configuration
     */
    constructor(config: BitCoinLogicConfig) {
        super();
        this.setConfig(config);
    }
    /**
     * Set configuration for the bitcoin logic class
     * @param config 
     */
    setConfig(config: BitCoinLogicConfig) {
        this.network = config && config.network ? config.network : DEFAULT_NETWORK;        
    }
    /**
     * Get balance of provided address
     * @param address 
     * @returns amount or error
     */
    async getBalance(address: string): Promise<number|Error> {
        return new Promise(async (resolve, reject) => {
            try{
            let networkPart = this.network ==='testnet' ? 'test3': 'main';
            let url =  `https://api.blockcypher.com/v1/btc/${networkPart}/addrs/${address}/balance`;//`https://blockstream.info/${this.network}/api/address/${address}`;
            let response = await axios.get(url);
            let balance = response.data.final_balance;
                balance = balance/SATOSHI_MULTIPLYER; 
            resolve(balance);
            }
            catch(err) {
                reject(err);
            }
        });
    }
    /**
     * Transfer funds to another bitcoin address
     * @param senderAddress     sender address
     * @param senderPrivateKey  sender's private key
     * @param receiverAddress   receiver's address
     * @param amountSATOSHI     amount to transfer in SATOSHI
     * @returns string response
     */
    async transferFunds(senderAddress: string, senderPrivateKey: string, receiverAddress: string, amountSATOSHI: number): Promise<string> {
        return new Promise(async (resolve, reject) => {
            const baseURL = this.network === 'mainnet' ? 'https://api.blockcypher.com/v1/btc/main/' 
                                                       : 'https://api.blockcypher.com/v1/btc/test3/';
            console.log('bitcoin-lib:', bitcoin);
            const bitcoinNetwork = this.network==='mainnet' ? bitcoin.networks.bitcoin : bitcoin.networks.testnet;
            let balance: number = 0;
            try { 
                let ret = await this.getBalance(senderAddress);
                if(ret instanceof Error)
                    throw ret;
                
                balance = ret;
            }
            catch(e) {
                console.log('getBalance.error:', e);
                reject(e);
            }
            balance *= SATOSHI_MULTIPLYER;

            if(balance < amountSATOSHI) {
                console.log('transferFunds.error: amount < balance');
                return reject('not enough balance');
            }
            // console.log(`sender:${senderAddress}, sendPk:${senderPrivateKey}, rec:${receiverAddress}, amount:${amountSATOSHI}`);
            let amount = amountSATOSHI; // parseFloat(amountSATOSHI);

            try {
                var newtx = {
                    inputs: [{addresses: [senderAddress]}],
                    outputs: [{addresses: [receiverAddress], value: amount}]
                    };
                    
                const url = baseURL + 'txs/new';
                    
                var resp = await axios.post(url, JSON.stringify(newtx));
                var tmptx = resp.data;

                // console.log(tmptx);
                //bitcoin.ECPair.fromWIF('KwDiBf89QgGbjEhKnhXJuH7LrciVrZi3qYjgd9M7rFU73sVHnoWn',);

                var keys = bitcoin.ECPair.fromWIF(senderPrivateKey, bitcoinNetwork); // bitcoin.networks.testnet);
                tmptx.pubkeys = [];

                tmptx.signatures = tmptx.tosign.map(function (tosign: string, n: number) {
                    tmptx.pubkeys.push(keys.publicKey.toString('hex'));
                    return bitcoin.script.signature.encode(
                        keys.sign(Buffer.from(tosign, "hex")),
                        0x01,
                    ).toString("hex").slice(0, -2);
                    });    

                    // sending back the transaction with all the signatures to broadcast
                const sendUrl = baseURL + 'txs/send';
                let sendResp = await axios.post(sendUrl, JSON.stringify(tmptx));
                
                // console.log('finalTx:', sendResp);
                resolve(sendResp.toString());
                }
                catch(e) {
                    reject(e);
                }
                                    
                resolve('result');
                // reject('Not implemented');
            });       
    }
    /**
     * Get networks list for this coin
     * @returns the list of networks supported
     */
    getNetworksList(): Array<{val: string, text: string}> {return NETWORKS_LIST.map(v=>{return {val: v, text: v}});}
    /**
     * Get the currently selected network
     * @returns current netowrk name
     */
    getCurrentNetwork(): string {return this.network}

    /**
     * Get transaction fee
     * @param type 
     * @returns 
     */
    async getFee(type='fastest') {
        const url='https://bitcoinfees.earn.com/api/v1/fees/recommended';
        let result = await axios.get(url);

        let fee = result.data[type+'Fee'];

        console.log('getFee result:', result, fee);

        return fee;
    }
    /**
     * Get custom functions
     * 
     * @returns an object containing custom functions
     */
     getCustomFunctions(): Object {
        return {};
    }

}
