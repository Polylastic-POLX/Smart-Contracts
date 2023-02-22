import config from '../config'
import { ethers, network, run } from 'hardhat'
import { IndexAdmin, PartnerProgram } from '../typechain'


const {
    DAO_ADMIN_ADDRESS,
    VALIDATOR_ADDRESS,
    USDC_ADDRESS,
    ADAPTER_ADDRESS,
    TRESUARE_ADDRESS,
    PARTNER_PROGRAM

} = config[network.name]

const {
    ASSETS,
    START_PRICE,
    REBALANCE_PERIOD,
    NAME_INDEX
} = config.IndexAdmin



function sleep(time: number) {
    return new Promise(
        resolve => setTimeout(resolve, time)
    );
}

async function main() {

    let addr = await ethers.getSigners()
    const IndexAdmin = await ethers.getContractFactory('IndexAdmin')

    const indexAdmin = await IndexAdmin.deploy() as IndexAdmin;

    await indexAdmin.deployed();

    console.log(`IndexAdmin has been deployed to: ${indexAdmin.address}`);


    const tx = await indexAdmin.initialize
        (
            DAO_ADMIN_ADDRESS,
            VALIDATOR_ADDRESS,
            USDC_ADDRESS,
            ADAPTER_ADDRESS,
            START_PRICE,
            REBALANCE_PERIOD,
            ASSETS,
            TRESUARE_ADDRESS,
            PARTNER_PROGRAM,
            NAME_INDEX
        );
    await tx.wait();

    console.log(`initialize ok`);

    await sleep(30000);
    const pProgram = await ethers.getContractAt("PartnerProgram", PARTNER_PROGRAM) as PartnerProgram;
    const role = await pProgram.INDEX_ROLE();
    await pProgram.grantRole(role, indexAdmin.address);
    console.log(`grantRole ok`);



    console.log('starting verify IndexAdmin...')
    try {
        await run('verify:verify', {
            address: indexAdmin.address,
            constructorArguments: [],
            contract: "contracts/index/IndexAdmin.sol:IndexAdmin"
        });
        console.log('verify success')
    } catch (e: any) {
        console.log(e.message)
    }
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });