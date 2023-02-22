import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { task } from 'hardhat/config'

import BigNumber from 'bignumber.js'
import config from '../config'
import { IndexAdmin, PolylasticV3, DAOAdmin, DAOCommunity } from '../typechain'
import { ethers } from 'ethers'
BigNumber.config({ EXPONENTIAL_AT: 60 });

// example:
// npx hardhat burn_dls --amount 100 --owner 0xBC6ae91F55af580B4C0E8c32D7910d00D3dbe54d --network bsc_testnet

task("test1")
    .setAction(async function (args, hre, runSuper) {
        const network = hre.network.name;
        console.log('Current network:', network)


        const contract = await hre.ethers.getContractAt("IndexAdmin", '0x91759A54a67586D1c623Bc33F0A1c9264907d3Dc') as IndexAdmin;
        const lp = await hre.ethers.getContractAt("contracts/POLX.sol:PolylasticV3", '0xa489CA307a21BE985d5C86730922d2c6713A4669') as PolylasticV3;
        const usdc = await hre.ethers.getContractAt("contracts/POLX.sol:PolylasticV3", '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174') as PolylasticV3;

        // console.log("contract address:", contract.address);
        // let data = await contract.getDataIndex();
        // console.log(data)
        // await usdc.approve(contract.address, '99999999999999999999');
        let amountLP = '1000000000000000000'
        // await contract.stake(amountLP, await contract.getCostLP(amountLP), 1);
        // await contract.unstake(amountLP);
        console.log('bal = ', await lp.balanceOf('0x790382B59476c76170aceB3b6e6e81CE46899Dc6'))

        // console.log(await contract._wETH())

    });
