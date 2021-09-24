const { accounts, contract } = require('@openzeppelin/test-environment');
const { BN, expectRevert } = require('@openzeppelin/test-helpers');
const { farm, dex } = require('@apeswapfinance/test-helpers');
const { expect, assert } = require('chai');

const MasterApeAdmin = contract.fromArtifact('MasterApeAdmin'); // Loads a compiled contract

async function assertFixedFarmPercentages(masterApe, fixedFarmDetails, buffer = 2) {
  const totalMasterApeAllocation = await masterApe.totalAllocPoint();

  for (let index = 0; index < fixedFarmDetails.length; index++) {
    const fixedFarmDetail = fixedFarmDetails[index];
    const { allocPoint } = await masterApe.getPoolInfo(fixedFarmDetail.pid);
    actualAllocationPercent = (allocPoint.mul(new BN('1000')).div(totalMasterApeAllocation)).toNumber();

    assert.isAtLeast(actualAllocationPercent, fixedFarmDetail.percentage - buffer,
      `Fixed farm allocation for pid ${fixedFarmDetail.pid} is too low`);
    assert.isAtMost(actualAllocationPercent, fixedFarmDetail.percentage + buffer,
      `Fixed farm allocation for pid ${fixedFarmDetail.pid} is too high`);
  }
}

describe('MasterApeAdmin', async function () {
  const [owner, farmAdmin, alice] = accounts;

  describe('add/update batch farms', function () {
    this.NUM_POOLS = 20;
    this.FIXED_PERCENTAGE_FARMS = [
      {
        pid: 1,
        percentage: 100 // 10%
      },
      {
        pid: 5,
        percentage: 50 // 5%
      },
      {
        pid: 10,
        percentage: 25 // 5%
      },
    ]

    before(async () => {
      const {
        //   bananaToken,
        //   bananaSplitBar,
        masterApe,
      } = await farm.deployMockFarm(accounts); // accounts passed will be used in the deployment
      this.masterApe = masterApe;

      const {
        // dexFactory,
        // mockWBNB,
        // mockTokens,
        dexPairs,
      } = await dex.deployMockDex(accounts, this.NUM_POOLS - 1);
      this.dexPairs = dexPairs;

      this.masterApeAdmin = await MasterApeAdmin.new(this.masterApe.address, farmAdmin, { from: owner });
      await this.masterApe.transferOwnership(this.masterApeAdmin.address, { from: owner });
    });

    it('should add batch farms through MasterApeAdmin', async () => {
      let addresses = [];
      let allocations = [];

      for (let index = 0; index < this.dexPairs.length; index++) {
        const ALLOCATION_MULTIPLIER = 10;
        const dexPair = this.dexPairs[index];
        addresses.push(dexPair.address);
        allocations.push((index * ALLOCATION_MULTIPLIER) + 1);

      }

      // TEST: Revert with non farm admin
      await this.masterApeAdmin.addMasterApeFarms(allocations, addresses, true, { from: farmAdmin });
      for (let index = 0; index < this.FIXED_PERCENTAGE_FARMS.length; index++) {
        const fixedFarmDetails = this.FIXED_PERCENTAGE_FARMS[index];
        await this.masterApeAdmin.addFixedPercentFarmAllocation(fixedFarmDetails.pid, fixedFarmDetails.percentage, false, { from: farmAdmin });
      }

      await assertFixedFarmPercentages(this.masterApe, this.FIXED_PERCENTAGE_FARMS);

      expect((await this.masterApe.poolLength()).toNumber()).to.equal(this.NUM_POOLS);
    });


    it('should set fixedFarmPercentages', async () => {
      this.FIXED_PERCENTAGE_UPDATE = this.FIXED_PERCENTAGE_FARMS.map(({ pid, percentage }) => { return { pid, percentage: percentage * 2 } });

      for (let index = 0; index < this.FIXED_PERCENTAGE_UPDATE.length; index++) {
        const fixedFarmDetails = this.FIXED_PERCENTAGE_UPDATE[index];
        await this.masterApeAdmin.setFixedPercentFarmAllocation(fixedFarmDetails.pid, fixedFarmDetails.percentage, false, { from: farmAdmin });
      }

      await assertFixedFarmPercentages(this.masterApe, this.FIXED_PERCENTAGE_UPDATE);
    });
  });

  describe('owner functions', async function () {

    before(async () => {
      const {
        //   bananaToken,
        //   bananaSplitBar,
        masterApe,
      } = await farm.deployMockFarm(accounts); // accounts passed will be used in the deployment
      this.masterApe = masterApe;

      const {
        // dexFactory,
        // mockWBNB,
        // mockTokens,
        dexPairs,
      } = await dex.deployMockDex(accounts, this.NUM_POOLS - 1);
      this.dexPairs = dexPairs;

      this.masterApeAdmin = await MasterApeAdmin.new(this.masterApe.address, farmAdmin, { from: owner });
      await this.masterApe.transferOwnership(this.masterApeAdmin.address, { from: owner });
    });

    describe('negative test cases', async () => {

      it('should NOT adjust the MasterApe bonus multiplier from wrong address', async () => {
        const NEW_MULTIPLIER = 50;
        await expectRevert(this.masterApeAdmin.updateMasterApeMultiplier(NEW_MULTIPLIER, { from: alice }),
          'Ownable: caller is not the owner'
        );
      });

      it('should NOT transfer MasterApe owner to owner of MasterApeAdmin from wrong address', async () => {
        await expectRevert(this.masterApeAdmin.transferMasterApeOwnershipToCurrentOwner({ from: alice }),
          'Ownable: caller is not the owner'
        );
      });

    });

    describe('positive test cases', async () => {

      it('should set adjust the MasterApe bonus multiplier', async () => {
        const NEW_MULTIPLIER = 50;
        await this.masterApeAdmin.updateMasterApeMultiplier(NEW_MULTIPLIER, { from: owner });
        const bonusMultiplier = await this.masterApe.BONUS_MULTIPLIER();
        assert.equal(bonusMultiplier, NEW_MULTIPLIER, `Multiplier update inaccurate`)
      });

      it('should transfer MasterApe owner to owner of MasterApeAdmin', async () => {
        await this.masterApeAdmin.transferMasterApeOwnershipToCurrentOwner({ from: owner });
        const masterApeOwner = await this.masterApe.owner();
        assert.equal(masterApeOwner, owner, `Owner of MasterApe not transferred to owner of MasterApeAdmin`)
      });
    });
  });
});