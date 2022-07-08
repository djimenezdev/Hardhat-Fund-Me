/* eslint-disable no-unused-expressions */
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { assert, expect } from "chai";
import { ethers, deployments, getNamedAccounts, network } from "hardhat";
import { developmentChain } from "../../helper-hardhat-config";
import { FundMe, MockV3Aggregator } from "../../typechain/index";

!developmentChain.includes(network.name)
  ? describe.skip
  : describe("Fund Me", function () {
      let fundMe: FundMe;
      let mockV3Aggregator: MockV3Aggregator;
      let contractDeployer: string;
      beforeEach(async function () {
        await deployments.fixture(["all"]);
        const { deployer } = await getNamedAccounts();
        contractDeployer = deployer;
        fundMe = await ethers.getContract("FundMe", deployer);
        mockV3Aggregator = await ethers.getContract(
          "MockV3Aggregator",
          deployer
        );
      });

      describe("constructor", function () {
        it("sets the aggregator addresses correctly", async function () {
          const response = await fundMe.getPriceFeed();
          assert.equal(response, mockV3Aggregator.address);
        });
      });
      describe("version and value", function () {
        it("Should return the version of the Price Feed Aggregator", async function () {
          const response = await fundMe.getVersion();
          const version = 0;
          assert.equal(parseInt(response?._hex, 16), version);
        });
        it("Should return the current USD Price of ETH", async function () {
          const currentValue = await fundMe.getPrice();
          const decimalVal = await fundMe.getDecimal();
          const hexToVal = currentValue.toString();
          const usd = parseInt(hexToVal.slice(0, hexToVal.length - decimalVal));
          assert.equal(usd, 2000);
        });
      });
      describe("funding", function () {
        it("Should allow a user to fund the contract", async function () {
          await fundMe.fund({
            value: ethers.utils.parseEther("1"),
          });
          assert("Contract Successfully funded");
        });
        it("Should match funder to their fund", async function () {
          await fundMe.fund({
            value: ethers.utils.parseEther("1"),
          });

          const funder = await fundMe.getAddressToAmountFunded(
            contractDeployer
          );
          expect(funder.toString()).to.be.equal(ethers.utils.parseEther("1"));
        });

        it("Should update funders Arr if funded", async function () {
          await fundMe.fund({
            value: ethers.utils.parseEther("1"),
          });
          const fundersArr = await fundMe.getFunder(0);
          expect(fundersArr).to.equal(contractDeployer);
        });
        it("Should not allow user to fund if not meeting minimum usd value", async function () {
          const fundContract = fundMe.fund({
            value: ethers.utils.parseEther("0.01"),
          });
          await expect(fundContract).to.be.revertedWith(`FundMe__NotOwner`);
        });
      });
      describe("Withdrawing from function", function () {
        // rule for tests
        /* 
    Arrange - setup test
    Act - perform test
    Assert - check test 
    */
        let contractDeployer: SignerWithAddress;
        beforeEach(async function () {
          const [owner, addr1, addr2] = await ethers.getSigners();
          contractDeployer = owner;
          await fundMe
            .connect(addr1)
            .fund({ value: ethers.utils.parseEther("0.06") });
          await fundMe
            .connect(addr2)
            .fund({ value: ethers.utils.parseEther("1") });
        });

        it("Should showcase added funds to contract", async function () {
          const provider = ethers.provider;
          const contractBalance = await provider.getBalance(fundMe.address);
          const balanceInETH =
            parseInt(contractBalance._hex, 16) / (1 * 10 ** 18);
          const value = 1.06;
          expect(balanceInETH).to.be.equal(value);
        });
        it("Owner wallet balance should increase after withdrawing", async function () {
          const withdraw = await fundMe
            .connect(contractDeployer)
            .cheaperWithdraw();
          await expect(withdraw).to.changeEtherBalance(
            contractDeployer,
            ethers.utils.parseEther("1.06")
          );
        });
      });

      describe("Should not withdraw", function () {
        let contractDeployer: SignerWithAddress, userAddr1: SignerWithAddress;
        beforeEach(async function () {
          const [owner, addr1] = await ethers.getSigners();
          contractDeployer = owner;
          userAddr1 = addr1;
        });

        it("if funds insufficient", async function () {
          const withdraw = fundMe.connect(contractDeployer).cheaperWithdraw();
          await expect(withdraw).to.be.revertedWith("No funds at the moment");
        });
        it("Should not withdraw if not owner", async function () {
          const withdraw = fundMe.connect(userAddr1).cheaperWithdraw();
          await expect(withdraw).to.be.reverted;
        });
      });
    });
