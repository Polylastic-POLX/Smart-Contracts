import config from "../config";
import { ethers, network, run } from "hardhat";
import { PartnerProgram } from "../typechain";

const { DAO_ADMIN_ADDRESS, TRESUARE_ADDRESS } = config[network.name];

const { PERCENT_REWARD } = config.PartnerProgram;

function sleep(time: number) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

async function main() {
  const addr = await ethers.getSigners();
  const PartnerProgram = await ethers.getContractFactory("PartnerProgram");

  const partnerProgram = (await PartnerProgram.deploy(
    PERCENT_REWARD,
    DAO_ADMIN_ADDRESS
  )) as PartnerProgram;

  await partnerProgram.deployed();
  console.log(`partnerProgram has been deployed to: ${partnerProgram.address}`);

  await sleep(30000);

  console.log("starting verify Treasure...");
  try {
    await run("verify:verify", {
      address: partnerProgram.address,
      constructorArguments: [
        PERCENT_REWARD,
        TRESUARE_ADDRESS,
        DAO_ADMIN_ADDRESS,
      ],
      contract: "contracts/partnerProgram/PartnerProgram.sol:PartnerProgram",
    });
    console.log("verify success");
  } catch (e: any) {
    console.log(e.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
