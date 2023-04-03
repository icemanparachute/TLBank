const { ethers } = require('hardhat');
const C = require('./constants');
const { time } = require('@nomicfoundation/hardhat-network-helpers');

async function setupTLBank() {
  const [admin, a, b, c] = await ethers.getSigners();
  const Bank = await ethers.getContractFactory('Token');
  const bank = await Bank.deploy(C.E18_10000, 'Bank', 'BANK');
  const TLBank = await ethers.getContractFactory('TimeLockedBank');
  const tlBank = await TLBank.deploy('TimeLockedBank', 'TLBANK', bank.address);
  await bank.approve(tlBank.address, C.E18_10000);
  await bank.connect(a).mint(C.E18_10000);
  await bank.connect(a).approve(tlBank.address, C.E18_10000);
  await bank.connect(b).mint(C.E18_10000);
  await bank.connect(b).approve(tlBank.address, C.E18_10000);
  await bank.connect(c).mint(C.E18_10000);
  await bank.connect(c).approve(tlBank.address, C.E18_10000);

  return {
    admin,
    a,
    b,
    c,
    tlBank,
    bank,
  };
}

module.exports = {
  setupTLBank,
}
