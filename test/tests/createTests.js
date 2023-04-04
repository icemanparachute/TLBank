const { expect } = require('chai');
const { time } = require('@nomicfoundation/hardhat-network-helpers');
const C = require('../constants');
const { setupTLBank } = require('../fixtures');

/** Create Time Locked Bank NFTs tests
 * Tests should create basic TLBank NFTs
 * - check the balances before and after match
 * - check the struct for correctness
 * - check that it will
 */

const createTest = (params) => {
  let tl, bank, admin, a, b, c, uri, amount, unlock;
  it(`wallet A locks an NFT to itself with ${C.getVal(params.amount)} BANK tokens, ${
    params.unlockShift
  } in the future`, async () => {
    const setup = await setupTLBank();
    tl = setup.tlBank;
    bank = setup.bank;
    admin = setup.admin;
    a = setup.a;
    b = setup.b;
    c = setup.c;
    uri = 'https://';
    amount = params.amount;
    let now = await time.latest();
    unlock = now + params.unlockShift;
    expect(await tl.connect(a).createNFT(a.address, amount, unlock))
      .to.emit('NFTCreated')
      .withArgs('1', a.address, amount, unlock);
    const timeLock = await tl.timeLocks('1');
    expect(timeLock.amount).to.eq(amount);
    expect(timeLock.unlockDate).to.eq(unlock);
    expect(await bank.balanceOf(tl.address)).to.eq(amount);
    expect(await tl.ownerOf('1')).to.eq(a.address);
    expect(await tl.balanceOf(a.address)).to.eq(1);
  });
  it('creates and mints an NFT to another wallet', async () => {
    expect(await tl.createNFT(b.address, amount, unlock))
      .to.emit('NFTCreated')
      .withArgs('2', b.address, amount, unlock);
    expect(await tl.ownerOf('2')).to.eq(b.address);
    expect(await bank.balanceOf(tl.address)).to.eq(amount.add(amount));
  });
  it('transfers the NFT and the boolean is flipped on', async () => {
    expect(await tl.wasTransferred('2')).to.eq(false);
    await tl.connect(b).transferFrom(b.address, c.address, '2');
    expect(await tl.wasTransferred('2')).to.eq(true);
  });
};

const createErrorTests = () => {
  let tl, bank, admin, a, b, c, unlock;
  it('reverts if the recpieint address is 0x0', async () => {
    const setup = await setupTLBank();
    tl = setup.tlBank;
    bank = setup.bank;
    admin = setup.admin;
    a = setup.a;
    b = setup.b;
    c = setup.c;
    let now = await time.latest();
    unlock = now + 100;
    await expect(tl.createNFT(C.ZERO_ADDRESS, C.E18_10, unlock)).to.be.revertedWith('zero address');
  });
  it('reverts if the amount is 0', async () => {
    await expect(tl.createNFT(a.address, C.ZERO, unlock)).to.be.revertedWith('zero amount');
  });
  it('reverts if the unlock date is 4 years into the future or in the past', async () => {
    let past = (await time.latest()) - 100;
    let future = (await time.latest()) + 95040002;
    await expect(tl.createNFT(a.address, C.E18_10, past)).to.be.revertedWith('!future');
    await expect(tl.createNFT(a.address, C.E18_10, future)).to.be.revertedWith('day guardrail');
  });
  it('reverts if the wallet has insufficient balance', async () => {
    await bank.connect(b).transfer(a.address, C.E18_10000);
    await expect(tl.connect(b).createNFT(b.address, C.E18_1000, unlock)).to.be.reverted;
  });
};

module.exports = {
  createErrorTests,
  createTest,
};
