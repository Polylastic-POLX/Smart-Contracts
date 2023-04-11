import hre, { ethers, network } from "hardhat";
import { PartnerProgram, IndexLP, PolylasticV3, DAOAdmin } from "../typechain";
import BigNumber from "bignumber.js";
import { utils } from "ethers";
import { expect } from "chai";
import { connect } from "http2";

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

describe("1)  Test PartnerProgram #1)", () => {
  let addr: any;
  let polx: PolylasticV3;
  let daoAdmin: DAOAdmin;
  let pProgram: PartnerProgram;
  let indexLP: IndexLP;
  let IndexAddr: any;
  let owner: any;
  let DAOAdmin: any;

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

  it("Deploy PartnerProgram", async function () {
    addr = await ethers.getSigners();
    const [PartnerProgram] = await Promise.all([
      ethers.getContractFactory("PartnerProgram"),
    ]);
    owner = addr[9];
    DAOAdmin = addr[10];
    IndexAddr = addr[8];

    const percentReward = [10000000, 5000000];
    pProgram = (await PartnerProgram.deploy(
      percentReward,
      daoAdmin.address
    )) as PartnerProgram;

    const INDEX_ROLE = await pProgram.INDEX_ROLE();
    await pProgram.grantRole(INDEX_ROLE, IndexAddr.address);
  });

  it("Deploy IndexLP", async function () {
    addr = await ethers.getSigners();
    const [IndexLP] = await Promise.all([ethers.getContractFactory("IndexLP")]);

    indexLP = (await IndexLP.deploy(pProgram.address)) as IndexLP;
    await indexLP.mint(addr[1].address, utils.parseEther("100"));
  });

  it("DistributeTheReward", async function () {
    expect(await pProgram.getReferrer(addr[1].address)).eq(
      "0x0000000000000000000000000000000000000000"
    );
    await pProgram.connect(addr[2]).setReferrer(addr[3].address);
    await pProgram.connect(addr[1]).setReferrer(addr[2].address);

    expect(await pProgram.getReferrer(addr[1].address)).eq(addr[2].address);
    await expect(
      pProgram.connect(addr[1]).setReferrer(addr[2].address)
    ).revertedWith("You have referrer");

    console.log(
      "balanceOf(addr[1].address=",
      await indexLP.balanceOf(addr[1].address)
    );
    console.log(
      "balanceOf(addr[2].address=",
      await indexLP.balanceOf(addr[2].address)
    );

    await pProgram
      .connect(IndexAddr)
      .distributeTheReward(
        addr[1].address,
        utils.parseEther("100"),
        indexLP.address
      );

    console.log(
      "balanceOf(addr[2].address=",
      await indexLP.balanceOf(addr[2].address)
    );
    console.log(
      "balanceOf(addr[3].address=",
      await indexLP.balanceOf(addr[3].address)
    );
    console.log("balanceOf(owner=", await indexLP.balanceOf(owner.address));
  });
});
