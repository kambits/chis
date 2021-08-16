import chai, { expect } from 'chai'
import { BigNumber, utils } from 'ethers'

describe('Ethers', () => { 
    beforeEach(async () => {
 
    })

    it('encode function', async () => { 
        const abi = [
            "function registerVIP(address, uint, address)"
        ];
        const iface = new utils.Interface(abi)
        const registerVIPHash =  iface.encodeFunctionData("registerVIP", [ "0x1234567890123456789012345678901234567890", BigNumber.from("1") , "0x1234567890123456789012345678901234567890"])
        
        expect(registerVIPHash.indexOf('0x118e98c')).to.eq(0)
    })

})
