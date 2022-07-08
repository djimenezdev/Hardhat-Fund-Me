import * as dotenv from "dotenv";

import { HardhatUserConfig, task } from "hardhat/config";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import "solidity-coverage";
import "hardhat-deploy";

dotenv.config();

const config: HardhatUserConfig = {
  defaultNetwork: "hardhat",
  solidity: {
    compilers: [
      {
        version: "0.8.8",
      },
      {
        version: "0.7.0",
      },
    ],
  },
  networks: {
    rinkeby: {
      url: process.env.RINKEBY_RPC_URL || "",
      accounts: [
        process.env.PRIVATE_KEY || "",
        process.env.PRIVATE_KEY_TWO || "",
      ],
      chainId: 4,
    },
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    // currency: "USD",
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_KEY || "",
  },
  namedAccounts: {
    deployer: {
      default: 0,
    },
  },
};

export default config;
