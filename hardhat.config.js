require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config();
require("hardhat-gas-reporter");
require("@nomiclabs/hardhat-etherscan");
require("solidity-coverage");


const POLYGON__TESTNET_RPC_URL= process.env.POLYGON__TESTNET_RPC_URL;
const POLYGON_TESTNET_PRIVATE_KEY= process.env.POLYGON_TESTNET_PRIVATE_KEY;
const BINANCE__TESTNET_RPC_URL= process.env.BINANCE__TESTNET_RPC_URL;
const BINANCE_TESTNET_PRIVATE_KEY= process.env.BINANCE_TESTNET_PRIVATE_KEY;
const GOERLI__TESTNET_RPC_URL=process.env.GOERLI__TESTNET_RPC_URL;
const GOERLI_TESTNET_PRIVATE_KEY=process.env.GOERLI_TESTNET_PRIVATE_KEY;

const COINMARKETCAP_API_KEY=process.env.COINMARKETCAP_API_KEY;
const BINANCE_MAINNET_API=process.env.BINANCE_MAINNET_API;
const POLYGON_MAINNET_API=process.env.POLYGON_MAINNET_API;
const ETHEREUM_MAINET_API= process.env.ETHEREUM_MAINET_API;

task("accounts", "Prints the list of accounts", async () => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

module.exports = {
  mocha: {
    timeout: 10000000000,
  },
  gasReporter: {
    // enabled: (process.env.REPORT_GAS) ? false:true,
    enabled: (process.env.REPORT_GAS) ? true:false,
    // outputFile:'gas-report.txt',
    currency: 'USD',
    coinmarketcap:COINMARKETCAP_API_KEY,
    token:'matic',
  },
  etherscan: {
    apiKey: {
      bscTestnet: BINANCE_MAINNET_API,
      polygonMumbai: POLYGON_MAINNET_API,
      goerli : ETHEREUM_MAINET_API,
    }
  },
  solidity:"0.8.9",
  networks: {
    ethereumTestnet: {
      url: GOERLI__TESTNET_RPC_URL,
      accounts: [GOERLI_TESTNET_PRIVATE_KEY],
      chainId:5,
    },
    polygonTestnet: {
      url: POLYGON__TESTNET_RPC_URL,
      accounts: [POLYGON_TESTNET_PRIVATE_KEY],
      chainId:80001,
    },
    binanceTestnet: {
      url: BINANCE__TESTNET_RPC_URL,
      accounts: [BINANCE_TESTNET_PRIVATE_KEY],
      chainId:97,
    },
    
  },
  
};