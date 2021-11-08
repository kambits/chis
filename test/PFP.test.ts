import { expect } from "chai"
import { beforeEach } from "mocha"
import { Contract, utils } from "ethers"
import { ether } from "./shared/util"
import { network, ethers } from "hardhat"
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"

describe("PFP", () => {
    let owner: SignerWithAddress
    let alice: SignerWithAddress
    let bob: SignerWithAddress

    let pfp: Contract

    beforeEach(async () => {
        ;[owner, alice, bob] = await ethers.getSigners()
        const PFP = await ethers.getContractFactory("PFP")

        pfp = await PFP.deploy()
    })

    it("Mint", async () => {
        await pfp.connect(alice).claim(1)
        const tokenURI = await pfp.tokenURI(1)
        console.info(tokenURI)
    })
})
