import { coinFactory } from './logicFactory';

async function testBalance() {
    const chain = 'bsc';
    const network = 'testnet'
    console.log(`Chain ${chain}`)

    // Ethereum/BSC/Polygon Address
    const address = '0x5D998481c4653E0e39950994D06B0C6A91C1e786';
    let coinLogic = coinFactory(chain, { network });

    // Solana Address
    // const address = '8ATKQkJVLjAKwZqZx679V3hffTHA4399bAva5m1x3XyS';
    // let coinLogic = coinFactory(chain, {network})

    const networkList = await coinLogic.getNetworksList();
    console.log(`Network List: ${networkList.map(net => `${net.text}`)}`);

    const currentNetwork = await coinLogic.getCurrentNetwork();
    console.log(`Current Network: ${currentNetwork}`)

    const balance = await coinLogic.getBalance(address);

    console.log(`Address ${address}, balance: ${balance}`);

    // Solana Transfer
    // const result = await coinLogic.transferFunds(
    //     "8ATKQkJVLjAKwZqZx679V3hffTHA4399bAva5m1x3XyS",
    //     "53gQpdNDDVCkoiT8QZ6oHsjQFYe6b7qGGM59dT57s3RbRUwnLJkFwsiuwTJX5HbYzxnFmYsuxsCGEcte5MR8ysGc",
    //     "GoNFprQFKZWevbcTnhUX2rAsk757HzXXhCbVFd5MB8ZD",
    //     0.001
    // )
    // Ethereum/BSC/Polygon Address
    const result = await coinLogic.transferFunds(
        "0x5D998481c4653E0e39950994D06B0C6A91C1e786",
        "0e3d0025be4c6ce163254e94908c313c3427ce24a4037c496f39409502637da3",
        "0x16a008A9C5E999FE04CfEfaFD060B3Fcd7967AF7",
        0.001
    )
}

testBalance();
