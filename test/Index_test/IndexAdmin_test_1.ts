import hre, { ethers, network } from "hardhat";
import {
  Treasure,
  IndexAdmin,
  PolylasticV3,
  PartnerProgram,
  DAOAdmin,
  IWETH,
} from "../../typechain";
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
let index: IndexAdmin;
let pProgram: PartnerProgram;
let daoAdmin: DAOAdmin;
let polx: PolylasticV3;
let usdc: PolylasticV3;
let weth: PolylasticV3;
let bnb: PolylasticV3;
let wmatic: PolylasticV3;
let indexLP: PolylasticV3;
let treasure: Treasure;
let DAOAddress: any;
let adminAddress: any;
let iWETH: any;
const usdcAddr = "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174";
const WETHAddr = "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619";
const BNBAddr = "0x5c4b7CCBF908E64F32e12c6650ec0C96d717f03F";
const adapter = "0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff";
const GHSTAddr = "0x385Eeac5cB85A38A9a07A70c73e0a3271CfB54A7";
const agEURAddr = "0xE0B52e49357Fd4DAf2c15e02058DCE6BC0057db4";
const AKTAddr = "0xf14fbC6B30e2c4BC05A1D4fbE34bf9f14313309D";
const wMATICaddr = "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270";
const ALPHAaddr = "0x6a3E7C3c6EF65Ee26975b12293cA1AAD7e1dAeD2";
const address0 = "0x0000000000000000000000000000000000000000";

