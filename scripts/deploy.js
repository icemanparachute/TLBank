const { ethers } = require("hardhat");

async function deploy(args) {
    const TLBANK = await ethers.getContractFactory('TimeLockedBank');
    const tlBank = await TLBANK.deploy(...args);
    await tlBank.deployed();
    console.log(`new TLBank Address: ${tlBank.address}`);
    console.log(`args for etherscan verify: ${args}`);
}

const name = 'TimeLockedBank';
const symbol = 'TLBANK';
const bank = '0xf474f305d9abEe39c7814D83801151BedA386691';

deploy([name, symbol, bank]);
