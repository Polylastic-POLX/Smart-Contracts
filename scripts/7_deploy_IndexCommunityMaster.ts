import config from '../config'
import { ethers, network, run } from 'hardhat'
import { IndexCommunity } from '../typechain'


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
    const IndexCommunity = await ethers.getContractFactory('IndexCommunity')

    const indexCommunity = await IndexCommunity.deploy() as IndexCommunity;

    await indexCommunity.deployed();

    console.log(`indexCommunity has been deployed to: ${indexCommunity.address}`);

    await sleep(30000);

    console.log('starting verify IndexAdmin...')
    try {
        await run('verify:verify', {
            address: indexCommunity.address,
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