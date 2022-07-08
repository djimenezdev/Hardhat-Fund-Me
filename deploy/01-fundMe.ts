import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { network } from "hardhat";
import { developmentChain, networkConfig } from "../helper-hardhat-config";
import { verify } from "../utils/verify";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const {
    getNamedAccounts,
    deployments: { deploy, log, get },
  } = hre;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId!;

  let ethUSDPriceFeedAddr;
  if (developmentChain.includes(network.name)) {
    const ethUsdAggregator = await get("MockV3Aggregator");
    ethUSDPriceFeedAddr = ethUsdAggregator.address;
  } else {
    ethUSDPriceFeedAddr = networkConfig[chainId].ethUSDPriceFeed;
  }
  const args = [ethUSDPriceFeedAddr];
  const fundMe = await deploy("FundMe", {
    from: deployer,
    args: args,
    log: true,
    waitConfirmations: !developmentChain.includes(network.name) ? 6 : 0,
  });
  if (!developmentChain.includes(network.name) && process.env.ETHERSCAN_KEY) {
    await verify(fundMe.address, args);
  }

  log("--------------------------------------");
};
export default func;

func.tags = ["all", "fundMe"];
