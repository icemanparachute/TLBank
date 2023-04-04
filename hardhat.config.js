require('@nomiclabs/hardhat-etherscan');
require('@nomiclabs/hardhat-waffle');
require('hardhat-gas-reporter');
require('solidity-coverage');
require('hardhat-deploy');
require("dotenv").config();


module.exports = {
  solidity: {
    version: '0.8.18',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    sepolia: {
      deploy: ['scripts/deploy'],
      url: process.env.SEPOLIA_URL,
      accounts: [process.env.SEPOLIA_PRIVATE_KEY],
    },
    goerli: {
      deploy: ['scripts/deploy'],
      url: process.env.GOERLI_URL,
      accounts: [process.env.GOERLI_PRIVATE_KEY],
    },
    mainnet: {
      deploy: ['scripts/deploy'],
      url: process.env.MAINNET_URL,
      accounts: [process.env.MAINNET_PRIVATE_KEY],
    }
  },
  etherscan: {
    apiKey: {
      sepolia: process.env.ETHERSCAN_APIKEY,
      goerli: process.env.ETHERSCAN_APIKEY,
      mainnet: process.env.ETHERSCAN_APIKEY,
    },
  },
};
