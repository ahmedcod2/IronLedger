require("@nomicfoundation/hardhat-toolbox");
require("hardhat-gas-reporter");
require("dotenv").config();

module.exports = {
  solidity: "0.8.24",
  networks: {
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || "",
      accounts: process.env.PRIVATE_KEY
        ? [process.env.PRIVATE_KEY.startsWith("0x") ? process.env.PRIVATE_KEY : "0x" + process.env.PRIVATE_KEY]
        : []
    }
  },
  gasReporter: {
    enabled: true,
    currency: "USD",
    coinmarketcap: process.env.CMC_KEY,
    outputFile: "gas-report.txt",
    noColors: true
  }
};
