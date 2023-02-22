import '@nomiclabs/hardhat-waffle'
import '@nomiclabs/hardhat-etherscan'
import '@nomiclabs/hardhat-ethers'
import '@typechain/hardhat'
// import 'solidity-coverage'
// import 'hardhat-docgen'
// import "hardhat-abi-exporter"
import "hardhat-gas-reporter"
// import '@primitivefi/hardhat-dodoc'


// import 'hardhat-contract-sizer';
require('dotenv').config()
require('./tasks')

const chainIds: { [key: string]: number } = {
  ganache: 1337,
  goerli: 5,
  hardhat: 31337,
  kovan: 42,
  mainnet: 1,
  rinkeby: 4,
  ropsten: 3
}

// Ensure that we have all the environment variables we need.
let mnemonic: string
if (!process.env.MNEMONIC) {
  throw new Error('Please set your MNEMONIC in a .env file')
} else {
  mnemonic = process.env.MNEMONIC
}

let infuraApiKey: string
if (!process.env.INFURA_API_KEY) {
  throw new Error('Please set your INFURA_API_KEY in a .env file')
} else {
  infuraApiKey = process.env.INFURA_API_KEY
}

function createNetworkConfig(network: string) {
  const url = 'https://' + network + '.infura.io/v3/' + infuraApiKey
  return {
    accounts: {
      count: 10,
      initialIndex: 0,
      mnemonic,
      path: "m/44'/60'/0'/0",
    },
    chainId: chainIds[network],
    url,
    gas: 'auto',
    gasPrice: 60000000000
  }
}

module.exports = {
  defaultNetwork: 'hardhat',
  etherscan: {
    apiKey: process.env.SCAN_API_KEY
  },
  networks: {
    // hardhat: {
    //   accounts: {
    //     mnemonic,
    //   },
    //   chainId: chainIds.hardhat,
    // },

    hardhat: {
      accounts: {
        mnemonic,
      },
      forking: {
        url: process.env.ALCHEMY_API_HTTP,
        blockNumber: 29260178
        //  26782498 
        // 
      }
    },


    mainnet: createNetworkConfig('mainnet'),
    goerli: createNetworkConfig('goerli'),
    kovan: createNetworkConfig('kovan'),
    rinkeby: createNetworkConfig('rinkeby'),
    ropsten: createNetworkConfig('ropsten'),

    mumbai: {
      url: 'https://rpc-mumbai.maticvigil.com/',
      // 'https://matic-testnet-archive-rpc.bwarelabs.com',
      chainId: 80001,
      gasPrice: 'auto',
      accounts: { mnemonic: mnemonic },
    },
    polygon: {
      url: 'https://polygon-rpc.com',
      chainId: 137,
      gasPrice: 100000000000,
      accounts: { mnemonic: mnemonic },
    },
    bsc_testnet: {
      url: 'https://data-seed-prebsc-1-s1.binance.org:8545/',
      chainId: 97,
      gasPrice: 'auto',
      // gasLimit: 10000000,
      accounts: { mnemonic: mnemonic },
    },
    bsc: {
      url: 'https://bsc-dataseed.binance.org/',
      chainId: 56,
      gasPrice: 5000000000,
      // gasLimit: 10000000,
      accounts: { mnemonic: mnemonic },
    }



  },
  paths: {
    artifacts: './artifacts',
    cache: './cache',
    sources: './contracts',
    tests: './test',
  },
  solidity: {
    compilers: [
      {
        version: '0.8.10',
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },

      {
        version: '0.6.0',
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },

      {
        version: '0.6.2',
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
      {
        version: '0.6.6',
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },


    ],
  },

  contractSizer: {
    alphaSort: true,
    runOnCompile: true,
    disambiguatePaths: false,
  },
  gasReporter: {
    currency: 'CHF',
    gasPrice: 21
  },
  abiExporter: {
    path: "./abis",
    runOnCompile: true,
    clear: true,
    flat: true,
    only: [],
    spacing: 2,
    pretty: false,
  },

  dodoc: {
    runOnCompile: false,
    debugMode: true,
  },
  docgen: {
    path: './docs_docgen',
    clear: true,
    runOnCompile: true,
  },
  mocha: {
    timeout: 1000000000
  }

}