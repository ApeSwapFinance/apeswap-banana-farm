const { expectRevert, time } = require('@openzeppelin/test-helpers');
const { assert } = require('chai');
const BananaToken = artifacts.require('BananaToken');
const PriceGetter = artifacts.require('PriceGetter');
const BananaAllocator = artifacts.require('BananaAllocator');

contract('BananaAllocator', async ([alice, bob, admin, dev, minter]) => {
  beforeEach(async () => {
    this.allocationToken = await BananaToken.new({ from: minter });
    this.priceGetter = await PriceGetter.new({ from: admin });
    this.bananaAllocator = await BananaAllocator.new(
      this.allocationToken.address,
      this.priceGetter.address,
      { from: admin }
    );
    await this.allocationToken.mint(this.bananaAllocator.address, 100000, { from: minter });
  });

  it('add allocator & pull tokens', async () => {
    await time.advanceBlockTo('10');
    await this.bananaAllocator.addAllocation('Allocation 1', 10, [alice], { from: admin });
    await this.bananaAllocator.syncAllocations({ from: admin });
    await this.bananaAllocator.withdrawAllocation(0, '10000', { from: alice });
    assert.equal((await this.allocationToken.balanceOf(alice)).toString(), '10000');
  });
});
