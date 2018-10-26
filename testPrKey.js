const hdkey = require('ethereumjs-wallet/hdkey');
const ethwallet = require('ethereumjs-wallet');
const ethtx = require('ethereumjs-tx');
const bip39 = require('bip39');

const mnemonic = "..";
//const hdwallet = hdkey.fromMasterSeed(bip39.mnemonicToSeed(mnemonic));
//const path = "m/44'/60'/0'/0/0";
//const wallet = hdwallet.derivePath(path).getWallet();
const wallet2 = hdkey.fromMasterSeed(bip39.mnemonicToSeed(mnemonic)).getWallet();

const address = `0x${wallet2.getAddress().toString("hex")}`;


//console.log(`Private key: ${wallet.getPrivateKeyString().slice(2,)}`);
console.log(`Private key: ${wallet2.getPrivateKeyString().slice(2,)}`);

console.log(`Address: ${address}`);