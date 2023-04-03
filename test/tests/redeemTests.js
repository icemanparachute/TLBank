const { expect } = require('chai');
const { time } = require('@nomicfoundation/hardhat-network-helpers');
const C = require('../constants');
const { setupTLBank } = require('../fixtures');

module.exports = (params) => {
  let tl, bank, admin, a, b, c, amount, unlock;
  it('redeems an NFT after the unlock date', async () => {
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
    await time.increaseTo(unlock + 1);
    expect(await tl.connect(a).redeemNFT('1'))
      .to.emit('NFTRedeemed')
      .withArgs('1', a.address, amount);
    expect(await bank.balanceOf(tl.address)).to.eq(0);
    expect(await bank.balanceOf(a.address)).to.eq(C.E18_10000);
    await expect(tl.ownerOf('1')).to.be.reverted;
    expect(await tl.balanceOf(a.address)).to.eq(0);
    const timelock = await tl.timeLocks('1');
    expect(timelock.amount).to.eq(0);
    expect(timelock.unlockDate).to.eq(0);
  });
  it('will revert if the a wallet that doesnt own the nft tries to redeem', async () => {
    let now = await time.latest();
    unlock = now + 100;
    await tl.connect(a).createNFT(a.address, amount, unlock);
    await time.increase(200);
    await expect(tl.connect(b).redeemNFT('2')).to.be.revertedWith('!owner');
    await expect(tl.connect(b).redeemNFT('5')).to.be.reverted;
  });
  it('will revert if the NFT is still locked', async () => {
    let now = await time.latest();
    unlock = now + 100;
    await tl.connect(a).createNFT(a.address, amount, unlock);
    await expect(tl.connect(a).redeemNFT('3')).to.be.revertedWith('Not redeemable');
  });
  it('will revert if it tries to redeem an NFT twice', async () => {
    await expect(tl.connect(a).redeemNFT('1')).to.be.revertedWith('ERC721: invalid token ID');
  });
};
