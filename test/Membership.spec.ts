import chai, { expect } from 'chai'
import { BigNumber, Contract, constants } from 'ethers'
import { solidity, MockProvider, deployContract } from 'ethereum-waffle'
import { ether, toEther, parseUnits } from './shared/util'
import { network } from 'hardhat'
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
        expect(await contract.totalMember()).to.eq(1)
    })

    it('Is member', async () => {
        expect(await contract.isMember(walletAlice.address)).to.eq(false)
    })

    it('Member fee', async () => {
        expect(await contract.memberFeeMap(0)).to.eq(ether(1))
        expect(await contract.memberFeeMap(1)).to.eq(ether(5))
        expect(await contract.memberFeeMap(2)).to.eq(ether(35))
    })

    it('get VIP fee', async () => {
        const [fee1, fee2, fee3] = await contract.getVIPFee()
        expect(fee1).to.eq(ether(1))
        expect(fee2).to.eq(ether(5))
        expect(fee3).to.eq(ether(35))
    })

    it('set member fees', async () => {
        await contract.connect(walletDeployer).setMemberFees(ether(2), ether(3), ether(4), {
            gasLimit: 9999999,
            gasPrice: 0,
            value: ether(1)
        })
        expect(await contract.memberFeeMap(0)).to.eq(ether(2))
        expect(await contract.memberFeeMap(1)).to.eq(ether(3))
        expect(await contract.memberFeeMap(2)).to.eq(ether(4))
    })

    it('registerVIP VIP1', async () => {
        await contract.connect(walletAlice).registerVIP(walletAlice.address, 0, walletBob.address, {
            gasLimit: 9999999,
            gasPrice: 0,
            value: ether(1)
        })
        expect(await contract.isMember(walletAlice.address)).to.eq(true)
        expect(await contract.memberTypeMap(walletAlice.address)).to.eq(0)
        const [expiryTime, currentTime] = await contract.getVIPInfo(walletAlice.address)
        console.info('time: ', expiryTime.toNumber(), currentTime.toNumber())
        expect(expiryTime.toNumber()).to.greaterThan(currentTime.toNumber())
        expect(expiryTime.toNumber() - currentTime.toNumber()).to.eq(24 * 3600)
        console.info('owner balance: ', toEther(await walletDeployer.getBalance()))
        console.info('bob balance: ', toEther(await walletBob.getBalance()))

        // after 1 hour
        // await time.increase(3600)
        // await network.provider.send('evm_increaseTime', [24 * 3600])
        // await network.provider.send('evm_mine')

        await contract.connect(walletBob).registerVIP(walletBob.address, 0, walletAlice.address, {
            gasLimit: 9999999,
            gasPrice: 0,
            value: ether(1)
        })

        const [newExpiryTime, newCurrentTime] = await contract.getVIPInfo(walletAlice.address)
        console.info('[new] time: ', newExpiryTime.toNumber(), newCurrentTime.toNumber())
        expect(newExpiryTime.toNumber()).to.greaterThan(newCurrentTime.toNumber())
    })

    it('registerVIP VIP7', async () => {
        await contract.connect(walletAlice).registerVIP(walletAlice.address, 1, walletBob.address, {
            gasLimit: 9999999,
            gasPrice: 0,
            value: ether(5)
        })
        expect(await contract.isMember(walletAlice.address)).to.eq(true)
        expect(await contract.memberTypeMap(walletAlice.address)).to.eq(1)
        console.info('owner balance: ', toEther(await walletDeployer.getBalance()))
        console.info('bob balance: ', toEther(await walletBob.getBalance()))
    })

    it('registerVIP VIPX', async () => {
        await contract.connect(walletAlice).registerVIP(walletAlice.address, 2, walletBob.address, {
            gasLimit: 9999999,
            gasPrice: 0,
            value: ether(35)
        })
        expect(await contract.isMember(walletAlice.address)).to.eq(true)
        expect(await contract.memberTypeMap(walletAlice.address)).to.eq(2)
        console.info('owner balance: ', toEther(await walletDeployer.getBalance()))
        console.info('bob balance: ', toEther(await walletBob.getBalance()))
    })

    it('registerVIP VIPX (discount)', async () => {
        await contract.connect(walletBob).registerVIP(walletBob.address, 2, constants.AddressZero, {
            gasLimit: 9999999,
            gasPrice: 0,
            value: ether(35)
        })
        await contract.connect(walletAlice).registerVIP(walletAlice.address, 2, walletBob.address, {
            gasLimit: 9999999,
            gasPrice: 0,
            value: ether(30)
        })
        expect(await contract.isMember(walletAlice.address)).to.eq(true)
        expect(await contract.memberTypeMap(walletAlice.address)).to.eq(2)
        console.info('owner balance: ', toEther(await walletDeployer.getBalance()))
        console.info('bob balance: ', toEther(await walletBob.getBalance()))
    })

    it('Insufficient member fee (VIP1)', async () => {
        await expect(
            contract.connect(walletAlice).registerVIP(walletAlice.address, 0, walletBob.address, {
                gasLimit: 9999999,
                gasPrice: 0,
                value: ether(1).sub(1)
            })
        ).to.be.reverted
    })

    it('Insufficient member fee (VIP7)', async () => {
        await expect(
            contract.connect(walletAlice).registerVIP(walletAlice.address, 1, walletBob.address, {
                gasLimit: 9999999,
                gasPrice: 0,
                value: ether(5).sub(1)
            })
        ).to.be.reverted
    })

    it('Insufficient member fee (VIPX)', async () => {
        await expect(
            contract.connect(walletAlice).registerVIP(walletAlice.address, 2, walletBob.address, {
                gasLimit: 9999999,
                gasPrice: 0,
                value: ether(35).sub(1)
            })
        ).to.be.reverted
    })
})
