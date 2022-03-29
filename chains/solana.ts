/** 
 * Solana logic module
 * 
 */

import CoinInterface from "../CoinInterface";
import * as Web3 from '@solana/web3.js';
import axios from 'axios';

/**
 * Get the chain id for network type
 * @param networkType 
 * @returns 
 */
const NETWORKS_LIST = ['mainnet beta', 'testnet', 'devnet'];
const DEFAULT_NETWORK = 'mainnet beta';
/**
 * Make network URL for the provided network
 * @param network 
 * @returns 
 */
function MAKE_NETOWRK_URL(network: string) {
    switch (network) {
        case 'mainnet beta':
            return 'https://api.mainnet-beta.solana.com';
        case 'testnet':
            return 'https://api.testnet.solana.com';
        case 'devnet':
            return 'https://api.devnet.solana.com';
        default:
            return 'https://api.mainnet-beta.solana.com';
    }
}

/**
 * Solana Logic config interface
 */
interface SolanaLogicConfig {
    network: string | undefined,

};
/**
 * SolanaLogic to handle the balance request and funds transfer to Solana network
 * @class SolanaLogic
 * {@link CoinInterface} 
 * 
 */
export default class SolanaLogic extends CoinInterface {
    private network: string = MAKE_NETOWRK_URL(DEFAULT_NETWORK);
    private web3 = new Web3.Connection(this.network);
    /**
     * Constructor of SolanaLogic class
     * @param config network configuration
     */
    constructor(config: SolanaLogicConfig) {
        super();
        this.setConfig(config);
    }
    /**
     * Set configuration for the Solana logic class
     * @param config 
     */
    setConfig(config: SolanaLogicConfig) {
        this.network = config && config.network ? config.network : DEFAULT_NETWORK;
        this.network = MAKE_NETOWRK_URL(this.network); // config.network; // 'https://rinkeby.infura.io/v3/622d1a16ce8d4d3986333878c03feab6';
        this.web3 = new Web3.Connection(this.network);
    }
    /**
     * Get balance of provided address
     * @param address 
     * @returns amount or error
     */
    async getBalance(address: string): Promise<number | Error> {
        const pubKey = new Web3.PublicKey(address);
        return new Promise(async (resolve, reject) => {
            try {
                var balance = await this.web3.getBalance(pubKey);
                resolve(balance);
            } catch(err) {
                reject(err);
            }
        });
    }
    /**
     * Transfer funds from one Solana address to others
     * 
     * @param senderAddress     sender's address
     * @param senderPrivateKey  sender's private key
     * @param receiverAddress   receiver's address
     * @param amount            amount in Ehtereum to transfer 
     * @returns                 result in string
     */
    async transferFunds(senderAddress: string, senderPrivateKey: string, receiverAddress: string, amount: number): Promise<string> {
        return new Promise(async (resolve, reject) => {
            try {
                const transactionInstruction = Web3.SystemProgram.transfer({
                    fromPubkey: new Web3.PublicKey(senderAddress),
                    toPubkey: new Web3.PublicKey(receiverAddress),
                    lamports: amount,
                });

                const transaction = new Web3.Transaction().add(transactionInstruction);

                const account = new Web3.Account(Buffer.from(senderPrivateKey, 'utf8'));

                const signature = await Web3.sendAndConfirmTransaction(
                  this.web3,
                  transaction,
                  [account]
                );
            } catch(err) {
                reject(err);
            }
        });
    }
    /**
     * Get current gas prices
     * 
     * @returns current gas price
     */
    async getCurrentGasPrices() {
        let response = await axios.get('https://gsolana.blockscan.com/gasapi.ashx?apikey=key&method=gasoracle');
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
    getNetworksList() { return NETWORKS_LIST.map(v => { return { val: v, text: v } }); }
    /**
     * Get current network
     * 
     * @returns currently selected network name
     */
    getCurrentNetwork() { return this.network }

    /**
     * Get custom functions
     * 
     * @returns an object containing custom functions
     */
    getCustomFunctions(): Object {
        return {};
    }

}
