/* eslint-disable no-unused-expressions */
/* eslint-disable no-unused-vars */
import { assert } from "chai";
import { ethers, getNamedAccounts, network } from "hardhat";
import { developmentChain } from "../../helper-hardhat-config";
import { FundMe } from "../../typechain/index";

developmentChain.includes(network.name)
  ? describe.skip
  : describe("FundMe", async function () {
      let fundMe: FundMe;
      let deployer: string;
      const sendValue = ethers.utils.parseEther("0.00083");
      beforeEach(async function () {
        deployer = (await getNamedAccounts()).deployer;
        console.log(deployer);
        fundMe = await ethers.getContract("FundMe", deployer);
      });
      it("allows people to fund and withdraw", async function () {
        const [owner, addr1] = await ethers.getSigners();
        const transaction = await fundMe
          .connect(addr1)
          .fund({ value: sendValue });
        await transaction.wait(1);
        await fundMe.connect(owner).cheaperWithdraw();
        const endingFundMeBalance = await fundMe.provider.getBalance(
          fundMe.address
        );
        console.log("ending", endingFundMeBalance.toString());
        assert.equal(endingFundMeBalance.toString(), "830000000000000");
      });
    });
