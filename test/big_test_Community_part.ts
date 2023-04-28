import hre, { ethers, network } from "hardhat";
import {
  PolylasticV3,
  DAOAdmin,
  PartnerProgram,
  IndexCommunity,
  Treasure,
  FactoryCommunity,
  DAOCommunity,
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
let daoCommunity: DAOCommunity;
let daoAdmin: DAOAdmin;
let indexMaster: IndexCommunity;
let treasure: Treasure;
let factoryCommunity: FactoryCommunity;
let pProgram: PartnerProgram;
let validator: any;


describe("1) Big test Community #2)", () => {
  describe("Deploy: PLX, DAOAdmin, Treasure, IndexCommunity_Master, FactoryAdmin", () => {
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
        daoAdmin.address
      )) as PartnerProgram;
    });

    it("Deploy IndexCommunity_Master", async function () {
      const [IndexMaster] = await Promise.all([
        ethers.getContractFactory("IndexCommunity"),
      ]);
      indexMaster = (await IndexMaster.deploy()) as IndexCommunity;
    });

    it("Deploy DAOCommunity", async function () {
      const [DAOCommunity] = await Promise.all([
        ethers.getContractFactory("DAOCommunity"),
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
        // CommunityIndex
        "0x4d148673", // changePeriodDuration
        "0x7475071f", // incrementMaxAssets
        "0xef00325a", // decrementMaxAssets
        "0x6746eb7c", // excludeAsset
        "0x8f08f324", // includeAsset
        // '0x4e6cca8f'        // mint
      ];

      whiteList = [
        addr[1].address,
        addr[2].address,
        addr[3].address,
        addr[4].address,
        addr[5].address,
      ];
      daoCommunity = (await DAOCommunity.deploy(
        polx.address,
        minimumQuorumPercent,
        debatingPeriodDuration,
        selectors,
        daoAdmin.address
      )) as DAOCommunity;
      await polx.setBridgeContractAddress(daoAdmin.address);
    });

    it("DAO deposit", async function () {
      const amount = utils.parseEther("100");
      await polx
        .connect(addr[1])
        .approve(daoCommunity.address, utils.parseEther("111111111111111111"));
      await polx
        .connect(addr[2])
        .approve(daoCommunity.address, utils.parseEther("111111111111111111"));
      await polx
        .connect(addr[3])
        .approve(daoCommunity.address, utils.parseEther("111111111111111111"));
      await polx
        .connect(addr[4])
        .approve(daoCommunity.address, utils.parseEther("111111111111111111"));
      await polx
        .connect(addr[5])
        .approve(daoCommunity.address, utils.parseEther("111111111111111111"));

      await daoCommunity.connect(addr[1]).deposit(amount);
      expect(await daoCommunity.getBalance(addr[1].address)).to.eq(amount);

      await daoCommunity.connect(addr[1]).deposit(amount);
      expect(await daoCommunity.getBalance(addr[1].address)).to.eq(
        amount.mul(2)
      );

      await daoCommunity.connect(addr[2]).deposit(amount);
      expect(await daoCommunity.getBalance(addr[2].address)).to.eq(amount);

      await daoCommunity.connect(addr[3]).deposit(amount);
      expect(await daoCommunity.getBalance(addr[3].address)).to.eq(amount);
    });

    it("addProposal (setPeriodDuration)", async function () {
      const calldata = daoCommunity.interface.encodeFunctionData(
        "changePeriodDuration",
        [(2678400).toString()]
      );
      const startTime = (await getNodeTime()) + 100;
      await daoCommunity
        .connect(addr[1])
        .addProposal(daoCommunity.address, calldata, startTime.toString());
      await shiftTime(3600);
      await daoCommunity.connect(addr[1]).vote(0, true);
      await daoCommunity.connect(addr[2]).vote(0, true);
      await daoCommunity.connect(addr[3]).vote(0, true);

      await shiftTime(3600 * 24);

      let DAOParam = await daoCommunity.getDAOParam();
      await expect(DAOParam[1]).eq((3600 * 24).toString());

      await daoCommunity.connect(addr[1]).finishVote(0);

      DAOParam = await daoCommunity.getDAOParam();
      await expect(DAOParam[1]).eq((3600 * 24).toString());

      const props = await daoCommunity.getProposal(0);
      expect(props[1]).eq(4);
    });
  });
});
