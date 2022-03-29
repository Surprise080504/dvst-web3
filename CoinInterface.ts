/**
 * Coin Interface parent class
 * This parent class provides an interface for the extension to transparently deal with any bitcoin
 *
 */
export default class CoinInterface {
  // constructor(config: any) {}
  async getBalance(address: string): Promise<string | number | Error> {
    return "n/a";
  }
  async transferFunds(
    senderAddress: string,
    senderPrivateKey: string,
    receiverAddress: string,
    amount: number
  ): Promise<string> {
    return "";
  }
  setConfig(config: any) {}
  getNetworksList(): Array<{ val: string; text: string }> {
    return [];
  }
  getCurrentNetwork(): string {
    return "";
  }
  getCustomFunctions(): Object {
    return {};
  }
}
