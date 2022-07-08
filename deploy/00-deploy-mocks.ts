import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { network } from "hardhat";
import {
  developmentChain,
  DECIMALS,
  INITIAL_ANSWER,
} from "../helper-hardhat-config";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const {
    getNamedAccounts,
    deployments: { deploy, log },
  } = hre;
  const { deployer } = await getNamedAccounts();
  if (developmentChain.includes(network.name)) {
    log("Local Network detected! deploying mock contract");
    await deploy("MockV3Aggregator", {
      contract: "MockV3Aggregator",
      from: deployer,
      log: true,
      args: [DECIMALS, INITIAL_ANSWER],
    });
    log("Mocks deployed!");
    log("----------------------------------------");
  }
};
export default func;
func.tags = ["all", "mocks"];
