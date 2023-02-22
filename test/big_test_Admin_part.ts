import hre, { ethers, network } from "hardhat";
import {
  PolylasticV3,
  DAOAdmin,
  PartnerProgram,
  IndexAdmin,
  Treasure,
  FactoryAdmin,
} from "../typechain";
import BigNumber from "bignumber.js";
import { utils } from "ethers";
import { expect } from "chai";

BigNumber.config({ EXPONENTIAL_AT: 60 });

const Web3 = require("web3");

const web3 = new Web3(hre.network.provider);
const prov = ethers.getDefaultProvider();

async function getNodeTime(): Promise<number> {
  const blockNumber = await ethers.provider.send("eth_blockNumber", []);
  const txBlockNumber = await ethers.provider.send("eth_getBlockByNumber", [
    blockNumber,
    false,
  ]);
  return parseInt(new BigNumber(txBlockNumber.timestamp).toString());
}

async function shiftTime(newTime: number | string) {
  await ethers.provider.send("evm_increaseTime", [newTime]);
  await ethers.provider.send("evm_mine", []);
}

let addr: any;
let polx: PolylasticV3;
let daoAdmin: DAOAdmin;
let indexMaster: IndexAdmin;
let treasure: Treasure;
let factoryAdmin: FactoryAdmin;
let pProgram: PartnerProgram;

let validator: any;
let arrIndexes: any;

const adapter = "0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff";
const usdcAddr = "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174";
const WETHAddr = "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619";
const BNBAddr = "0x5c4b7CCBF908E64F32e12c6650ec0C96d717f03F";
const WMATICAddr = "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270";
const GHSTAddr = "0x385Eeac5cB85A38A9a07A70c73e0a3271CfB54A7";
const agEURAddr = "0xE0B52e49357Fd4DAf2c15e02058DCE6BC0057db4";
const AKTAddr = "0xf14fbC6B30e2c4BC05A1D4fbE34bf9f14313309D";
const ALPHAaddr = "0x6a3E7C3c6EF65Ee26975b12293cA1AAD7e1dAeD2";

