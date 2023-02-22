import config from '../config'
import { ethers, network, run } from 'hardhat'
import { IndexCommunity, PartnerProgram } from '../typechain'


const {
    DAO_ADMIN_ADDRESS,
    VALIDATOR_ADDRESS,
    USDC_ADDRESS,
    ADAPTER_ADDRESS,
    TRESUARE_ADDRESS,
    PARTNER_PROGRAM,
    DAO_COMMUNITY_ADDRESS

} = config[network.name]

const {
    ASSETS,
    START_PRICE,
    REBALANCE_PERIOD,
    NAME_INDEX
} = config.IndexCommunity


function sleep(time: number) {
    return new Promise(
        resolve => setTimeout(resolve, time)
    );
}

async function main() {


    // let addr = await ethers.getSigners()
    // const IndexCommunity = await ethers.getContractFactory('IndexCommunity')

    // const indexCommunity = await IndexCommunity.deploy() as IndexCommunity;

    // await indexCommunity.deployed();
    // console.log(`indexCommunity has been deployed to: ${indexCommunity.address}`);




    // const tx = await indexCommunity.initialize
    //     (
    //         DAO_ADMIN_ADDRESS,
    //         VALIDATOR_ADDRESS,
    //         USDC_ADDRESS,
    //         ADAPTER_ADDRESS,
    //         START_PRICE,
    //         REBALANCE_PERIOD,
    //         ASSETS,
    //         TRESUARE_ADDRESS,
    //         PARTNER_PROGRAM,
    //         DAO_COMMUNITY_ADDRESS,
    //         NAME_INDEX
    //     );
    // await tx.wait();

    // console.log(`initialize ok`);
    // await sleep(30000);

    const pProgram = await ethers.getContractAt("PartnerProgram", PARTNER_PROGRAM) as PartnerProgram;
    const role = await pProgram.INDEX_ROLE();
    await pProgram.grantRole(role, '0x17808D278dEb1Ce4224d22c7E978Ae30D9655F2F'/* indexCommunity.address */);


    console.log('starting verify IndexAdmin...')
    try {
        await run('verify:verify', {
            address: '0x17808D278dEb1Ce4224d22c7E978Ae30D9655F2F' /* indexCommunity.address */,
            constructorArguments: [],
            contract: "contracts/index/IndexCommunity.sol:IndexCommunity"
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