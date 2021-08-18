import chai, { expect } from 'chai'
import { Contract } from 'ethers'
import { solidity, MockProvider, deployContract } from 'ethereum-waffle'
import { ether, parseUnits } from './shared/util'

import ERC20Token from '../build/MEME.json'

chai.use(solidity)

const overrides = {
    gasLimit: 9999999,
    gasPrice: 0
}

describe('MEME', () => {
    const provider = new MockProvider({
        ganacheOptions: {
            gasLimit: 9999999
        }
    })
    const [walletDeployer, walletAlice, walletBob] = provider.getWallets()

    let token: Contract

    const TOKEN_DECIMALS = 6
    const toAmount = (value: string | number) => parseUnits(value, TOKEN_DECIMALS)

    beforeEach(async () => {
        token = await deployContract(walletDeployer, ERC20Token, [], overrides)
        expect(await token.balanceOf(walletDeployer.address)).to.eq(toAmount(100000000))
        await token.transfer(walletAlice.address, toAmount(1000), overrides)
    })

    it('Check token balance', async () => {
        expect(await token.balanceOf(walletAlice.address)).to.eq(
            toAmount(1000)
                .mul(90)
                .div(100)
        )
    })

    it('Check token symbol', async () => {
        expect(await token.symbol()).to.eq('MEME')
    })

    it('Check token name', async () => {
        expect(await token.name()).to.eq('MEME')
    })

    it('Transfer adds amount to destination account', async () => {
        await token.connect(walletAlice).transfer(walletBob.address, toAmount(10))
        expect(await token.balanceOf(walletBob.address)).to.eq(
            toAmount(10)
                .mul(90)
                .div(100)
        )
    })

    it('Transfer emits event', async () => {
        await expect(token.connect(walletAlice).transfer(walletBob.address, 100))
            .to.emit(token, 'Transfer')
            .withArgs(walletAlice.address, walletBob.address, 90)
    })

    it('Can not transfer above the amount', async () => {
        await expect(token.connect(walletAlice).transfer(walletBob.address, toAmount(1001))).to.be.reverted
    })

    it('Can not transfer from empty account', async () => {
        expect(await token.balanceOf(walletBob.address)).to.eq(toAmount(0))
        await expect(token.connect(walletBob).transfer(walletAlice.address, 100)).to.be.reverted
    })

    it('Calls totalSupply on Token contract', async () => {
        const totalSupply = await token.totalSupply()
        expect(totalSupply).to.be.equal(toAmount(99999900))
    })
})
