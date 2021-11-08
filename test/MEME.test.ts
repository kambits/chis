import { expect } from "chai"
import { beforeEach } from "mocha"
import { Contract, utils } from "ethers"
import { ether } from "./shared/util"
import { network, ethers } from "hardhat"
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"

describe("MEME", () => {
    let owner: SignerWithAddress
    let alice: SignerWithAddress
    let bob: SignerWithAddress

    let token: Contract

    beforeEach(async () => {
        ;[owner, alice, bob] = await ethers.getSigners()
        const ERC20Token = await ethers.getContractFactory("MEME")

        token = await ERC20Token.deploy()
        await token.connect(owner).transfer(alice.address, ether(1000))
    })

    it("Check token balance", async () => {
        expect(await token.balanceOf(alice.address)).to.eq(ether(900))
    })

    it("Check token symbol", async () => {
        expect(await token.symbol()).to.eq("MEME")
    })

    it("Check token name", async () => {
        expect(await token.name()).to.eq("MEME")
    })

    it("Transfer adds amount to destination account", async () => {
        await token.connect(alice).transfer(bob.address, ether(10))
        expect(await token.balanceOf(bob.address)).to.eq(ether(9))
    })

    it("Transfer emits event", async () => {
        await expect(token.connect(alice).transfer(bob.address, 100)).to.emit(token, "Transfer").withArgs(alice.address, bob.address, 90)
    })

    it("Can not transfer above the amount", async () => {
        await expect(token.connect(alice).transfer(bob.address, ether(1001))).to.be.reverted
    })

    it("Can not transfer from empty account", async () => {
        expect(await token.balanceOf(bob.address)).to.eq(ether(0))
        await expect(token.connect(bob).transfer(alice.address, 1)).to.be.reverted
    })

    it("Calls totalSupply on Token contract", async () => {
        const totalSupply = await token.totalSupply()
        expect(totalSupply).to.be.equal(ether(99999900))
    })
})
