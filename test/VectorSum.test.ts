import chai, { expect } from "chai"
import { Contract, BigNumber, utils } from "ethers"
import { network, ethers } from "hardhat"

describe("VectorSum", () => {
    let contract: Contract
    let a: Array<number>

    beforeEach(async () => {
        const VectorSum = await ethers.getContractFactory("VectorSum")
        const vectorSum = await VectorSum.deploy()
        const ExampleVectorSum = await ethers.getContractFactory("ExampleVectorSum", {
            libraries: {
                VectorSum: vectorSum.address
            }
        })

        contract = await ExampleVectorSum.deploy()

        a = new Array<number>()
        for (let i = 0; i < 1000; i++) {
            a[i] = i + 1
        }
    })

    const functionNames = ["sumSolidity", "sumAsm", "sumPureAsm"]

    for (const functionName of functionNames) {
        it(functionName, async () => {
            await contract[functionName](a)
            const v = await contract.sumValue()
            expect(v, functionName).to.eq(500500)
        })
    }
})
