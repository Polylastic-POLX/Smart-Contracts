import hre, { ethers, network } from "hardhat";
import {
  Treasure,
  IndexAdmin,
  PolylasticV3,
  PartnerProgram,
  DAOAdmin,
  IWETH,
  IndexLP,
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
let matic: PolylasticV3;
let mv: PolylasticV3;
let sand: PolylasticV3;
let astrafer: PolylasticV3;
let welt: PolylasticV3;
let fyn: PolylasticV3;
let tel: PolylasticV3;
let usdc: PolylasticV3;
let lp: IndexLP;

let index: IndexAdmin;
let treasure: Treasure;
let pProgram: PartnerProgram;
let DAOAddress: any;
let adminAddress: any;

describe("1) Index Test (stake, unstake) #1)", () => {
  it("Hardhat_reset", async function () {
    await network.provider.request({
      method: "hardhat_reset",
      params: [
        {
          forking: {
            jsonRpcUrl: process.env.ALCHEMY_API_HTTP,
            blockNumber: 37175868,
          },
        },
      ],
    });
  });

  it("getContractAt tokens", async function () {
    polx = (await ethers.getContractAt(
      "contracts/POLX.sol:PolylasticV3",
      "0x187Ae45f2D361CbCE37c6A8622119c91148F261b"
    )) as PolylasticV3;
    matic = (await ethers.getContractAt(
      "contracts/POLX.sol:PolylasticV3",
      "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270"
    )) as PolylasticV3;
    mv = (await ethers.getContractAt(
      "contracts/POLX.sol:PolylasticV3",
      "0xa3c322ad15218fbfaed26ba7f616249f7705d945"
    )) as PolylasticV3;
    sand = (await ethers.getContractAt(
      "contracts/POLX.sol:PolylasticV3",
      "0xbbba073c31bf03b8acf7c28ef0738decf3695683"
    )) as PolylasticV3;
    astrafer = (await ethers.getContractAt(
      "contracts/POLX.sol:PolylasticV3",
      "0xDfCe1e99A31C4597a3f8A8945cBfa9037655e335"
    )) as PolylasticV3;
    welt = (await ethers.getContractAt(
      "contracts/POLX.sol:PolylasticV3",
      "0x23e8b6a3f6891254988b84da3738d2bfe5e703b9"
    )) as PolylasticV3;
    fyn = (await ethers.getContractAt(
      "contracts/POLX.sol:PolylasticV3",
      "0x3B56a704C01D650147ADE2b8cEE594066b3F9421"
    )) as PolylasticV3;
    tel = (await ethers.getContractAt(
      "contracts/POLX.sol:PolylasticV3",
      "0xdF7837DE1F2Fa4631D716CF2502f8b230F1dcc32"
    )) as PolylasticV3;
    usdc = (await ethers.getContractAt(
      "PolylasticV3",
      "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174"
    )) as PolylasticV3;
  });

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
      DAOAddress.address
    )) as PartnerProgram;
    index.deployed();
    treasure.deployed();

    let role = await pProgram.INDEX_ROLE();
    await pProgram.grantRole(role, index.address);

    role = await pProgram.DAO_ADMIN_ROLE();
    await pProgram.grantRole(role, index.address);
  });

  it("Transfer USDC", async function () {
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
    const adapter = "0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff";
    const newAssets = [
      polx.address,
      matic.address,
      mv.address,
      sand.address,
      astrafer.address,
      welt.address,
      fyn.address,
      tel.address,
    ];
    const startPrice = 1000000;
    const rebalancePeriod = 7200;
    const NAME_INDEX = "Polyastic DeFi Index";

    await index.initialize(
      DAOAddress.address,
      adminAddress.address,
      usdc.address,
      adapter,
      startPrice,
      rebalancePeriod,
      newAssets,
      treasure.address,
      pProgram.address,
      NAME_INDEX
    );

    await expect(
      index.initialize(
        DAOAddress.address,
        adminAddress.address,
        usdc.address,
        adapter,
        startPrice,
        rebalancePeriod,
        newAssets,
        treasure.address,
        pProgram.address,
        NAME_INDEX
      )
    ).revertedWith("Initializer()");

    const [addrIndexLP] = await index.getDataIndex();

    lp = (await ethers.getContractAt("IndexLP", addrIndexLP)) as IndexLP;

    const role = await index.connect(adminAddress).DAO_ADMIN_ROLE();
    await index.connect(adminAddress).grantRole(role, addr[10].address);
  });

  it("Init", async function () {
    const assets = [
      {
        asset: "0x187Ae45f2D361CbCE37c6A8622119c91148F261b",
        path: [
          "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
          "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
          "0x187Ae45f2D361CbCE37c6A8622119c91148F261b",
        ],
        share: "273741",
      },
      {
        asset: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
        path: [
          "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
          "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
        ],
        share: "20000000",
      },
      {
        asset: "0xA3c322Ad15218fBFAEd26bA7f616249f7705D945",
        path: [
          "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
          "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
          "0xA3c322Ad15218fBFAEd26bA7f616249f7705D945",
        ],
        share: "17284113",
      },
      {
        asset: "0xBbba073C31bF03b8ACf7c28EF0738DeCF3695683",
        path: [
          "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
          "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
          "0xBbba073C31bF03b8ACf7c28EF0738DeCF3695683",
        ],
        share: "20000000",
      },
      {
        asset: "0xDfCe1e99A31C4597a3f8A8945cBfa9037655e335",
        path: [
          "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
          "0xDfCe1e99A31C4597a3f8A8945cBfa9037655e335",
        ],
        share: "15631394",
      },
      {
        asset: "0x23E8B6A3f6891254988B84Da3738D2bfe5E703b9",
        path: [
          "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
          "0x23E8B6A3f6891254988B84Da3738D2bfe5E703b9",
        ],
        share: "192177",
      },
      {
        asset: "0x3B56a704C01D650147ADE2b8cEE594066b3F9421",
        path: [
          "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
          "0x3B56a704C01D650147ADE2b8cEE594066b3F9421",
        ],
        share: "6618574",
      },
      {
        asset: "0xdF7837DE1F2Fa4631D716CF2502f8b230F1dcc32",
        path: [
          "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
          "0xdF7837DE1F2Fa4631D716CF2502f8b230F1dcc32",
        ],
        share: "20000000",
      },
    ];

    await index.connect(adminAddress).init(assets);
    // expect(await index.connect(adminAddress).getCostLP(utils.parseEther('1'))).eq('1000100')
  });

  it("Stake", async function () {
    console.log("balanceOf", await usdc.balanceOf(index.address));
    const amountUSD = ethers.utils.parseUnits("1", 6);
    const slippage = ethers.utils.parseUnits("1", 4);
    await usdc.connect(addr[2]).approve(index.address, 100 * 1e6);
    await index
      .connect(addr[2])
      .stake(utils.parseEther("1"), amountUSD.add(slippage));

    await usdc.connect(addr[2]).approve(index.address, 100 * 1e6);
    await index
      .connect(addr[2])
      .stake(utils.parseEther("1"), amountUSD.add(slippage));
    console.log("balanceOf", await usdc.balanceOf(index.address));
  });

  it("unstake", async function () {
    await index.connect(addr[2]).unstake(utils.parseEther("1"));

    console.log("balanceOf", await usdc.balanceOf(index.address));
  });

  it("rebalance", async function () {
    const assets = [
      {
        asset: "0x187Ae45f2D361CbCE37c6A8622119c91148F261b",
        path: [
          "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
          "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
          "0x187Ae45f2D361CbCE37c6A8622119c91148F261b",
        ],
        share: "273741",
      },
      {
        asset: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
        path: [
          "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
          "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
        ],
        share: "20000000",
      },
      {
        asset: "0xA3c322Ad15218fBFAEd26bA7f616249f7705D945",
        path: [
          "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
          "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
          "0xA3c322Ad15218fBFAEd26bA7f616249f7705D945",
        ],
        share: "17284113",
      },
      {
        asset: "0xBbba073C31bF03b8ACf7c28EF0738DeCF3695683",
        path: [
          "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
          "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
          "0xBbba073C31bF03b8ACf7c28EF0738DeCF3695683",
        ],
        share: "20000000",
      },
      {
        asset: "0xDfCe1e99A31C4597a3f8A8945cBfa9037655e335",
        path: [
          "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
          "0xDfCe1e99A31C4597a3f8A8945cBfa9037655e335",
        ],
        share: "15631394",
      },
      {
        asset: "0x23E8B6A3f6891254988B84Da3738D2bfe5E703b9",
        path: [
          "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
          "0x23E8B6A3f6891254988B84Da3738D2bfe5E703b9",
        ],
        share: "192177",
      },
      {
        asset: "0x3B56a704C01D650147ADE2b8cEE594066b3F9421",
        path: [
          "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
          "0x3B56a704C01D650147ADE2b8cEE594066b3F9421",
        ],
        share: "6618574",
      },
      {
        asset: "0xdF7837DE1F2Fa4631D716CF2502f8b230F1dcc32",
        path: [
          "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
          "0xdF7837DE1F2Fa4631D716CF2502f8b230F1dcc32",
        ],
        share: "20000000",
      },
    ];
    console.log("1polx", await polx.balanceOf(index.address));
    console.log("1matic", await matic.balanceOf(index.address));

    console.log("getCostLP", await index.getCostLP(utils.parseEther("1")));

    await shiftTime(7200);
    await index.connect(adminAddress).rebalance(assets, []);
    console.log("getCostLP", await index.getCostLP(utils.parseEther("1")));
    console.log("2polx", await polx.balanceOf(index.address));
    console.log("2matic", await matic.balanceOf(index.address));

    await index.connect(addr[2]).unstake(utils.parseEther("1"));

    console.log("3polx", await polx.balanceOf(index.address));
    console.log("3matic", await matic.balanceOf(index.address));
    // await mv
    // await sand
    // await astrafer
    // await welt
    // await fyn
    // await tel
    // await usdc
  });
});
