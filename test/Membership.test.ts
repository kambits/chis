import { expect } from "chai"
import { beforeEach } from "mocha"
import { Contract, constants } from "ethers"
import { ether, mineTime, toEther } from "./shared/util"
import { network, ethers, upgrades } from "hardhat"
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"

describe("Membership", () => {
    let owner: SignerWithAddress
    let alice: SignerWithAddress
    let bob: SignerWithAddress

    let contract: Contract

    const etherBalance = async (address: string) => {
        return toEther(await ethers.provider.getBalance(address))
    }

    beforeEach(async () => {
        ;[owner, alice, bob] = await ethers.getSigners()
        const Membership = await ethers.getContractFactory("Membership")
        contract = await upgrades.deployProxy(Membership, [5, ether(5), 0])
        await contract.deployed()
    })

    it("Total member", async () => {
        expect(await contract.totalMember()).to.eq(1)
    })

    it("Is member", async () => {
        expect(await contract.isMember(alice.address)).to.eq(false)
    })

    it("Discount", async () => {
        expect(await contract.discount()).to.eq(ether(5))
    })

    it("Member fee", async () => {
        expect(await contract.memberFeeMap(0)).to.eq(ether(1))
        expect(await contract.memberFeeMap(1)).to.eq(ether(5))
        expect(await contract.memberFeeMap(2)).to.eq(ether(35))
    })

    it("get VIP fee", async () => {
        const [fee1, fee2, fee3] = await contract.getVIPFee()
        expect(fee1).to.eq(ether(1))
        expect(fee2).to.eq(ether(5))
        expect(fee3).to.eq(ether(35))
    })

    it("set member fees", async () => {
        await contract.setMemberFees(ether(2), ether(3), ether(4), {
            value: ether(1)
        })
        expect(await contract.memberFeeMap(0)).to.eq(ether(2))
        expect(await contract.memberFeeMap(1)).to.eq(ether(3))
        expect(await contract.memberFeeMap(2)).to.eq(ether(4))
    })

    it("registerVIP VIP1", async () => {
        await contract.connect(alice).registerVIP(alice.address, 0, bob.address, {
            value: ether(1)
        })
        expect(await contract.isMember(alice.address)).to.eq(true)
        expect(await contract.memberTypeMap(alice.address)).to.eq(0)
        const [expiryTime, currentTime] = await contract.getVIPInfo(alice.address)
        console.info("time: ", expiryTime.toNumber(), currentTime.toNumber())
        expect(expiryTime.toNumber()).to.greaterThan(currentTime.toNumber())
        expect(expiryTime.toNumber() - currentTime.toNumber()).to.eq(24 * 3600)
        console.info("owner balance: ", await etherBalance(owner.address))
        console.info("bob balance: ", await etherBalance(bob.address))

        await mineTime(3600)
        // after 1 hour
        // await time.increase(3600)
        // await ethers.provider.send('evm_increaseTime', [24 * 3600])
        // await ethers.provider.send('evm_mine')

        await contract.connect(bob).registerVIP(bob.address, 0, alice.address, {
            value: ether(1)
        })

        const [newExpiryTime, newCurrentTime] = await contract.getVIPInfo(alice.address)
        console.info("[new] time: ", newExpiryTime.toNumber(), newCurrentTime.toNumber())
        expect(newExpiryTime.toNumber()).to.greaterThan(newCurrentTime.toNumber())
    })

    it("registerVIP VIP7", async () => {
        await contract.connect(alice).registerVIP(alice.address, 1, bob.address, {
            value: ether(5)
        })
        expect(await contract.isMember(alice.address)).to.eq(true)
        expect(await contract.memberTypeMap(alice.address)).to.eq(1)
        console.info("owner balance: ", await etherBalance(owner.address))
        console.info("bob balance: ", await etherBalance(bob.address))
    })

    it("registerVIP VIPX", async () => {
        await contract.connect(alice).registerVIP(alice.address, 2, bob.address, {
            value: ether(35)
        })
        expect(await contract.isMember(alice.address)).to.eq(true)
        expect(await contract.memberTypeMap(alice.address)).to.eq(2)
        console.info("owner balance: ", await etherBalance(owner.address))
        console.info("bob balance: ", await etherBalance(bob.address))
    })

    it("registerVIP VIPX (discount)", async () => {
        await contract.connect(bob).registerVIP(bob.address, 2, constants.AddressZero, {
            value: ether(35)
        })
        expect(await contract.isMember(bob.address)).to.eq(true)

        await contract.connect(alice).registerVIP(alice.address, 2, bob.address, {
            value: ether(30)
        })
        expect(await contract.isMember(alice.address)).to.eq(true)
        expect(await contract.memberTypeMap(alice.address)).to.eq(2)
        console.info("owner balance: ", await etherBalance(owner.address))
        console.info("bob balance: ", await etherBalance(bob.address))
    })

    it("Insufficient member fee (VIP1)", async () => {
        await expect(
            contract.connect(alice).registerVIP(alice.address, 0, bob.address, {
                value: ether(1).sub(1)
            })
        ).to.be.reverted
    })

    it("Insufficient member fee (VIP7)", async () => {
        await expect(
            contract.connect(alice).registerVIP(alice.address, 1, bob.address, {
                value: ether(5).sub(1)
            })
        ).to.be.reverted
    })

    it("Insufficient member fee (VIPX)", async () => {
        await expect(
            contract.connect(alice).registerVIP(alice.address, 2, bob.address, {
                value: ether(35).sub(1)
            })
        ).to.be.reverted
    })
})
