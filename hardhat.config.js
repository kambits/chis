require('@nomiclabs/hardhat-waffle')
require('dotenv').config()
// const { usePlugin } = require('@nomiclabs/buidler/config')
// usePlugin('@nomiclabs/buidler-web3')

// https://hardhat.org/guides/create-task.html
task('accounts', 'Prints the list of accounts', async () => {
    const accounts = await ethers.getSigners()

    for (const account of accounts) {
        console.info(account.address)
    }
})

// Go to https://hardhat.org/config/ to learn more

// console.info('env: ', process.env)
const { PRIVATE_KEY } = process.env
/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
    solidity: {
        version: '0.6.6',
        settings: {
            optimizer: {
                enabled: true,
                runs: 200
            }
        }
    },
    networks: {
        localhost: {
            url: 'http://localhost:8545/',
            accounts: [`0x${PRIVATE_KEY}`],
            chainId: 31337
        },
        ropsten: {
            url: `https://eth-ropsten.alchemyapi.io/v2/SxR_h_dE4t13Tw_mieLOZz4PfJ2-xyll`,
            accounts: [`0x${PRIVATE_KEY}`]
        },
        bsctest: {
            url: `https://data-seed-prebsc-1-s1.binance.org:8545`,
            accounts: [`0x${PRIVATE_KEY}`]
        }
    },
    paths: {
        sources: './contracts',
        tests: './test',
        cache: './cache',
        artifacts: './artifacts'
    },
    mocha: {
        timeout: 20000
    }
}
