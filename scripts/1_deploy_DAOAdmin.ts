import config from '../config'
import { ethers, network, run } from 'hardhat'
import { DAOAdmin } from '../typechain'


const {
    POLX_ADDRESS
} = config[network.name]

const {
    MINIMUM_QUORUM_PERCENT,
    DEBATING_PERIOD_DURATION,
    WHITELIST,
    SELECTORS

} = config.DAOAdmin


function sleep(time: number) {
    return new Promise(
        resolve => setTimeout(resolve, time)
    );
}

async function main() {

    const DAOAdmin = await ethers.getContractFactory('DAOAdmin')

    const daoAdmin = await DAOAdmin.deploy(
        POLX_ADDRESS,
        MINIMUM_QUORUM_PERCENT,
        DEBATING_PERIOD_DURATION,
        WHITELIST,
        SELECTORS
    ) as DAOAdmin;

    await daoAdmin.deployed();
    console.log(`DAOAdmin has been deployed to: ${daoAdmin.address}`);

    await sleep(30000);

    console.log('starting verify DAOAdmin...')
    try {
        await run('verify:verify', {
            address: daoAdmin.address,
            constructorArguments: [
                POLX_ADDRESS,
                MINIMUM_QUORUM_PERCENT,
                DEBATING_PERIOD_DURATION,
                WHITELIST,
                SELECTORS
            ],
            contract: "contracts/DAO/DAOAdmin.sol:DAOAdmin"
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