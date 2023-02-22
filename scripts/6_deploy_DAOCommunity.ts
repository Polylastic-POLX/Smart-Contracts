import config from '../config'
import { ethers, network, run } from 'hardhat'
import { DAOCommunity } from '../typechain'


const {
    POLX_ADDRESS,
    DAO_ADMIN_ADDRESS
} = config[network.name]

const {
    MINIMUM_QUORUM_PERCENT,
    DEBATING_PERIOD_DURATION,
    SELECTORS

} = config.DAOCommunity

function sleep(time: number) {
    return new Promise(
        resolve => setTimeout(resolve, time)
    );
}

async function main() {

    const DAOCommunity = await ethers.getContractFactory('DAOCommunity')

    const daoCommunity = await DAOCommunity.deploy(
        POLX_ADDRESS,
        MINIMUM_QUORUM_PERCENT,
        DEBATING_PERIOD_DURATION,
        SELECTORS,
        DAO_ADMIN_ADDRESS

    ) as DAOCommunity;

    await daoCommunity.deployed();
    console.log(`DAOCommunity has been deployed to: ${daoCommunity.address}`);

    await sleep(30000);

    console.log('starting verify DAOCommunity...')
    try {
        await run('verify:verify', {
            address: daoCommunity.address,
            constructorArguments: [
                POLX_ADDRESS,
                MINIMUM_QUORUM_PERCENT,
                DEBATING_PERIOD_DURATION,
                SELECTORS,
                DAO_ADMIN_ADDRESS
            ],
            contract: "contracts/DAO/DAOCommunity.sol:DAOCommunity"
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