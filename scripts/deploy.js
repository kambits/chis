// We require the Hardhat Runtime Environment explicitly here. This is optional 
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scohouseExchange.
const hre = require("hardhat");

async function main() {
    // Hardhat always runs the compile task when running scripts with its command
    // line interface.
    //
    // If this script is run directly using `node` you may want to call compile 
    // manually to make sure everything is compiled
    // await hre.run('compile');

    const BytesStorage = await hre.ethers.getContractFactory("BytesStorage");
    const bytesStorage = await BytesStorage.deploy();

    console.info(`BytesStorage: ${bytesStorage.address}`);
    console.info('It is ready!')
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });