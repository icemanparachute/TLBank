const { expect } = require('chai');
const { time } = require('@nomicfoundation/hardhat-network-helpers');
const { setupTLBank } = require('../fixtures');

module.exports = (params) => {
  let tl, bank, admin, a, b, c, uri, amount, unlock;
  it('deploys the tlbank contract and updates the uri and deletes the admin', async () => {
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
    expect(await tl.updateBaseURI(uri))
      .to.emit('URISet')
      .withArgs(uri);
    expect(await tl.deleteAdmin())
      .to.emit('AdminDeleted')
      .withArgs(admin.address);
    expect(await tl.token()).to.eq(bank.address);
  });
  it('wallet A self issues an NFT by locking bank up', async () => {
    expect(await tl.connect(a).createNFT(a.address, amount, unlock))
      .to.emit('NFTCreated')
      .withArgs('1', a.address, amount, unlock);
    const timeLock = await tl.timeLocks('1');
    expect(timeLock.amount).to.eq(amount);
    expect(timeLock.unlockDate).to.eq(unlock);
    expect(await bank.balanceOf(tl.address)).to.eq(amount);
  });
  it('wallet A relocks the token for additional time', async () => {
    let relock = unlock + 100;
    expect(await tl.connect(a).relockNFT('1', relock))
      .to.emit('NFTReLocked')
      .withArgs('1', a.address, amount, relock);
    const timeLock = await tl.timeLocks('1');
    expect(timeLock.amount).to.eq(amount);
    expect(timeLock.unlockDate).to.eq(relock);
    expect(await bank.balanceOf(tl.address)).to.eq(amount);
  });
  it('wallet A redeems its NFT after the unlock date', async () => {
    await time.increaseTo(unlock + 101);
    expect(await tl.connect(a).redeemNFT('1'))
      .to.emit('NFTRedeemed')
      .withArgs('1', a.address, amount);
  });
};
