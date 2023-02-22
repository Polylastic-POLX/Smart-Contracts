import config from '../config'
import { ethers, network, run } from 'hardhat'
import { DAOAdmin } from '../typechain'


const {
    VALIDATOR_ADDRESS,
    USDC_ADDRESS,
    ADAPTER_ADDRESS,
    POLX_ADDRESS,
    TRESUARE_ADDRESS,
    PARTNER_PROGRAM,
    DAO_ADMIN_ADDRESS,
    INDEX_ADMIN_MASTER,
    FACTORY_ADMIN_ADDRESS,
    INDEX_ADMIN_1,
    INDEX_ADMIN_2,
    DAO_COMMUNITY_ADDRESS,
    INDEX_COMMUNITY_MASTER,
    FACTORY_COMMUNITY_ADDRESS,
    INDEX_COMMUNITY_1,
    INDEX_COMMUNITY_2,
} = config[network.name]



function sleep(time: number) {
    return new Promise(
        resolve => setTimeout(resolve, time)
    );
}

async function main() {

    {
        const {
            MINIMUM_QUORUM_PERCENT,
            DEBATING_PERIOD_DURATION,
            WHITELIST,
            SELECTORS

        } = config.DAOAdmin
        console.log('starting verify DAOAdmin...')
        try {
            await run('verify:verify', {
                address: DAO_ADMIN_ADDRESS,
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

    {
        console.log('starting verify Treasure...')
        try {
            await run('verify:verify', {
                address: TRESUARE_ADDRESS,
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

    {
        const {
            PERCENT_REWARD
        } = config.PartnerProgram
        console.log('starting verify Treasure...')
        try {
            await run('verify:verify', {
                address: PARTNER_PROGRAM,
                constructorArguments: [
                    PERCENT_REWARD,
                    TRESUARE_ADDRESS,
                    DAO_ADMIN_ADDRESS
                ],
                contract: "contracts/partnerProgram/PartnerProgram.sol:PartnerProgram"
            });
            console.log('verify success')
        } catch (e: any) {
            console.log(e.message)
        }
    }

    {
        console.log('starting verify IndexAdmin...')
        try {
            await run('verify:verify', {
                address: INDEX_ADMIN_MASTER,
                constructorArguments: [],
                contract: "contracts/index/IndexAdmin.sol:IndexAdmin"
            });
            console.log('verify success')
        } catch (e: any) {
            console.log(e.message)
        }
    }

    {
        const {
            REBALANCE_PERIOD
        } = config.FactoryAdmin
        console.log('starting verify FactoryAdmin...')
        try {
            await run('verify:verify', {
                address: FACTORY_ADMIN_ADDRESS,
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

    {
        const {
            MINIMUM_QUORUM_PERCENT,
            DEBATING_PERIOD_DURATION,
            SELECTORS

        } = config.DAOCommunity
        console.log('starting verify DAOCommunity...')
        try {
            await run('verify:verify', {
                address: DAO_COMMUNITY_ADDRESS,
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


    {
        console.log('starting verify IndexAdmin...')
        try {
            await run('verify:verify', {
                address: INDEX_COMMUNITY_MASTER,
                constructorArguments: [],
                contract: "contracts/index/IndexCommunity.sol:IndexCommunity"
            });
            console.log('verify success')
        } catch (e: any) {
            console.log(e.message)
        }

    }

    {
        const {
            REBALANCE_PERIOD
        } = config.FactoryCommunity
        console.log('starting verify FactoryCommunity...')
        try {
            await run('verify:verify', {
                address: FACTORY_COMMUNITY_ADDRESS,
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

}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });