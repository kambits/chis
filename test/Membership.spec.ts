import chai, { expect } from 'chai'
import { Contract } from 'ethers'
import { solidity, MockProvider, deployContract } from 'ethereum-waffle'
import { ether, toEther, parseUnits } from './shared/util'

import Membership from '../build/Membership.json'

chai.use(solidity)

const overrides = {
    gasLimit: 9999999,
    gasPrice: 0
}

describe('Membership', () => {
    const provider = new MockProvider({
        ganacheOptions: {
            gasLimit: 9999999
        }
    })
    const [walletDeployer, walletAlice, walletBob] = provider.getWallets()

    let contract: Contract


    beforeEach(async () => {
        contract = await deployContract(walletDeployer, Membership, [], overrides)
    })

    it('Total member', async () => {
        expect(await contract.totalMember()).to.eq(0)
    })

    it('Is member', async () => {
        expect(await contract.isMember(walletAlice.address)).to.eq(false)
    })

    it('Member fee', async () => {
        expect(await contract.memberFeeMap(0)).to.eq(ether(1))
        expect(await contract.memberFeeMap(1)).to.eq(ether(5))
        expect(await contract.memberFeeMap(2)).to.eq(ether(30))
    })

    it('Premium VIP1', async () => {
        await contract.connect(walletAlice).premium(walletAlice.address, 0, walletBob.address, {
            gasLimit: 9999999,
            gasPrice: 0,
            value: ether(1)
        })
        expect(await contract.isMember(walletAlice.address)).to.eq(true)
        expect(await contract.memberTypeMap(walletAlice.address)).to.eq(0)
        console.info("owner balance: ", toEther(await walletDeployer.getBalance()))
        console.info("bob balance: ",  toEther(await walletBob.getBalance()))
    })

    it('Premium VIP7', async () => {
        await contract.connect(walletAlice).premium(walletAlice.address, 1, walletBob.address, {
            gasLimit: 9999999,
            gasPrice: 0,
            value: ether(5)
        })
        expect(await contract.isMember(walletAlice.address)).to.eq(true)
        expect(await contract.memberTypeMap(walletAlice.address)).to.eq(1)
        console.info("owner balance: ", toEther(await walletDeployer.getBalance()))
        console.info("bob balance: ",  toEther(await walletBob.getBalance()))
    })

    it('Premium VIPX', async () => {
        await contract.connect(walletAlice).premium(walletAlice.address, 2, walletBob.address, {
            gasLimit: 9999999,
            gasPrice: 0,
            value: ether(30)
        })
        expect(await contract.isMember(walletAlice.address)).to.eq(true)
        expect(await contract.memberTypeMap(walletAlice.address)).to.eq(2)
        console.info("owner balance: ", toEther(await walletDeployer.getBalance()))
        console.info("bob balance: ",  toEther(await walletBob.getBalance()))
    })

    it('Insufficient member fee (VIP1)', async () => {
        await expect(contract.connect(walletAlice).premium(walletAlice.address, 0, walletBob.address, {
            gasLimit: 9999999,
            gasPrice: 0,
            value: ether(1).sub(1)
        })).to.be.reverted
    })

    it('Insufficient member fee (VIP7)', async () => {
        await expect(contract.connect(walletAlice).premium(walletAlice.address, 1, walletBob.address, {
            gasLimit: 9999999,
            gasPrice: 0,
            value: ether(5).sub(1)
        })).to.be.reverted
    })

    it('Insufficient member fee (VIPX)', async () => {
        await expect(contract.connect(walletAlice).premium(walletAlice.address, 2, walletBob.address, {
            gasLimit: 9999999,
            gasPrice: 0,
            value: ether(30).sub(1)
        })).to.be.reverted
    })
})
