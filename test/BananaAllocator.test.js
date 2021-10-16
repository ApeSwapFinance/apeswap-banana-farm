const { accounts, contract } = require('@openzeppelin/test-environment');
const { BN, expectRevert } = require('@openzeppelin/test-helpers');
const { farm, dex } = require('@apeswapfinance/test-helpers');
const { expect, assert } = require('chai');

const BananaAllocator = contract.fromArtifact('BananaAllocator'); // Loads a compiled contract
const PriceGetter = contract.fromArtifact('PriceGetter'); // Loads a compiled contract

describe('BananaAllocator', function () {
  const [owner, dev, alice, bob, carol] = accounts;

  before(async () => {
      const {
        bananaToken,
        masterApe,
      } = await farm.deployMockFarm(accounts); // accounts passed will be used in the deployment
      this.masterApe = masterApe;
      this.bananaToken = bananaToken;
      this.priceGetter = await PriceGetter.new({ from: owner });
      this.bananaAllocator = await BananaAllocator.new(
        this.bananaToken.address, 
        this.priceGetter.address, 
        this.masterApe.address,
        { from: owner }
      );
      await this.bananaToken.mint(this.bananaAllocator.address, 10000, { from: owner });
  });

  describe('Setup Tests', async () => {
    it('Allocator has tokens', async () => {
      assert.equal(await this.bananaToken.balanceOf(this.bananaAllocator.address), '10000', 'wen tokens ser');
    });
  });

  describe('Add & Sync Allocators', async () => {
    it('Add allocation 1', async () => {
      await this.bananaAllocator.addAllocation('Allocation 1', 10, [dev], { from: owner });
    });
    it('Add allocation 2', async () => {
      await this.bananaAllocator.addAllocation('Allocation 2', 10, [alice, bob], { from: owner });
    });
    it('Add allocation 3', async () => {
      await this.bananaAllocator.addAllocation('Allocation 3', 80, [carol, alice, bob], { from: owner });
    });

    it('Negative case: Fail to add allocation.', async () => {
      await expectRevert(this.bananaAllocator.addAllocation('Faulty Allocation', 100, [bob], { from: dev }),
      'Ownable: caller is not the owner -- Reason given: Ownable: caller is not the owner.'
      );
    });

    it('Sync Allocations 1', async () => {
      // Syncs the allocation
      await this.bananaAllocator.withdrawAllocation(0, 0, { from: dev });
      const timestamp = await this.bananaAllocator.lastSyncTimestamp();
      console.log('timestamp', timestamp.toString());
      assert.isAbove(timestamp.toNumber(), 0, 'Timestamp not captured.');
    });

    it('Get Tokens - Admin.', async () => {
      //const { allocationName, allocationAmount, tokensAvailable, allocationAdmins } = await this.bananaAllocator.allocationInfo(2);
      //console.log("TOKENS AVAILABLE", tokensAvailable.toString());
      //const totalAllocations = await this.bananaAllocator.totalAllocations();
      //console.log('total allocations', totalAllocations.toString());
      await this.bananaAllocator.withdrawAllocation(0, '100', { from: dev });
      assert.equal(await this.bananaToken.balanceOf(this.bananaAllocator.address), '9900', 'Wrong amount of tokens');
      assert.equal(await this.bananaToken.balanceOf(dev), '100', 'Wrong amount of tokens');
    });

    it('Negative case: Fail to get tokens', async () => {
      await expectRevert(this.bananaAllocator.withdrawAllocation(0, '100', { from: carol }),
      'Not an admin ser. -- Reason given: Not an admin ser.'
      );
    });

    it('Sync Allocations 2', async () => {
      await this.bananaToken.mint(this.bananaAllocator.address, 10000, { from: owner });
      await this.bananaAllocator.withdrawAllocation(0, 0, { from: dev });
    });
  });

  describe('Adjusting Allocation Admins', async () => {
    it('Add admin to existing allocation', async () => {
      await this.bananaAllocator.addAdminsToAllocation(0, [carol], { from: owner });
      await this.bananaAllocator.withdrawAllocation(0, '100', { from: carol });
      assert.equal(await this.bananaToken.balanceOf(this.bananaAllocator.address), '19800', 'Wrong amount of tokens');
      assert.equal(await this.bananaToken.balanceOf(carol), '100', 'Wrong amount of tokens');
    });
    it('Remove admin from existing allocation', async () => {
      await this.bananaAllocator.removeAdminsFromAllocation(0, [carol], { from: owner });
      await expectRevert(this.bananaAllocator.withdrawAllocation(0, '100', { from: carol }),
      'Not an admin ser. -- Reason given: Not an admin ser.'
      );
    });
  });

});