describe("1) Index Test (stake, unstake) #1)", () => {
  it("Hardhat_reset", async function () {
    await network.provider.request({
      method: "hardhat_reset",
      params: [
        {
          forking: {
            jsonRpcUrl: process.env.ALCHEMY_API_HTTP,
            blockNumber: 31192878,
          },
        },
      ],
    });
  });

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

  // it("Deploy DAOAdmin", async function () {

  //     const [
  //         DAOAdmin,
  //     ] = await Promise.all([
  //         ethers.getContractFactory('DAOAdmin'),
  //     ])

  //     let minimumQuorumPercent = 3
  //     let debatingPeriodDuration = 3600 * 24;
  //     let whiteList = [addr[1].address, addr[2].address, addr[3].address, addr[4].address, addr[5].address]
  //     let selectors = [
  //         '0x4d148673',       //changePeriodDuration
  //         '0x00c2af11',       //changeMinimumQuorumPercent
  //         '0x4eb647bc',       // setMinimumQuorumPercent
  //         '0x7c2d6e01',       // setPeriodDuration
  //         '0xd7a1284a',       //addSelector
  //         '0x67fc22c6',       //removeSelector
  //         '0x9c54df64',       //addAdmins
  //         '0x377e11e0',       //removeAdmins
  //         '0xd5da6173',       //setMaxShare
  //         '0xc45618f5',       //setFeeStake
  //         '0x99331510',       //setFeeUnStake
  //         '0xdc53e5cf',       //setRebalancePeriod
  //         '0xbb9cd698',       //newIndexComposition
  //         '0xd431b1ac'        // setPause
  //     ]

  //     whiteList = [addr[1].address, addr[2].address, addr[3].address, addr[4].address, addr[5].address]
  //     daoAdmin = await DAOAdmin.deploy(polx.address, minimumQuorumPercent, debatingPeriodDuration, whiteList, selectors) as DAOAdmin;
  //     await polx.setBridgeContractAddress(daoAdmin.address)

  // })
  it("Deploy IndexAdmin Treasure PartnerProgram", async function () {
    addr = await ethers.getSigners();
    DAOAddress = addr[10];
    adminAddress = addr[9];
    const [Index, Treasure, PartnerProgram] = await Promise.all([
      ethers.getContractFactory("IndexAdmin"),
      ethers.getContractFactory("Treasure"),
      ethers.getContractFactory("PartnerProgram"),
    ]);

    index = (await Index.deploy()) as IndexAdmin;
    treasure = (await Treasure.deploy(DAOAddress.address)) as Treasure;
    const percentReward = [0];
    pProgram = (await PartnerProgram.deploy(
      percentReward,
      treasure.address,
      DAOAddress.address
    )) as PartnerProgram;
    index.deployed();
    treasure.deployed();

    let role = await pProgram.INDEX_ROLE();
    await pProgram.grantRole(role, index.address);

    role = await pProgram.DAO_ADMIN_ROLE();
    await pProgram.grantRole(role, index.address);
  });
  it("Transfer USDT token", async function () {
    weth = (await ethers.getContractAt(
      "PolylasticV3",
      WETHAddr
    )) as PolylasticV3;
    bnb = (await ethers.getContractAt("PolylasticV3", BNBAddr)) as PolylasticV3;
    wmatic = (await ethers.getContractAt(
      "PolylasticV3",
      wMATICaddr
    )) as PolylasticV3;
    usdc = (await ethers.getContractAt(
      "PolylasticV3",
      usdcAddr
    )) as PolylasticV3;
    iWETH = (await ethers.getContractAt("IWETH", wMATICaddr)) as IWETH;

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

  it("Initialize Index", async function () {
    const startPrice = utils.parseEther("1");
    const rebalancePeriod = 3600 * 24;
    const newAssets = [WETHAddr, BNBAddr, agEURAddr, AKTAddr, ALPHAaddr];
    await index.initialize(
      DAOAddress.address,
      adminAddress.address,
      wMATICaddr,
      adapter,
      startPrice,
      rebalancePeriod,
      newAssets,
      treasure.address,
      pProgram.address,
      "IndexName"
    );

    await expect(
      index.initialize(
        DAOAddress.address,
        adminAddress.address,
        wMATICaddr,
        adapter,
        startPrice,
        rebalancePeriod,
        newAssets,
        treasure.address,
        pProgram.address,
        "IndexName"
      )
    ).revertedWith("Initializer()");

    const [addrIndexLP] = await index.getDataIndex();

    indexLP = (await ethers.getContractAt(
      "PolylasticV3",
      addrIndexLP
    )) as PolylasticV3;

    const role = await index.connect(adminAddress).DAO_ADMIN_ROLE();
    await index.connect(adminAddress).grantRole(role, addr[10].address);
  });

  it("Init Index", async function () {
    const assets = [
      {
        asset: WETHAddr, // WETH
        fixedAmount: "0", // 0.001
        totalAmount: 0,
        path: [wMATICaddr, WETHAddr],
        share: 20000000,
      },
      {
        asset: AKTAddr,
        fixedAmount: "0", // 2
        totalAmount: 0,
        path: [wMATICaddr, usdcAddr, AKTAddr],
        share: 20000000,
      },
      {
        asset: BNBAddr, // BNB
        fixedAmount: "0", // 0.03
        totalAmount: 0,
        path: [wMATICaddr, usdcAddr, BNBAddr],
        share: 20000000,
      },

      {
        asset: agEURAddr,
        fixedAmount: "0", // 7
        totalAmount: 0,
        path: [wMATICaddr, usdcAddr, agEURAddr],
        share: 20000000,
      },

      {
        asset: ALPHAaddr,
        fixedAmount: "0", // 20
        totalAmount: 0,
        path: [wMATICaddr, ALPHAaddr],
        share: 20000000,
      },
    ];

    await index.connect(adminAddress).init(assets);

    expect(
      await index.connect(adminAddress).getCostLP(utils.parseEther("1"))
    ).eq("1000009692307965233"); // 1 MATIC
  });

  it("Stake Index", async function () {
    expect(await usdc.balanceOf(index.address)).eq("0");
    expect(await usdc.balanceOf(addr[1].address)).eq((2000 * 1e6).toString());

    await iWETH
      .connect(addr[2])
      .approve(index.address, "999999999999999999999999999999");

    const amountLP = utils.parseEther("1");

    let cost = await index.getCostLP(amountLP);
    await index.connect(addr[2]).stakeETH(amountLP, { value: cost });

    cost = await index.getCostLP(amountLP);
    await iWETH.connect(addr[2]).deposit({ value: cost });
    await index.connect(addr[2]).stake(amountLP, cost, 6);

    cost = await index.getCostLP(amountLP);
    await index.connect(addr[2]).stakeETH(amountLP, { value: cost });

    cost = await index.getCostLP(amountLP);
    await iWETH.connect(addr[2]).deposit({ value: cost });
    await index.connect(addr[2]).stake(amountLP, cost, 6);
    console.log("cost", cost);

    expect(await indexLP.balanceOf(addr[2].address)).eq(utils.parseEther("4"));
  });

  it("Unstake Index", async function () {
    await index.connect(addr[2]).unstake(utils.parseEther("0.2"));
    expect(await indexLP.balanceOf(addr[2].address)).eq(
      utils.parseEther("3.8")
    );
  });

  it("setActualToken", async function () {
    await index.connect(addr[10]).setActualToken(usdcAddr);
    shiftTime(24 * 3600);
  });

  it("rebalance with new ActualToken", async function () {
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
        path: [usdcAddr, wMATICaddr, ALPHAaddr],
        share: 20000000,
      },
    ];
    const path = [wMATICaddr, usdcAddr];

    await index.connect(adminAddress).rebalance(assets, path);

    // console.log(await index.getActiveAssets());
  });

  it("stake, unstake", async function () {
    expect(await index.getCostLP(utils.parseEther("1"))).eq("798096");

    await index.connect(addr[2]).unstake(utils.parseEther("0.2"));
    expect(await indexLP.balanceOf(addr[2].address)).eq(
      utils.parseEther("3.6")
    );

    await usdc
      .connect(addr[2])
      .approve(index.address, "999999999999999999999999999999");
    const amountLP = utils.parseEther("1");

    expect(await usdc.balanceOf(addr[2].address)).eq("2000158330");
    let cost = await index.getCostLP(amountLP);
    await index.connect(addr[2]).stake(amountLP, cost, 6);
    expect(await usdc.balanceOf(addr[2].address)).eq("1999360463");
    expect(await indexLP.balanceOf(addr[2].address)).eq(
      utils.parseEther("4.6")
    );

    cost = await index.getCostLP(amountLP);
    await expect(
      index.connect(addr[2]).stakeETH(amountLP, { value: cost })
    ).revertedWith("The current accepted token is not ETH");
  });

  it("rebalance with new ActualToken", async function () {
    shiftTime(24 * 3600);
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
        path: [usdcAddr, wMATICaddr, ALPHAaddr],
        share: 20000000,
      },
    ];
    const path = [wMATICaddr, usdcAddr];

    await index.connect(adminAddress).rebalance(assets, path);

    // console.log(await index.getActiveAssets());

    await index
      .connect(addr[2])
      .unstake(await indexLP.balanceOf(addr[2].address));
    console.log("totalSupply=", await indexLP.totalSupply());
  });
});
