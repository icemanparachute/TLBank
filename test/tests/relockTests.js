const { expect } = require('chai');
const { time } = require('@nomicfoundation/hardhat-network-helpers');
const C = require('../constants');
const { setupTLBank } = require('../fixtures');

const relockTest = (params) => {
  let tl, bank, admin, a, b, c, amount, unlock, relock;
  it('relocks tokens in the NFT before the unlock date', async () => {
    const setup = await setupTLBank();
    tl = setup.tlBank;
    bank = setup.bank;
    admin = setup.admin;
    a = setup.a;
    b = setup.b;
    c = setup.c;
    amount = params.amount;
    let now = await time.latest();
    unlock = now + params.unlockShift;
    await tl.connect(a).createNFT(a.address, amount, unlock);
    expect(await bank.balanceOf(tl.address)).to.eq(amount);
    let timeLock = await tl.timeLocks('1');
    expect(timeLock.amount).to.eq(amount);
    expect(timeLock.unlockDate).to.eq(unlock);
    expect(await tl.balanceOf(a.address)).to.eq(1);
    expect(await tl.ownerOf('1')).to.eq(a.address);
    relock = unlock + 50;
    expect(await tl.connect(a).relockNFT('1', relock))
      .to.emit('NFTReLocked')
      .withArgs('1', a.address, amount, relock);
    expect(await bank.balanceOf(tl.address)).to.eq(amount);
    timeLock = await tl.timeLocks('1');
    expect(timeLock.amount).to.eq(amount);
    expect(timeLock.unlockDate).to.eq(relock);
    expect(await tl.balanceOf(a.address)).to.eq(1);
    expect(await tl.ownerOf('1')).to.eq(a.address);
  });
  it('relocks tokens in the NFT after the unlock date but has not been redeemed', async () => {
    await time.increaseTo(relock + 10);
    relock = (await time.latest()) + 100;
    expect(await tl.connect(a).relockNFT('1', relock))
      .to.emit('NFTReLocked')
      .withArgs('1', a.address, amount, relock);
    expect(await bank.balanceOf(tl.address)).to.eq(amount);
    timeLock = await tl.timeLocks('1');
    expect(timeLock.amount).to.eq(amount);
    expect(timeLock.unlockDate).to.eq(relock);
    expect(await tl.balanceOf(a.address)).to.eq(1);
    expect(await tl.ownerOf('1')).to.eq(a.address);
  });
};

const relockErrorTest = () => {
  let tl, bank, admin, a, b, c, amount, unlock, relock;
  it('cannot relock if the owner is not calling the function', async () => {
    const setup = await setupTLBank();
    tl = setup.tlBank;
    bank = setup.bank;
    admin = setup.admin;
    a = setup.a;
    b = setup.b;
    c = setup.c;
    (amount = C.E18_10), (unlock = (await time.latest()) + 10);
    await tl.connect(a).createNFT(a.address, amount, unlock);
    relock = unlock + 10;
    await expect(tl.connect(b).relockNFT('1', relock)).to.be.revertedWith('!owner');
  });
  it('reverts if the new relock date is 4 years in the future', async () => {
    relock = (await time.latest()) + 95040002;
    await expect(tl.connect(a).relockNFT('1', relock)).to.be.revertedWith('day guardrail');
  });
  it('reverts if the new relock date is in the past', async () => {
    relock = (await time.latest()) - 10;
    await expect(tl.connect(a).relockNFT('1', relock)).to.be.revertedWith('unlock error');
  });
  it('reverts if the new relock date is not farther than the current unlockDate', async () => {
    relock = unlock - 1;
    await expect(tl.connect(a).relockNFT('1', relock)).to.be.revertedWith('unlock error');
  });
  it('reverts if it tries to relock a not minted NFT', async () => {
    await expect(tl.connect(a).relockNFT('20', relock)).to.be.reverted;
  });
};

module.exports = {
  relockTest,
  relockErrorTest,
};
