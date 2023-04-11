import config from "../config";
import { ethers, network, run } from "hardhat";
import {
  DAOAdmin,
  Treasure,
  PartnerProgram,
  IndexAdmin,
  FactoryAdmin,
  DAOCommunity,
  IndexCommunity,
  FactoryCommunity,
} from "../typechain";

function sleep(time: number) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

let daoAdmin: DAOAdmin;
let treasure: Treasure;
let partnerProgram: PartnerProgram;
let factory: FactoryAdmin;
let indexAdmin: IndexAdmin;
let daoCommunity: DAOCommunity;
let factoryComm: FactoryCommunity;
let indexCommunity: IndexCommunity;

async function main() {
  const { POLX_ADDRESS, VALIDATOR_ADDRESS, USDC_ADDRESS, ADAPTER_ADDRESS } =
    config[network.name];

  const [
    DAOAdmin,
    Treasure,
    IndexAdmin,
    FactoryCommunity,
    IndexCommunity,
    DAOCommunity,
    FactoryAdmin,
    PartnerProgram,
  ] = await Promise.all([
    ethers.getContractFactory("DAOAdmin"),
    ethers.getContractFactory("Treasure"),
    ethers.getContractFactory("IndexAdmin"),
    ethers.getContractFactory("FactoryCommunity"),
    ethers.getContractFactory("IndexCommunity"),
    ethers.getContractFactory("DAOCommunity"),
    ethers.getContractFactory("FactoryAdmin"),
    ethers.getContractFactory("PartnerProgram"),
  ]);

  {
    const {
      MINIMUM_QUORUM_PERCENT,
      DEBATING_PERIOD_DURATION,
      WHITELIST,
      SELECTORS,
    } = config.DAOAdmin;

    daoAdmin = (await DAOAdmin.deploy(
      POLX_ADDRESS,
      MINIMUM_QUORUM_PERCENT,
      DEBATING_PERIOD_DURATION,
      WHITELIST,
      SELECTORS
    )) as DAOAdmin;
    await daoAdmin.deployed();
    console.log(`DAOAdmin has been deployed to: ${daoAdmin.address}`);
  }

  {
    treasure = (await Treasure.deploy(daoAdmin.address)) as Treasure;
    await treasure.deployed();
    console.log(`Treasure has been deployed to: ${treasure.address}`);
  }

  {
    const { PERCENT_REWARD } = config.PartnerProgram;

    partnerProgram = (await PartnerProgram.deploy(
      PERCENT_REWARD,
      daoAdmin.address
    )) as PartnerProgram;
    await partnerProgram.deployed();
    console.log(
      `partnerProgram has been deployed to: ${partnerProgram.address}`
    );
  }

  {
    indexAdmin = (await IndexAdmin.deploy()) as IndexAdmin;
    await indexAdmin.deployed();
    console.log(`IndexAdminMaster has been deployed to: ${indexAdmin.address}`);
  }

  {
    const { REBALANCE_PERIOD } = config.FactoryAdmin;

    factory = (await FactoryAdmin.deploy(
      indexAdmin.address,
      daoAdmin.address,
      VALIDATOR_ADDRESS,
      USDC_ADDRESS,
      ADAPTER_ADDRESS,
      REBALANCE_PERIOD,
      treasure.address,
      partnerProgram.address
    )) as FactoryAdmin;
    await factory.deployed();

    const role = await partnerProgram.FABRIC_ROLE();
    await partnerProgram.grantRole(role, factory.address);

    console.log(`FactoryAdmin has been deployed to: ${factory.address}`);
  }

  {
    const { MINIMUM_QUORUM_PERCENT, DEBATING_PERIOD_DURATION, SELECTORS } =
      config.DAOCommunity;

    daoCommunity = (await DAOCommunity.deploy(
      POLX_ADDRESS,
      MINIMUM_QUORUM_PERCENT,
      DEBATING_PERIOD_DURATION,
      SELECTORS,
      daoAdmin.address
    )) as DAOCommunity;
    await daoCommunity.deployed();
    console.log(`DAOCommunity has been deployed to: ${daoCommunity.address}`);
  }
  {
    indexCommunity = (await IndexCommunity.deploy()) as IndexCommunity;
    await indexCommunity.deployed();
    console.log(
      `indexCommunity has been deployed to: ${indexCommunity.address}`
    );
  }

  {
    const { REBALANCE_PERIOD } = config.FactoryCommunity;

    factoryComm = (await FactoryCommunity.deploy(
      indexCommunity.address,
      daoAdmin.address,
      daoCommunity.address,
      VALIDATOR_ADDRESS,
      USDC_ADDRESS,
      ADAPTER_ADDRESS,
      REBALANCE_PERIOD,
      treasure.address,
      partnerProgram.address
    )) as FactoryCommunity;
    await factoryComm.deployed();

    const role = await partnerProgram.FABRIC_ROLE();
    await partnerProgram.grantRole(role, factoryComm.address);

    console.log(
      `FactoryCommunity has been deployed to: ${factoryComm.address}`
    );
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
