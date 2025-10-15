require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  // 👇 ДОБАВЬ ЭТО — чтобы Hardhat знал, где искать @openzeppelin
  networks: {
    hardhat: {
      chainId: 1337
    }
  }
};