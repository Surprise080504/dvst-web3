/**
 * ethereum logic module
 *
 */

import CoinInterface from "../CoinInterface";
import Web3 from "web3";
import { Transaction } from "ethereumjs-tx";
import axios from "axios";

// const CHAIN_IDS = {'mainnet':1, 'ropsten':3, 'kovan': 42, 'goerli': 5, 'rinkeby': 4};
/**
 * Get the chain id for network type
 * @param networkType
 * @returns
 */
function CHAIN_IDS(networkType: string): number {
  switch (networkType) {
    case "mainnet":
      return 1;
    case "ropsten":
      return 3;
    case "kovan":
      return 42;
    case "goerli":
      return 5;
    case "rinkeby":
      return 4;
    default:
      return 4;
  }
}
const NETWORKS_LIST = ["mainnet", "ropsten", "kovan", "goerli", "rinkeby"];
const DEFAULT_NETWORK = "rinkeby";
/**
 * Make network URL for the provided network
 * @param network
 * @returns
 */
function MAKE_NETOWRK_URL(network: string) {
  return `https://${network}.infura.io/v3/622d1a16ce8d4d3986333878c03feab6`;
}

// const defaultNetworkConfig = {
//         ethNetwork: 'https://rinkeby.infura.io/v3/622d1a16ce8d4d3986333878c03feab6',
//         ethChainId: 4,
//         ethChain: 'rinkeby' };

/**
 * Ethereum Logic config interface
 */
interface EthereumLogicConfig {
  network: string | undefined;
}
/**
 * EthereumLogic to handle the balance request and funds transfer to ethereum network
 * @class EthereumLogic
 * {@link CoinInterface}
 *
 */
export default class EthereumLogic extends CoinInterface {
  private network: string = DEFAULT_NETWORK;
  private ethNetwork: string = "rinkeby";
  private chainId: number = 4;
  private chain: string = DEFAULT_NETWORK;
  private web3 = new Web3(new Web3.providers.HttpProvider(this.ethNetwork));
  /**
   * Constructor of EthereumLogic class
   * @param config network configuration
   */
  constructor(config: EthereumLogicConfig) {
    super();
    this.setConfig(config);
  }
  /**
   * Set configuration for the ethereum logic class
   * @param config
   */
  setConfig(config: EthereumLogicConfig) {
    this.network = config && config.network ? config.network : DEFAULT_NETWORK;

    this.ethNetwork = MAKE_NETOWRK_URL(this.network); // config.ethNetwork; // 'https://rinkeby.infura.io/v3/622d1a16ce8d4d3986333878c03feab6';
    this.chainId = CHAIN_IDS(this.network); // config.ethChainId; // 4
    this.chain = this.network; // config.ethChain; //'rinkeby'
    this.web3 = new Web3(new Web3.providers.HttpProvider(this.ethNetwork));
  }
  /**
   * Get balance of provided address
   * @param address
   * @returns amount or error
   */
  async getBalance(address: string): Promise<number | Error> {
    return new Promise((resolve, reject) => {
      this.web3.eth.getBalance(address, async (err, result) => {
        if (err) {
          return reject(err);
        }
        let bstr = this.web3.utils.fromWei(result, "ether");
        let bflt = parseFloat(bstr);
        resolve(bflt);
      });
    });
  }
  /**
   * Transfer funds from one Ethereum address to others
   *
   * @param senderAddress     sender's address
   * @param senderPrivateKey  sender's private key
   * @param receiverAddress   receiver's address
   * @param amount            amount in Ehtereum to transfer
   * @returns                 result in string
   */
  async transferFunds(
    senderAddress: string,
    senderPrivateKey: string,
    receiverAddress: string,
    amount: number
  ): Promise<string> {
    return new Promise(async (resolve, reject) => {
      var nonce = await this.web3.eth.getTransactionCount(senderAddress);
      let balance = 0;
      try {
        let ret = await this.getBalance(senderAddress);
        if (ret instanceof Error) throw ret;

        balance = ret;
      } catch (e) {
        console.log("getBalance.error:", e);
        reject(e);
      }

      if (balance < amount) {
        console.log("transferFunds.error: amount < balance");
        return reject("not enough balance");
      }

      let gasPrices = await this.getCurrentGasPrices();
      let details = {
        to: receiverAddress,
        value: this.web3.utils.toHex(
          this.web3.utils.toWei(amount.toString(), "ether")
        ),
        gas: 21000,
        gasPrice: gasPrices.low * 1000000000,
        nonce: nonce,
        chainId: 4, //this.chainId // 4 // EIP 155 chainId - mainnet: 1, rinkeby: 4
      };

      const transaction = new Transaction(details, { chain: this.chain });
      let privateKey = senderPrivateKey.startsWith("0x")
        ? senderPrivateKey.split("0x")
        : ["", senderPrivateKey];
      let privKey = Buffer.from(privateKey[1], "hex");
      transaction.sign(privKey);

      const serializedTransaction = transaction.serialize();
      // console.log(`sender:${senderAddress}, sendPk:${senderPrivateKey}, rec:${receiverAddress}, amount:${amount}`);
      // console.log(`PrivateKey: ${privateKey[1]}`);
      this.web3.eth.sendSignedTransaction(
        "0x" + serializedTransaction.toString("hex"),
        (err, id) => {
          if (err) {
            console.log("sendSignedTransaction.error:", err);
            return reject(err);
          }
          const url = `https://${this.chain}.etherscan.io/tx/${id}`;
          console.log("transaction url:", url);
          resolve(url);
        }
      );
    });
  }
  /**
   * Get current gas prices
   *
   * @returns current gas price
   */
  async getCurrentGasPrices() {
    let response = await axios.get(
      "https://ethgasstation.info/json/ethgasAPI.json"
    );
    let prices = {
      low: response.data.safeLow / 10,
      medium: response.data.average / 10,
      high: response.data.fast / 10,
    };
    return prices;
  }
  /**
   * Get networks list
   *
   * @returns List of supported networks for this coin type
   */
  getNetworksList() {
    return NETWORKS_LIST.map((v) => {
      return { val: v, text: v };
    });
  }
  /**
   * Get current network
   *
   * @returns currently selected network name
   */
  getCurrentNetwork() {
    return this.network;
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
