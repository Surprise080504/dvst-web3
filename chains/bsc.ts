/** 
 * BSC logic module
 * 
 */

import CoinInterface from "../CoinInterface";
import Web3 from 'web3';
import axios from 'axios';

/**
 * Get the chain id for network type
 * @param networkType 
 * @returns 
 */
function CHAIN_IDS(networkType: string): number {
    switch(networkType) {
        case 'mainnet':
            return 56;
        case 'testnet':
            return 97;
        default:
            return 56;
    }
}
const NETWORKS_LIST = ['mainnet', 'testnet'];
const DEFAULT_NETWORK = 'mainnet';
/**
 * Make network URL for the provided network
 * @param network 
 * @returns 
 */
function MAKE_NETOWRK_URL(network: string) {
    switch(network) {
        case 'mainnet':
            return 'https://bsc-dataseed.binance.org/';
        case 'testnet':
            return 'https://data-seed-prebsc-1-s1.binance.org:8545';
        default:
            return 'https://bsc-dataseed.binance.org/';
    }
}

/**
 * BSC Logic config interface
 */
interface BSCLogicConfig {
    network: string | undefined,

};
/**
 * BSCLogic to handle the balance request and funds transfer to BSC network
 * @class BSCLogic
 * {@link CoinInterface} 
 * 
 */
export default class BSCLogic extends CoinInterface {
    private network: string = DEFAULT_NETWORK;
    private bscNetwork: string = 'mainnet';
    private chainId: number = 56;
    private chain: string = DEFAULT_NETWORK;
    private web3 = new Web3(new Web3.providers.HttpProvider(this.bscNetwork));
    /**
     * Constructor of BSCLogic class
     * @param config network configuration
     */
    constructor(config: BSCLogicConfig) {
        super();
        this.setConfig(config);
    }
    /**
     * Set configuration for the BSC logic class
     * @param config 
     */
    setConfig(config: BSCLogicConfig) {
        this.network = config && config.network ? config.network : DEFAULT_NETWORK;
        
        this.bscNetwork = MAKE_NETOWRK_URL(this.network); // config.bscNetwork; // 'https://rinkeby.infura.io/v3/622d1a16ce8d4d3986333878c03feab6';
        this.chainId    = CHAIN_IDS(this.network); // config.ethChainId; // 4
        this.chain      = this.network; // config.ethChain; //'rinkeby'
        this.web3 = new Web3(new Web3.providers.HttpProvider(this.bscNetwork));
    }
    /**
     * Get balance of provided address
     * @param address 
     * @returns amount or error
     */
    async getBalance(address: string): Promise<number|Error> {
        return new Promise((resolve, reject) => {
            this.web3.eth.getBalance(address, async (err, result) => {
                if(err) {
                    return reject(err);
                }
                console.log("result: ", result);
                let bstr = this.web3.utils.fromWei(result, "ether");
                let bflt = parseFloat(bstr);
                resolve(bflt);
            });
        });
    }
    /**
     * Transfer funds from one BSC address to others
     * 
     * @param senderAddress     sender's address
     * @param senderPrivateKey  sender's private key
     * @param receiverAddress   receiver's address
     * @param amount            amount in Ehtereum to transfer 
     * @returns                 result in string
     */
    async transferFunds(senderAddress: string, senderPrivateKey: string, receiverAddress: string, amount: number): Promise<string> {
        return new Promise(async (resolve, reject) => {
            var nonce = await this.web3.eth.getTransactionCount(senderAddress);
            let balance = 0;
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

            if(balance < amount) {
                console.log('transferFunds.error: amount < balance');
                return reject('not enough balance');
            }

            let details = {
                "to": receiverAddress,
                "value": this.web3.utils.toHex(this.web3.utils.toWei(amount.toString(), 'ether')),
                "gas": 21000,
                "nonce": nonce,
                "chainId": this.chainId //this.chainId // 4 // EIP 155 chainId - mainnet: 1, rinkeby: 4
            };
            
            const transaction = await this.web3.eth.accounts.signTransaction(
                details,
                senderPrivateKey
              );
            
            if (transaction.rawTransaction) {
                this.web3.eth.sendSignedTransaction(transaction.rawTransaction, (err, id) => {
                    if(err) {
                        console.log('sendSignedTransaction.error:', err);
                        return reject(err);
                    }
                    const url = this.network === 'mainnet' ? `https://bscscan.com/tx/${id}` : `https://testnet.bscscan.com/tx/${id}`;
                    console.log('transaction url:', url);
                    resolve(url);
                });
            } else {
                reject(Error("No Raw Transaction"))
            }
        });
    }
    /**
     * Get current gas prices
     * 
     * @returns current gas price
     */
    async getCurrentGasPrices() {
        let response = await axios.get('https://gbsc.blockscan.com/gasapi.ashx?apikey=key&method=gasoracle');
        let prices = {
            low: response.data.result.SafeGasPrice,
            medium: response.data.result.ProposeGasPrice,
            high: response.data.result.FastGasPrice
        };
        return prices;
    }
    /**
     * Get networks list
     * 
     * @returns List of supported networks for this coin type
     */
    getNetworksList() {return NETWORKS_LIST.map(v=>{return {val: v, text: v}});}
    /**
     * Get current network
     * 
     * @returns currently selected network name
     */
    getCurrentNetwork() {return this.network}

    /**
     * Get custom functions
     * 
     * @returns an object containing custom functions
     */
    getCustomFunctions(): Object {
        return {};
    }

}
