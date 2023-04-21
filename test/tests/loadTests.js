const { expect } = require('chai');
const { time } = require('@nomicfoundation/hardhat-network-helpers');
const C = require('../constants');
const { setupTLBank } = require('../fixtures');

const loadTests = (params) => {
  let tl, bank, admin, a, b, c, amount, unlock, load, totalAmount, preBalance, postBalance;
  it('loads up the NFT with an additional amount before unlock date', async () => {
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
    expect(await tl.connect(a).loadNFT('1', load))
      .to.emit('NFTLoaded')
      .withArgs('1', a.address, totalAmount, unlock);
    expect(await tl.balanceOf(a.address)).to.eq(1);
    expect(await bank.balanceOf(a.address)).to.eq(postBalance.sub(load));
    expect(await bank.balanceOf(tl.address)).to.eq(totalAmount);
    expect(await bank.balanceOf(tl.address)).to.eq(amount.add(load));
    timeLock = await tl.timeLocks('1');
    expect(timeLock.amount).to.eq(totalAmount);
    expect(timeLock.unlockDate).to.eq(unlock);
  });
  it('loads up the NFT with an additional amount after the unlock date', async () => {
    await time.increaseTo(unlock + 10);
    totalAmount = totalAmount.add(load);
    expect(await tl.connect(a).loadNFT('1', load))
      .to.emit('NFTLoaded')
      .withArgs('1', a.address, totalAmount, unlock);
    expect(await bank.balanceOf(tl.address)).to.eq(totalAmount);
    expect(await bank.balanceOf(tl.address)).to.eq(amount.add(load).add(load));
    postBalance = postBalance.sub(load).sub(load);
    expect(await bank.balanceOf(a.address)).to.eq(postBalance);
    timeLock = await tl.timeLocks('1');
    expect(timeLock.amount).to.eq(totalAmount);
    expect(timeLock.unlockDate).to.eq(unlock);
  });
  it('can be reloaded by another wallet', async () => {
    load = C.E18_1000;
    totalAmount = totalAmount.add(load);
    let preB = await bank.balanceOf(b.address);
    expect(await bank.balanceOf(a.address)).to.eq(postBalance);
    let postB = preB.sub(load);
    expect(await tl.connect(b).loadNFT('1', load))
      .to.emit('NFTLoaded')
      .withArgs('1', a.address, totalAmount, unlock);
    expect(await bank.balanceOf(a.address)).to.eq(postBalance);
    expect(await bank.balanceOf(tl.address)).to.eq(totalAmount);
    expect(await bank.balanceOf(a.address)).to.eq(postBalance);
    expect(await bank.balanceOf(b.address)).to.eq(postB);
    timeLock = await tl.timeLocks('1');
    expect(timeLock.amount).to.eq(totalAmount);
    expect(timeLock.unlockDate).to.eq(unlock);
    expect(await tl.ownerOf('1')).to.eq(a.address);
    expect(await tl.balanceOf(b.address)).to.eq(0);
  });
  it('redeems the NFT', async () => {
    expect(await tl.connect(a).redeemNFT('1'))
      .to.emit('NFTRedeemed')
      .withArgs('1', a.address, totalAmount);
    expect(await bank.balanceOf(tl.address)).to.eq(0);
    expect(await bank.balanceOf(a.address)).to.eq(preBalance.add(C.E18_1000));
    timeLock = await tl.timeLocks('1');
    expect(timeLock.amount).to.eq(0);
    expect(timeLock.unlockDate).to.eq(0);
  });
};

const loadErrorTests = () => {
  let tl, bank, admin, a, b, c, amount, unlock, load;
  it('cannot load if the amount is 0', async () => {
    const setup = await setupTLBank();
    tl = setup.tlBank;
    bank = setup.bank;
    admin = setup.admin;
    a = setup.a;
    b = setup.b;
    c = setup.c;
    (amount = C.E18_100), (unlock = (await time.latest()) + 10);
    await tl.connect(a).createNFT(a.address, amount, unlock);
    await expect(tl.connect(a).loadNFT('1', C.ZERO)).to.be.revertedWith('no load');
  });
  it('reverts if the wallet has insufficient balance', async () => {
    load = C.E18_10000.add(C.E18_10000);
    await expect(tl.connect(a).loadNFT('1', load)).to.be.reverted;
  });
  it('reverts if the wallet has insufficient allowance', async () => {
    load = C.E18_100;
    await bank.connect(a).approve(tl.address, C.E18_1);
    await expect(tl.connect(a).loadNFT('1', load)).to.be.reverted;
  });
  it('reverts if the token was already redeemed', async () => {
    await time.increase(1000);
    await tl.connect(a).redeemNFT('1');
    await expect(tl.connect(a).loadNFT('1', C.E18_10)).to.be.reverted;
  });
  it('reverts if it tries to lock n load a not minted NFT', async () => {
    await expect(tl.connect(a).loadNFT('20', C.E18_10)).to.be.reverted;
  });
};

module.exports = {
  loadTests,
  loadErrorTests,
};
