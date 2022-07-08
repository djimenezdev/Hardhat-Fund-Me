import { ethers, getNamedAccounts } from "hardhat";
import { exit } from "process";
async function main() {
  const { deployer } = await getNamedAccounts();
  const fundMe = await ethers.getContract("FundMe", deployer);
  console.log("Funding...");
  const transactionResponse = await fundMe.cheaperWithdraw();
  await transactionResponse.wait(1);
  console.log("Got it back!");
}

main()
  .then(() => exit(0))
  .catch((error) => {
    console.error(error);
    exit(1);
  });
