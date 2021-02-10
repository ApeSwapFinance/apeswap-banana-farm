const { assert } = require("chai");

const BananaToken = artifacts.require('BananaToken');

contract('BananaToken', ([alice, bob, carol, dev, minter]) => {
    beforeEach(async () => {
        this.cake = await BananaToken.new({ from: minter });
    });


    it('mint', async () => {
        await this.cake.mint(alice, 1000, { from: minter });
        assert.equal((await this.cake.balanceOf(alice)).toString(), '1000');
    })
});
