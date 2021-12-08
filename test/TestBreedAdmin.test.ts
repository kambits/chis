import { expect } from "chai"
import { BigNumber, Contract, utils } from "ethers"
import { ether, toEther } from "./shared/util"
import { network, ethers } from "hardhat"



describe("TestBreedAdmin", () => {
    let contract: Contract

    beforeEach(async () => {
        const [owner, alice, bob] = await ethers.getSigners()
        const TestBreedAdmin = await ethers.getContractFactory("TestBreedAdmin")
        contract = await TestBreedAdmin.deploy()
        await contract.deployed()
    })

    it("breed By Admin", async () => {
        const [owner, alice, bob] = await ethers.getSigners()
        console.log(await contract.breedByAdmin("0x8ba1f109551bd432803012645ac136ddd64dba72", utils.sha256("0x01"), bob.signMessage("hhh")))
        expect(await contract.breedByAdmin("0x8ba1f109551bd432803012645ac136ddd64dba72", utils.sha256("0x01"), bob.signMessage("hhh")), "deploy").to.be.eq(1)
    })

})