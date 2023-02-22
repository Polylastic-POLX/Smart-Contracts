import config from '../config'
import { ethers, network, run } from 'hardhat'
import { PolylasticV3 } from '../typechain'


const {
    NAME,
    SYMBOL,
    INITIAL_SUPPLY,

} = config.POLX

async function main() {

    let addr = await ethers.getSigners()
    const PolylasticV3 = await ethers.getContractFactory('PolylasticV3')

    const polx = await PolylasticV3.deploy(
        NAME,
        SYMBOL,
        INITIAL_SUPPLY,
        addr[0].address
    ) as PolylasticV3;

    await polx.deployed();
    console.log(`PolylasticV3 has been deployed to: ${polx.address}`);


    console.log('starting verify IDO...')
    try {
        await run('verify:verify', {
            address: polx.address,
            constructorArguments: [
                NAME,
                SYMBOL,
                INITIAL_SUPPLY,
                addr[0].address
            ],
            contract: "contracts/POLX.sol:PolylasticV3"
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