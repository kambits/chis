import { expect } from "chai"
import { BigNumber, Contract, utils } from "ethers"
import { ether, toEther } from "./shared/util"
import { network, ethers } from "hardhat"



describe("TestVerify", () => {
    let contract: Contract

    beforeEach(async () => {
        const [owner, alice, bob] = await ethers.getSigners()
        const TestVerify = await ethers.getContractFactory("TestVerify")
        contract = await TestVerify.deploy()
        await contract.deployed()
    })

    it("test verify", async () => {
        const [owner, alice, bob] = await ethers.getSigners()
        const message = "hello"
        const msgHash = utils.hashMessage(message);
        const msgHashBytes = utils.arrayify(msgHash);

        const signature = await bob.signMessage(message);
        
        expect(await contract.verify(msgHash, bob.address, signature), "verify").eq(true);

    })

})