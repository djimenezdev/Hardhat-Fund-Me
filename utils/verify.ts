import { run } from "hardhat";

export async function verify(contractAddress: string, args: string[]) {
  console.log("Verifying Contract...");
  try {
    await run("verify:verify", {
      address: contractAddress,
      constructorArguments: args,
    }).then(() => {
      console.log(
        `Verified Successfully on etherscan: https://rinkey.etherscan.io/address/${contractAddress}`
      );
    });
  } catch (e: any) {
    if (e.message.toLowerCase().includes("already verified")) {
      console.error("Already Verified!");
    } else {
      console.error(e);
    }
  }
}
