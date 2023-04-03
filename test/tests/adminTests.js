const { expect } = require('chai');
const { setupTLBank } = require('../fixtures');

module.exports = () => {
  let admin, tlbank, bank, uri, a;
  it('deploys TLBank and updates the uri', async () => {
    const tl = await setupTLBank();
    admin = tl.admin;
    tlbank = tl.tlBank;
    bank = tl.bank;
    a = tl.a;
    uri = 'https://newuri.com';
    await expect(tlbank.deleteAdmin()).to.be.revertedWith('not set');
    expect(await tlbank.updateBaseURI(uri))
      .to.emit('URISet')
      .withArgs(uri);
  });
  it('a non admin cannot set the uri', async () => {
    await expect(tlbank.connect(a).updateBaseURI(uri)).to.be.revertedWith('ADMIN');
  });
  it('a non admin cannot delete the admin', async () => {
    await expect(tlbank.connect(a).deleteAdmin()).to.be.revertedWith('ADMIN');
  });
  it('deletes the admin', async () => {
    expect(await tlbank.deleteAdmin())
      .to.emit('AdminDeleted')
      .withArgs(admin.address);
  });
  it('cant update the uri after it has deleted the admin', async () => {
    await expect(tlbank.deleteAdmin()).to.be.revertedWith('ADMIN');
  });
};
