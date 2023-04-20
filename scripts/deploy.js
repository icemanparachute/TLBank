const { ethers } = require("hardhat");

async function deploy(args) {
    const TLBANK = await ethers.getContractFactory('TimeLockedBank');
    const tlBank = await TLBANK.deploy(...args);
    await tlBank.deployed();
    console.log(`new TLBank Address: ${tlBank.address}`);
    console.log(`args for etherscan verify: ${args}`);
}

async function deployTestBank(args) {
    const BANK = await ethers.getContractFactory('Token');
    const bank = await BANK.deploy(...args);
    await bank.deployed();
    console.log(`Bank address: ${bank.address}`);
    console.log(`Bank args: ${args}`);
}

const name = 'TimeLockedBank';
const symbol = 'TLBANK';
const tokenAddress = '0x077154D2931eEC781f8F1a1D0a23Ce6Ef896a2ac';

deploy([name, symbol, tokenAddress]);

//deployTestBank(['5000000000000000000000000','BanklessT', 'BANKT']);
