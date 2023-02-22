import config from '../config'
import { ethers, network, run } from 'hardhat'
import { Treasure } from '../typechain'

const {
    DAO_ADMIN_ADDRESS,
} = config[network.name]


function sleep(time: number) {
    return new Promise(
        resolve => setTimeout(resolve, time)
    );
}

async function main() {

    let addr = await ethers.getSigners()
    const Treasure = await ethers.getContractFactory('Treasure')

    const treasure = await Treasure.deploy(
        DAO_ADMIN_ADDRESS
    ) as Treasure;

    await treasure.deployed();
    console.log(`Treasure has been deployed to: ${treasure.address}`);

    await sleep(40000);

    console.log('starting verify Treasure...')
    try {
        await run('verify:verify', {
            address: treasure.address,
            constructorArguments: [
                DAO_ADMIN_ADDRESS
            ],
            contract: "contracts/Treasure.sol:Treasure"
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