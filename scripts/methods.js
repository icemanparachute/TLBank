const { ethers } = require("hardhat");

// ADMIN FUNCTIONS ONLY
// Assumes admin is already connected to the ethers provider based on the .env and hardhat linkage

async function updateURI(contractAddress, uri) {
    const bank = (await ethers.getContractFactory('TimeLockedBank')).attach(contractAddress);
    const tx = await bank.updateBaseURI(uri);
    console.log(tx.hash);
}

async function deleteAdmin(contractAddress) {
    const bank = (await ethers.getContractFactory('TimeLockedBank')).attach(contractAddress);
    const tx = await bank.deleteAdmin();
    console.log(tx.hash);
}


// Primary user functions

async function approveBank(privKey, bankAddress, tlbankAddress, amount) {
    const wallet = new ethers.Wallet(privKey);
    const bank = (await ethers.getContractFactory('Token')).attach(bankAddress);
    const tx = await bank.connect(wallet).approve(tlbankAddress, amount);
    console.log(tx.hash);
}

async function lockBank(privKey, contractAddress, bankAmount, unlockDate) {
    const wallet = new ethers.Wallet(privKey);
    const bank = (await ethers.getContractFactory('TimeLockedBank')).attach(contractAddress);
    const tx = await bank.connect(wallet).createNFT(wallet.address, bankAmount, unlockDate);
    console.log(tx.hash);
}

async function approveAndLockBank(privKey, bankAddress, tlBankAddrss, bankAmount, unlockDate) {
    await approveBank(privKey, bankAddress, tlBankAddrss, bankAmount);
    await lockBank(privKey, tlbankAddress, bankAmount, unlockDate);
}

async function redeemBank(privKey, contractAddress, nftId) {
    const wallet = new ethers.Wallet(privKey);
    const bank = (await ethers.getContractFactory('TimeLockedBank')).attach(contractAddress);
    const tx = await bank.connect(wallet).redeemNFT(nftId);
    console.log(tx.hash);
}

async function relockBank(privKey, contractAddress, nftId, unlockDate) {
    const wallet = new ethers.Wallet(privKey);
    const bank = (await ethers.getContractFactory('TimeLockedBank')).attach(contractAddress);
    const tx = await bank.connect(wallet).relockNFT(nftId, unlockDate);
    console.log(tx.hash);
}

async function lockBank(privKey, contractAddress, nftId, additionalAmount) {
    const wallet = new ethers.Wallet(privKey);
    const bank = (await ethers.getContractFactory('TimeLockedBank')).attach(contractAddress);
    const tx = await bank.connect(wallet).loadNFT(nftId, additionalAmount);
    console.log(tx.hash);
}

async function locknloadBank(privKey, contractAddress, nftId, additionalAmount, unlockDate) {
    const wallet = new ethers.Wallet(privKey);
    const bank = (await ethers.getContractFactory('TimeLockedBank')).attach(contractAddress);
    const tx = await bank.conect(wallet).locknLoadNFT(nftId, additionalAmount, unlockDate);
    console.log(tx.hash);
}

async function delegateNFT(privKey, contractAddress, nftId, delegate) {
    const wallet = new ethers.Wallet(privKey);
    const bank = (await ethers.getContractFactory('TimeLockedBank')).attach(contractAddress);
    const tx = await bank.connect(wallet).delegateNFT(delegate, nftId);
    console.log(tx.hash);
}

//VIEW ONLY

async function getLockedBalance(holderAddress, contractAddress) {
    const bank = (await ethers.getContractFactory('TimeLockedBank')).attach(contractAddress);
    const balance = await bank.lockedBalances(holderAddress);
    console.log(balance);
    return (balance);
}

async function getDelegatedBalance(delegate, contractAddress) {
    const bank = (await ethers.getContractFactory('TimeLockedBank')).attach(contractAddress);
    const balance = await bank.delegatedBalances(delegate);
    console.log(balance);
    return (balance);
}