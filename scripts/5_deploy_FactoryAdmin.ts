import config from '../config'
import { ethers, network, run } from 'hardhat'
import { FactoryAdmin } from '../typechain'


const {
    REBALANCE_PERIOD
} = config.FactoryAdmin
const {
    INDEX_ADMIN_MASTER,
    DAO_ADMIN_ADDRESS,
    VALIDATOR_ADDRESS,
    USDC_ADDRESS,
    ADAPTER_ADDRESS,
    TRESUARE_ADDRESS,
    PARTNER_PROGRAM

} = config[network.name]



function sleep(time: number) {
    return new Promise(
        resolve => setTimeout(resolve, time)
    );
}

async function main() {

    const FactoryAdmin = await ethers.getContractFactory('FactoryAdmin')

    const factory = await FactoryAdmin.deploy(
        INDEX_ADMIN_MASTER,
        DAO_ADMIN_ADDRESS,
        VALIDATOR_ADDRESS,
        USDC_ADDRESS,
        ADAPTER_ADDRESS,
        REBALANCE_PERIOD,
        TRESUARE_ADDRESS,
        PARTNER_PROGRAM

    ) as FactoryAdmin;

    await factory.deployed();
    console.log(`FactoryAdmin has been deployed to: ${factory.address}`);

    await sleep(30000);

    console.log('starting verify FactoryAdmin...')
    try {
        await run('verify:verify', {
            address: factory.address,
            constructorArguments: [
                INDEX_ADMIN_MASTER,
                DAO_ADMIN_ADDRESS,
                VALIDATOR_ADDRESS,
                USDC_ADDRESS,
                ADAPTER_ADDRESS,
                REBALANCE_PERIOD,
                TRESUARE_ADDRESS,
                PARTNER_PROGRAM
            ],
            contract: "contracts/factory/FactoryAdmin.sol:FactoryAdmin"
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