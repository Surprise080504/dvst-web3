import EthereumLogic from "./chains/ethereum";
import CoinInterface from "./CoinInterface";
import BitCoinLogic from "./chains/bitcoin";
import BSCLogic from "./chains/bsc";
import PolygonLogic from "./chains/polygon";
import AvalancheLogic from "./chains/avalanche";
import FantomLogic from "./chains/fantom";
import HarmonyLogic from "./chains/harmony";
import HuobiLogic from "./chains/huobi";
import KucoinLogic from "./chains/kucoin";
import SolanaLogic from "./chains/solana";

/**
 * Coin Factory creates the coin logic handler
 * 
 * @param coinType Coin type that logic handler is to be created
 * @param config   Configuration
 * @returns        Logic handler 
 */
export function coinFactory(coinType: string, config: any) {
    switch (coinType) {
        case 'ethereum':
            return new EthereumLogic(config);
        case 'bitcoin':
            return new BitCoinLogic(config);
        case 'bsc':
            return new BSCLogic(config);
        case 'polygon':
            return new PolygonLogic(config);
        case 'avalanche':
            return new AvalancheLogic(config);
        case 'fantom':
            return new FantomLogic(config);
        case 'harmony':
            return new HarmonyLogic(config);
        case 'huobi':
            return new HuobiLogic(config);
        case 'kucoin':
            return new KucoinLogic(config);
        case 'solana':
            return new SolanaLogic(config);
        default:
        // console.error('Not implemented coinType:', coinType);
        // throw 
    }
    return new CoinInterface();
}