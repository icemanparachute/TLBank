const { expect } = require('chai');
const { time } = require('@nomicfoundation/hardhat-network-helpers');
const C = require('../constants');
const { setupTLBank } = require('../fixtures');

const locknLoadTests = (params) => {
  let tl, bank, admin, a, b, c, amount, unlock, load, relock, totalAmount, preBalance, postBalance;
  it('Locks additional amount with a new unlock date before its unlocked', async () => {
    const setup = await setupTLBank();
    tl = setup.tlBank;
    bank = setup.bank;
    admin = setup.admin;
    a = setup.a;
    b = setup.b;
    c = setup.c;
    amount = params.amount;
    load = params.load;
    totalAmount = amount.add(load);
    let now = await time.latest();
    unlock = now + params.unlockShift;
    relock = unlock + params.relockShift;
    preBalance = await bank.balanceOf(a.address);
    postBalance = preBalance.sub(amount);
    await tl.connect(a).createNFT(a.address, amount, unlock);
    expect(await bank.balanceOf(a.address)).to.eq(postBalance);
    expect(await bank.balanceOf(tl.address)).to.eq(amount);
    let timeLock = await tl.timeLocks('1');
    expect(timeLock.amount).to.eq(amount);
    expect(timeLock.unlockDate).to.eq(unlock);
    expect(await tl.balanceOf(a.address)).to.eq(1);
    expect(await tl.ownerOf('1')).to.eq(a.address);
    expect(await tl.connect(a).locknLoadNFT('1', load, relock))
      .to.emit('NFTLockedAndLoaded')
      .withArgs('1', a.address, totalAmount, relock);
    expect(await tl.balanceOf(a.address)).to.eq(1);
    expect(await bank.balanceOf(a.address)).to.eq(postBalance.sub(load));
    expect(await bank.balanceOf(tl.address)).to.eq(totalAmount);
    expect(await bank.balanceOf(tl.address)).to.eq(amount.add(load));
    timeLock = await tl.timeLocks('1');
    expect(timeLock.amount).to.eq(totalAmount);
    expect(timeLock.unlockDate).to.eq(relock);
  });
  it('locks n loads after the nft unlock has passed but has not been redeemed', async () => {
    await time.increaseTo(relock + 50);
    relock = (await time.latest()) + 100;
    totalAmount = totalAmount.add(load);
    expect(await tl.connect(a).locknLoadNFT('1', load, relock))
      .to.emit('NFTLockedAndLoaded')
      .withArgs('1', a.address, totalAmount, relock);
    expect(await bank.balanceOf(tl.address)).to.eq(totalAmount);
    expect(await bank.balanceOf(tl.address)).to.eq(amount.add(load).add(load));
    expect(await bank.balanceOf(a.address)).to.eq(postBalance.sub(load).sub(load));
    timeLock = await tl.timeLocks('1');
    expect(timeLock.amount).to.eq(totalAmount);
    expect(timeLock.unlockDate).to.eq(relock);
  });
  it('redeems the newly locked n loaded NFT after it unlocks', async () => {
    await time.increaseTo(relock + 1);
    expect(await tl.connect(a).redeemNFT('1'))
      .to.emit('NFTRedeemed')
      .withArgs('1', a.address, totalAmount);
    expect(await bank.balanceOf(tl.address)).to.eq(0);
    expect(await bank.balanceOf(a.address)).to.eq(preBalance);
    timeLock = await tl.timeLocks('1');
    expect(timeLock.amount).to.eq(0);
    expect(timeLock.unlockDate).to.eq(0);
    expect(await tl.balanceOf(a.address)).to.eq(0);
  });
};

const locknLoadErrorTests = () => {
  let tl, bank, admin, a, b, c, amount, unlock, load, relock;
  it('cannot relock if not owner is trying to lock n load', async () => {
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
    load = C.E18_100;
    await expect(tl.connect(b).locknLoadNFT('1', load, relock)).to.be.revertedWith('!owner');
  });
  it('reverts if the new relock date is 4 years in the future', async () => {
    relock = (await time.latest()) + 95040002;
    await expect(tl.connect(a).locknLoadNFT('1', load, relock)).to.be.revertedWith('day guardrail');
  });
  it('reverts if the new relock date is in the past', async () => {
    relock = (await time.latest()) - 10;
    await expect(tl.connect(a).locknLoadNFT('1', load, relock)).to.be.revertedWith('unlock error');
  });
  it('reverts if the new relock date is not farther than the current unlockDate', async () => {
    relock = unlock - 1;
    await expect(tl.connect(a).locknLoadNFT('1', load, relock)).to.be.revertedWith('unlock error');
  });
  it('reverts if the load amount is 0', async () => {
    relock = (await time.latest()) + 100;
    load = C.ZERO;
    await expect(tl.connect(a).locknLoadNFT('1', load, relock)).to.be.revertedWith('no load');
  });
  it('reverts if the wallet has insufficient balance', async () => {
    load = C.E18_10000.add(C.E18_10000);
    await expect(tl.connect(a).locknLoadNFT('1', load, relock)).to.be.reverted;
  });
  it('reverts if the wallet has insufficient allowance', async () => {
    load = C.E18_100;
    await bank.connect(a).approve(tl.address, C.E18_1);
    await expect(tl.connect(a).locknLoadNFT('1', load, relock)).to.be.reverted;
  });
  it('reverts if the token was already redeemed', async () => {
    await time.increase(1000);
    relock = (await time.latest()) + 100;
    await tl.connect(a).redeemNFT('1');
    await expect(tl.connect(a).locknLoadNFT('1', C.E18_10, relock)).to.be.reverted;
  });
  it('reverts if it tries to lock n load a not minted NFT', async () => {
    await expect(tl.connect(a).locknLoadNFT('20', C.E18_10, relock)).to.be.reverted;
  });
};

module.exports = {
  locknLoadTests,
  locknLoadErrorTests,
};
