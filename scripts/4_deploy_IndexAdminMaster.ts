import config from '../config'
import { ethers, network, run } from 'hardhat'
import { IndexAdmin } from '../typechain'


const {
    DAO_ADMIN_ADDRESS,
    TRESUARE_ADDRESS

} = config[network.name]


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

    console.log(`IndexAdminMaster has been deployed to: ${indexAdmin.address}`);

    await sleep(30000);

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