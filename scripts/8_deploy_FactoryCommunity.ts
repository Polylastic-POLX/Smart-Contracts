import config from '../config'
import { ethers, network, run } from 'hardhat'
import { FactoryCommunity } from '../typechain'


const {
    REBALANCE_PERIOD
} = config.FactoryCommunity

const {
    INDEX_COMMUNITY_MASTER,
    DAO_ADMIN_ADDRESS,
    DAO_COMMUNITY_ADDRESS,
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

    const FactoryCommunity = await ethers.getContractFactory('FactoryCommunity')

    const factory = await FactoryCommunity.deploy(
        INDEX_COMMUNITY_MASTER,
        DAO_ADMIN_ADDRESS,
        DAO_COMMUNITY_ADDRESS,
        VALIDATOR_ADDRESS,
        USDC_ADDRESS,
        ADAPTER_ADDRESS,
        REBALANCE_PERIOD,
        TRESUARE_ADDRESS,
        PARTNER_PROGRAM
    ) as FactoryCommunity;

    await factory.deployed();
    console.log(`FactoryCommunity has been deployed to: ${factory.address}`);

    await sleep(30000);

    console.log('starting verify FactoryCommunity...')
    try {
        await run('verify:verify', {
            address: factory.address,
            constructorArguments: [
                INDEX_COMMUNITY_MASTER,
                DAO_ADMIN_ADDRESS,
                DAO_COMMUNITY_ADDRESS,
                VALIDATOR_ADDRESS,
                USDC_ADDRESS,
                ADAPTER_ADDRESS,
                REBALANCE_PERIOD,
                TRESUARE_ADDRESS,
                PARTNER_PROGRAM
            ],
            contract: "contracts/factory/FactoryCommunity.sol:FactoryCommunity"
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