describe("1) big_test_Admin_part #1)", () => {
  describe("Deploy: PLX, DAOAdmin, Treasure, IndexAdmin_Master, FactoryAdmin", () => {
    it("Deploy PLX", async function () {
      addr = await ethers.getSigners();
      const [POLX] = await Promise.all([
        ethers.getContractFactory("PolylasticV3"),
      ]);
      polx = (await POLX.deploy(
        "POLX",
        "POLX",
        10000,
        addr[0].address
      )) as PolylasticV3;

      const amount = utils.parseEther("1000");
      await polx.transfer(addr[1].address, amount);
      await polx.transfer(addr[2].address, amount);
      await polx.transfer(addr[3].address, amount);
    });

    it("Deploy DAOAdmin", async function () {
      const [DAOAdmin] = await Promise.all([
        ethers.getContractFactory("DAOAdmin"),
      ]);

      const minimumQuorumPercent = 3;
      const debatingPeriodDuration = 3600 * 24;
      let whiteList = [
        addr[1].address,
        addr[2].address,
        addr[3].address,
        addr[4].address,
        addr[5].address,
      ];
      const selectors = [
        "0x4d148673", // changePeriodDuration
        "0x00c2af11", // changeMinimumQuorumPercent
        "0x4eb647bc", // setMinimumQuorumPercent
        "0x7c2d6e01", // setPeriodDuration
        "0xd7a1284a", // addSelector
        "0x67fc22c6", // removeSelector
        "0x9c54df64", // addAdmins
        "0x377e11e0", // removeAdmins
        "0xd5da6173", // setMaxShare
        "0xc45618f5", // setFeeStake
        "0x99331510", // setFeeUnStake
        "0xdc53e5cf", // setRebalancePeriod
        "0xbb9cd698", // newIndexComposition
        "0xd431b1ac", // setPause
      ];

      whiteList = [
        addr[1].address,
        addr[2].address,
        addr[3].address,
        addr[4].address,
        addr[5].address,
      ];
      daoAdmin = (await DAOAdmin.deploy(
        polx.address,
        minimumQuorumPercent,
        debatingPeriodDuration,
        whiteList,
        selectors
      )) as DAOAdmin;
      await polx.setBridgeContractAddress(daoAdmin.address);
    });

    it("Deploy Treasure", async function () {
      const [Treasure] = await Promise.all([
        ethers.getContractFactory("Treasure"),
      ]);
      treasure = (await Treasure.deploy(daoAdmin.address)) as Treasure;
    });

    it("Deploy PartnerProgram", async function () {
      addr = await ethers.getSigners();
      const [PartnerProgram] = await Promise.all([
        ethers.getContractFactory("PartnerProgram"),
      ]);

      const percentReward = [10000000];
      pProgram = (await PartnerProgram.deploy(
        percentReward,
        treasure.address,
        daoAdmin.address
      )) as PartnerProgram;
    });

    it("Deploy IndexAdmin_Master", async function () {
      const [IndexMaster] = await Promise.all([
        ethers.getContractFactory("IndexAdmin"),
      ]);
      indexMaster = (await IndexMaster.deploy()) as IndexAdmin;
    });

    it("Deploy FactoryAdmin", async function () {
      const [FactoryAdmin] = await Promise.all([
        ethers.getContractFactory("FactoryAdmin"),
      ]);
      const rebalancePeriod = 3600 * 24;
      validator = addr[4];

      factoryAdmin = (await FactoryAdmin.deploy(
        indexMaster.address,
        daoAdmin.address,
        validator.address,
        usdcAddr,
        adapter,
        rebalancePeriod,
        treasure.address,
        pProgram.address
      )) as FactoryAdmin;

      const FABRIC_ROLE = await pProgram.FABRIC_ROLE();
      await pProgram.grantRole(FABRIC_ROLE, factoryAdmin.address);
      // let param = await factoryAdmin.getMainParam();
    });
  });

  describe("DAOAdmin", () => {
    it("Deposit", async function () {
      const amount = utils.parseEther("100");
      await polx
        .connect(addr[1])
        .approve(daoAdmin.address, utils.parseEther("111111111111111111"));
      await polx
        .connect(addr[2])
        .approve(daoAdmin.address, utils.parseEther("111111111111111111"));
      await polx
        .connect(addr[3])
        .approve(daoAdmin.address, utils.parseEther("111111111111111111"));
      await polx
        .connect(addr[4])
        .approve(daoAdmin.address, utils.parseEther("111111111111111111"));
      await polx
        .connect(addr[5])
        .approve(daoAdmin.address, utils.parseEther("111111111111111111"));

      await daoAdmin.connect(addr[1]).deposit(amount);
      expect(await daoAdmin.getBalance(addr[1].address)).to.eq(amount);

      await daoAdmin.connect(addr[1]).deposit(amount);
      expect(await daoAdmin.getBalance(addr[1].address)).to.eq(amount.mul(2));

      await daoAdmin.connect(addr[2]).deposit(amount);
      expect(await daoAdmin.getBalance(addr[2].address)).to.eq(amount);

      await daoAdmin.connect(addr[3]).deposit(amount);
      expect(await daoAdmin.getBalance(addr[3].address)).to.eq(amount);
    });

    it("addProposal (setPeriodDuration)", async function () {
      const calldata = daoAdmin.interface.encodeFunctionData(
        "setPeriodDuration",
        [(3600 * 23).toString()]
      );
      const startTime = (await getNodeTime()) + 100;
      await daoAdmin
        .connect(addr[1])
        .addProposal(daoAdmin.address, calldata, startTime.toString());
      await shiftTime(3600);
      await daoAdmin.connect(addr[1]).vote(0, true);
      await daoAdmin.connect(addr[2]).vote(0, true);
      await daoAdmin.connect(addr[3]).vote(0, true);

      await shiftTime(3600 * 24);

      let DAOParam = await daoAdmin.getDAOParam();
      await expect(DAOParam[1]).eq((3600 * 24).toString());

      await daoAdmin.connect(addr[1]).finishVote(0);

      DAOParam = await daoAdmin.getDAOParam();
      await expect(DAOParam[1]).eq((3600 * 23).toString());
    });

    it("addProposal (changeMinimumQuorumPercent)", async function () {
      const calldata = daoAdmin.interface.encodeFunctionData(
        "setMinimumQuorumPercent",
        [(1).toString()]
      );
      const startTime = (await getNodeTime()) + 1;
      await daoAdmin
        .connect(addr[1])
        .addProposal(daoAdmin.address, calldata, startTime.toString());

      await daoAdmin.connect(addr[1]).vote(1, true);
      await daoAdmin.connect(addr[2]).vote(1, true);
      await daoAdmin.connect(addr[3]).vote(1, true);

      await shiftTime(3600 * 23);

      let DAOParam = await daoAdmin.getDAOParam();
      await expect(DAOParam[0]).eq((3).toString());

      await daoAdmin.connect(addr[1]).finishVote(1);

      DAOParam = await daoAdmin.getDAOParam();
      await expect(DAOParam[0]).eq((1).toString());
    });

    it("addProposal (addAdmins)", async function () {
      const calldata = daoAdmin.interface.encodeFunctionData("addAdmins", [
        [addr[7].address, addr[8].address],
      ]);
      const startTime = (await getNodeTime()) + 1;
      await daoAdmin
        .connect(addr[1])
        .addProposal(daoAdmin.address, calldata, startTime.toString());

      await daoAdmin.connect(addr[1]).vote(2, true);

      await shiftTime(3600 * 23);

      daoAdmin.isWhiteList(addr[7].address);
      await expect(await daoAdmin.isWhiteList(addr[7].address)).eq(false);
      await expect(await daoAdmin.isWhiteList(addr[8].address)).eq(false);

      await daoAdmin.connect(addr[1]).finishVote(2);

      await expect(await daoAdmin.isWhiteList(addr[7].address)).eq(true);
      await expect(await daoAdmin.isWhiteList(addr[8].address)).eq(true);
    });

    it("addProposal (removeAdmins)", async function () {
      const calldata = daoAdmin.interface.encodeFunctionData("removeAdmins", [
        [addr[7].address, addr[8].address],
      ]);
      const startTime = (await getNodeTime()) + 1;
      await daoAdmin
        .connect(addr[1])
        .addProposal(daoAdmin.address, calldata, startTime.toString());

      await daoAdmin.connect(addr[1]).vote(3, true);

      await shiftTime(3600 * 23);

      daoAdmin.isWhiteList(addr[7].address);
      await expect(await daoAdmin.isWhiteList(addr[7].address)).eq(true);
      await expect(await daoAdmin.isWhiteList(addr[8].address)).eq(true);

      await daoAdmin.connect(addr[1]).finishVote(3);

      await expect(await daoAdmin.isWhiteList(addr[7].address)).eq(false);
      await expect(await daoAdmin.isWhiteList(addr[8].address)).eq(false);
    });

    it("addPoll ", async function () {
      const startTime = (await getNodeTime()) + 1;
      await daoAdmin.connect(addr[1]).addPoll(startTime);

      await shiftTime(3600 * 23);

      await daoAdmin.connect(addr[1]).finishVote(4);
      const props = await daoAdmin.getProposal(4);
      expect(props[1]).eq(3); // FAILURE
    });

    it("addProposal (mint) error", async function () {
      const assets = [WETHAddr, BNBAddr, WMATICAddr];

      const calldata = factoryAdmin.interface.encodeFunctionData("mint", [
        "1000000",
        assets,
        "IndexName",
      ]);

      const startTime = (await getNodeTime()) + 1;
      await expect(
        daoAdmin
          .connect(addr[1])
          .addProposal(daoAdmin.address, calldata, startTime.toString())
      ).revertedWith('InvalidSelector("0xf0bc238e")');
    });

    it("addProposal (addSelector - mint)", async function () {
      const selector = "0xf0bc238e";
      const calldata = daoAdmin.interface.encodeFunctionData("addSelector", [
        selector,
      ]);
      const startTime = (await getNodeTime()) + 1;
      await daoAdmin
        .connect(addr[1])
        .addProposal(daoAdmin.address, calldata, startTime.toString());
      await shiftTime(3600);
      await daoAdmin.connect(addr[1]).vote(5, true);

      await shiftTime(3600 * 23);

      expect(await daoAdmin.isValidSignature(selector)).eq(false);

      await daoAdmin.connect(addr[1]).finishVote(5);

      expect(await daoAdmin.isValidSignature(selector)).eq(true);
    });

    it("addProposal (mint)", async function () {
      const assets = [WETHAddr, BNBAddr, agEURAddr, AKTAddr, ALPHAaddr];
      const startPrice = "1000000";

      const calldata = factoryAdmin.interface.encodeFunctionData("mint", [
        startPrice,
        assets,
        "IndexName",
      ]);

      const startTime = (await getNodeTime()) + 1;
      await daoAdmin
        .connect(addr[1])
        .addProposal(factoryAdmin.address, calldata, startTime.toString());

      await daoAdmin.connect(addr[1]).vote(6, true);

      await shiftTime(3600 * 23);

      await daoAdmin.connect(addr[1]).finishVote(6);

      const props = await daoAdmin.getProposal(6);
      expect(props[1]).eq(2);
      arrIndexes = await factoryAdmin.getIndexes();
    });
  });

  let index: IndexAdmin;
  describe("NewIndex", () => {
    let indexLP: PolylasticV3;
    let usdc: PolylasticV3;
    let weth: PolylasticV3;
    let bnb: PolylasticV3;
    let wmatic: PolylasticV3;

    it("check Data", async function () {
      index = (await hre.ethers.getContractAt(
        "IndexAdmin",
        arrIndexes[0]
      )) as IndexAdmin;

      const fees = await index.getFees();
      expect(fees[0]).eq("0");
      expect(fees[1]).eq("0");

      const data = await index.getDataIndex();
      const rebalancePeriod = 3600 * 24;
      const startPrice = "1000000";

      // expect(data[1]).eq('20000000');
      expect(data[2]).eq(rebalancePeriod);
      expect(data[3]).eq(startPrice);

      indexLP = (await ethers.getContractAt(
        "PolylasticV3",
        data[0]
      )) as PolylasticV3;
    });

    it("Transfer USDT token", async function () {
      weth = (await ethers.getContractAt(
        "PolylasticV3",
        WETHAddr
      )) as PolylasticV3;
      bnb = (await ethers.getContractAt(
        "PolylasticV3",
        BNBAddr
      )) as PolylasticV3;
      wmatic = (await ethers.getContractAt(
        "PolylasticV3",
        WMATICAddr
      )) as PolylasticV3;
      usdc = (await ethers.getContractAt(
        "PolylasticV3",
        usdcAddr
      )) as PolylasticV3;

      const address = "0x21cb017b40abe17b6dfb9ba64a3ab0f24a7e60ea";
      await ethers.provider.send("hardhat_impersonateAccount", [address]);
      const signer = await ethers.getSigner(address);
      await addr[1].sendTransaction({
        to: signer.address,
        value: utils.parseEther("100"),
      });

      const amount = 2000000000;
      await usdc.connect(signer).transfer(addr[1].address, amount);
      await usdc.connect(signer).transfer(addr[2].address, amount);
      await usdc.connect(signer).transfer(addr[3].address, amount);

      expect(await usdc.balanceOf(addr[1].address)).to.equal(amount);
      expect(await usdc.balanceOf(addr[2].address)).to.equal(amount);
      expect(await usdc.balanceOf(addr[3].address)).to.equal(amount);

      await ethers.provider.send("hardhat_stopImpersonatingAccount", [address]);
    });

    it("Init Index", async function () {
      const assets = [
        {
          asset: WETHAddr, // WETH
          fixedAmount: "1000000000000000", // 0.001
          //  '2315950002234637'
          totalAmount: 0,
          path: [usdcAddr, WETHAddr],
          share: 20000000,
        },
        {
          asset: BNBAddr, // BNB
          fixedAmount: "30000000000000000", // 0.03
          totalAmount: 0,
          path: [usdcAddr, BNBAddr],
          share: 20000000,
        },

        {
          asset: agEURAddr,
          fixedAmount: "7000000000000000000", // 7
          totalAmount: 0,
          path: [usdcAddr, agEURAddr],
          share: 20000000,
        },
        {
          asset: AKTAddr,
          fixedAmount: "2000000", // 2
          totalAmount: 0,
          path: [usdcAddr, AKTAddr],
          share: 20000000,
        },

        {
          asset: ALPHAaddr,
          fixedAmount: "20000000000000000000", // 20
          totalAmount: 0,
          path: [usdcAddr, WMATICAddr, ALPHAaddr],
          share: 20000000,
        },
      ];

      await index.connect(validator).init(assets);

      expect(
        await index.connect(validator).getCostLP(utils.parseEther("1"))
      ).eq("1000010");
    });

    it("pProgram setReferrer", async function () {
      await pProgram.connect(addr[2]).setReferrer(addr[3].address);
      await pProgram.connect(addr[1]).setReferrer(addr[2].address);

      expect(await pProgram.getReferrer(addr[1].address)).eq(addr[2].address);
      await expect(
        pProgram.connect(addr[1]).setReferrer(addr[2].address)
      ).revertedWith("You have referrer");
    });

    it("stake", async function () {
      const amountLP = utils.parseEther("1");
      await usdc
        .connect(addr[1])
        .approve(index.address, utils.parseEther("1000"));
      await usdc
        .connect(addr[2])
        .approve(index.address, utils.parseEther("1000"));
      await usdc
        .connect(addr[3])
        .approve(index.address, utils.parseEther("1000"));

      await index
        .connect(addr[1])
        .stake(amountLP, await index.getCostLP(amountLP), 0);

      expect(await indexLP.balanceOf(treasure.address)).eq(
        utils.parseEther("0")
      );
      expect(await indexLP.balanceOf(addr[1].address)).eq(
        utils.parseEther("1")
      );
      expect(await indexLP.balanceOf(addr[2].address)).eq(
        utils.parseEther("0.1")
      );
      expect(await indexLP.balanceOf(addr[3].address)).eq(
        utils.parseEther("0")
      );

      await index
        .connect(addr[2])
        .stake(amountLP, await index.getCostLP(amountLP), 0);

      expect(await indexLP.balanceOf(treasure.address)).eq(
        utils.parseEther("0")
      );
      expect(await indexLP.balanceOf(addr[1].address)).eq(
        utils.parseEther("1")
      );
      expect(await indexLP.balanceOf(addr[2].address)).eq(
        utils.parseEther("1.1")
      );
      expect(await indexLP.balanceOf(addr[3].address)).eq(
        utils.parseEther("0.1")
      );

      await index
        .connect(addr[3])
        .stake(amountLP, await index.getCostLP(amountLP), 0);

      expect(await indexLP.balanceOf(treasure.address)).eq(
        utils.parseEther("0")
      );
      expect(await indexLP.balanceOf(addr[1].address)).eq(
        utils.parseEther("1")
      );
      expect(await indexLP.balanceOf(addr[2].address)).eq(
        utils.parseEther("1.1")
      );
      expect(await indexLP.balanceOf(addr[3].address)).eq(
        utils.parseEther("1.1")
      );

      expect(await usdc.balanceOf(index.address)).closeTo("0", 1e15);
      expect(await indexLP.totalSupply()).eq(utils.parseEther("3.2"));

      expect(
        await index.connect(validator).getCostLP(utils.parseEther("1"))
      ).eq("1006161");
    });
  });

  describe("DAO_Admin check IndexAdmin", () => {
    it("addProposal (setMaxShare)", async function () {
      const maxShare = 30 * 1e6;
      const calldata = index.interface.encodeFunctionData("setMaxShare", [
        maxShare,
      ]);

      const startTime = (await getNodeTime()) + 20;
      await daoAdmin
        .connect(addr[1])
        .addProposal(index.address, calldata, startTime.toString());

      await shiftTime(3600);
      await daoAdmin.connect(addr[1]).vote(7, true);

      await shiftTime(3600 * 23);

      let data = await index.getDataIndex();
      // expect(data[1]).eq((20 * 1e6).toString())

      await daoAdmin.connect(addr[1]).finishVote(7);

      const props = await daoAdmin.getProposal(7);
      expect(props[1]).eq(2);
      data = await index.getDataIndex();
      expect(data[1]).eq(maxShare);
    });

    it("addProposal (setRebalancePeriod)", async function () {
      const period = 3600 * 60;
      const calldata = index.interface.encodeFunctionData(
        "setRebalancePeriod",
        [period]
      );

      const startTime = (await getNodeTime()) + 20;
      await daoAdmin
        .connect(addr[1])
        .addProposal(index.address, calldata, startTime.toString());

      await shiftTime(3600);
      await daoAdmin.connect(addr[1]).vote(8, true);

      await shiftTime(3600 * 23);

      let data = await index.getDataIndex();
      expect(data[2]).eq((3600 * 24).toString());

      await daoAdmin.connect(addr[1]).finishVote(8);

      const props = await daoAdmin.getProposal(8);
      expect(props[1]).eq(2);
      data = await index.getDataIndex();
      expect(data[2]).eq(period);
    });

    it("addProposal (newIndexComposition)", async function () {
      const assets = [WMATICAddr, GHSTAddr, BNBAddr, WETHAddr, usdcAddr];

      const calldata = index.interface.encodeFunctionData(
        "newIndexComposition",
        [assets]
      );

      const startTime = (await getNodeTime()) + 20;
      await daoAdmin
        .connect(addr[1])
        .addProposal(index.address, calldata, startTime.toString());

      await shiftTime(3600);
      await daoAdmin.connect(addr[1]).vote(9, true);

      await shiftTime(3600 * 23);

      await daoAdmin.connect(addr[1]).finishVote(9);

      const props = await daoAdmin.getProposal(9);
      expect(props[1]).eq(2);
      const len = (await index.lengthNewAssets()).toString();
      expect(len).eq("5");
      // let data = await index.getNewAssets();
      // console.log(data)
      // expect(data).eq(assets)
    });

    it("addProposal (setPause)", async function () {
      const calldata = index.interface.encodeFunctionData("setPause");

      const startTime = (await getNodeTime()) + 20;
      await daoAdmin
        .connect(addr[1])
        .addProposal(index.address, calldata, startTime.toString());

      await shiftTime(3600);
      await daoAdmin.connect(addr[1]).vote(10, true);

      await shiftTime(3600 * 23);

      const b = await index.getStatusPause();

      expect(await index.getStatusPause()).eq(false);
      expect(b).eq(false);
      await daoAdmin.connect(addr[1]).finishVote(10);

      const props = await daoAdmin.getProposal(10);
      expect(props[1]).eq(2);
      expect(await index.getStatusPause()).eq(true);
    });
  });
});
