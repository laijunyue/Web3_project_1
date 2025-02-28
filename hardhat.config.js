require("@nomicfoundation/hardhat-toolbox");
require("@chainlink/env-enc").config();
require("./tasks/index");
require("hardhat-deploy");
require("@nomicfoundation/hardhat-ethers");
require("hardhat-deploy");
require("hardhat-deploy-ethers");

const SEPOLIA_URL = process.env.SEPOLIA_URL
const PRIVATE_KEY = process.env.PRIVATE_KEY
const PRIVATE_KEY_1 = process.env.PRIVATE_KEY_1
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY

const { ProxyAgent, setGlobalDispatcher } = require("undici");
const proxyAgent = new ProxyAgent("http://192.168.1.16:7890"); // 替换为你的代理地址和端口
setGlobalDispatcher(proxyAgent);

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.28",
  defaultNetwork: "hardhat",
  networks: {
    sepolia: {
      url: SEPOLIA_URL, //Alchemy, Infura, QuickNode,
      accounts: [PRIVATE_KEY, PRIVATE_KEY_1],
      chainId: 11155111,
    }
  },
  
  etherscan: {
    // Your API key for Etherscan
    // Obtain one at https://etherscan.io/
    apiKey: {
      sepolia: ETHERSCAN_API_KEY
    }
  },

  namedAccounts: {
    firstAccount: {  //accounts: [PRIVATE_KEY, PRIVATE_KEY_1]
      default: 0,   // accounts[0] by default
    },
    secondAccount: {
      default: 1,    // accounts[1] by default
    },
  },

};
