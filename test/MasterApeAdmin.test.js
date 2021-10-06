const { accounts, contract } = require('@openzeppelin/test-environment');
const { BN, expectRevert } = require('@openzeppelin/test-helpers');
const { farm, dex } = require('@apeswapfinance/test-helpers');
const { expect, assert } = require('chai');

const MasterApeAdmin = contract.fromArtifact('MasterApeAdmin'); // Loads a compiled contract

const SHOW_LOGS = true
const log = (message) => {
  SHOW_LOGS && console.dir(message);
}

const [owner, farmAdmin, alice] = accounts;

// TEST: large amount (10000+) of pids 
// TEST: max amount of farmAdds
// TEST: max amount of farmSets
// TEST: high range of buffer

async function assertFixedFarmPercentages(masterApe, fixedFarmDetails, buffer = 3) {
  const totalMasterApeAllocation = await masterApe.totalAllocPoint();

  for (let index = 0; index < fixedFarmDetails.length; index++) {
    const fixedFarmDetail = fixedFarmDetails[index];

    const { allocPoint } = await masterApe.getPoolInfo(fixedFarmDetail.pid);
    actualAllocationPercent = (allocPoint.mul(new BN('10000')).div(totalMasterApeAllocation)).toNumber();

    assert.isAtLeast(actualAllocationPercent, fixedFarmDetail.percentage - buffer,
      `Fixed farm allocation for pid ${fixedFarmDetail.pid} is too low`);
    assert.isAtMost(actualAllocationPercent, fixedFarmDetail.percentage + buffer,
      `Fixed farm allocation for pid ${fixedFarmDetail.pid} is too high`);
  }
}

async function setupMasterApeAdmin(that, numPairs) {
  const {
    //   bananaToken,
    //   bananaSplitBar,
    masterApe,
  } = await farm.deployMockFarm(accounts); // accounts passed will be used in the deployment
  that.masterApe = masterApe;

  const {
    // dexFactory,
    // mockWBNB,
    // mockTokens,
    dexPairs,
  } = await dex.deployMockDex(accounts, numPairs);
  that.dexPairs = dexPairs;

  that.masterApeAdmin = await MasterApeAdmin.new(that.masterApe.address, farmAdmin, { from: owner });
  await that.masterApe.transferOwnership(that.masterApeAdmin.address, { from: owner });
}

describe('MasterApeAdmin', async function () {
  this.timeout(10000);

  describe('onlyFarmAdmin functions', async () => {
    this.NUM_POOLS = 20;
    this.FIXED_PERCENTAGE_FARMS = [
      {
        pid: 1,
        percentage: 1000 // 10%
      },
      {
        pid: 5,
        percentage: 500 // 5%
      },
      {
        pid: 10,
        percentage: 250 // 2.5%
      },
    ]
    this.FIXED_PERCENTAGE_PIDS = this.FIXED_PERCENTAGE_FARMS.map(farm => farm.pid);

    before(async () => {
      await setupMasterApeAdmin(this, this.NUM_POOLS - 1);
    });


    describe('farm admin ownership', async () => {
      it('should transfer farm admin ownership', async () => {
        await this.masterApeAdmin.transferFarmAdminOwnership(alice, { from: farmAdmin });
        assert.equal(await this.masterApeAdmin.farmAdmin(), alice, 'farm admin owner did not change');
        await this.masterApeAdmin.transferFarmAdminOwnership(farmAdmin, { from: alice });
      });

      it('should NOT transfer farm admin ownership from non farmAdmin account', async () => {
        await expectRevert(this.masterApeAdmin.transferFarmAdminOwnership(alice, { from: alice }),
          'must be called by farm admin'
        );
      });
    });

    describe('add/update batch farms', async () => {
      it('should add batch farms through MasterApeAdmin', async () => {
        let addresses = [];
        let allocations = [];

        for (let index = 0; index < this.dexPairs.length; index++) {
          const ALLOCATION_MULTIPLIER = 10;
          const dexPair = this.dexPairs[index];
          addresses.push(dexPair.address);
          allocations.push((index * ALLOCATION_MULTIPLIER) + 1);

        }

        await expectRevert(this.masterApeAdmin.addMasterApeFarms(allocations, addresses, true, { from: alice }),
          'must be called by farm admin'
        );
        await this.masterApeAdmin.addMasterApeFarms(allocations, addresses, true, { from: farmAdmin });

        await expectRevert(this.masterApeAdmin.addFixedPercentFarmAllocation(0, 100, false, { from: farmAdmin }),
          'cannot add reserved MasterApe pid 0'
        );

        for (let index = 0; index < this.FIXED_PERCENTAGE_FARMS.length; index++) {
          const fixedFarmDetails = this.FIXED_PERCENTAGE_FARMS[index];
          await this.masterApeAdmin.addFixedPercentFarmAllocation(fixedFarmDetails.pid, fixedFarmDetails.percentage, false, { from: farmAdmin });
          const { allocationPercent: fixedFarmAllocation, isActive: fixedFarmIsActive } = await this.masterApeAdmin.getFixedPercentFarmFromPid(fixedFarmDetails.pid);
          assert.equal(fixedFarmIsActive, true, 'fixed farm should be active')
          assert.equal(fixedFarmAllocation, fixedFarmDetails.percentage, 'fixed percentage farm allocation is incorrect')

        }
        // Check that allocations are accurate
        for (let pid = 1; pid < this.NUM_POOLS; pid++) {
          if (this.FIXED_PERCENTAGE_PIDS.includes(pid)) {
            continue; // Fixed percentage pids are checked below
          }
          const { allocPoint } = await this.masterApe.poolInfo(pid);
          assert.equal(allocPoint.toNumber(), allocations[pid - 1], `allocation for pid ${pid}, is inaccurate`)
        }

        await assertFixedFarmPercentages(this.masterApe, this.FIXED_PERCENTAGE_FARMS);

        expect((await this.masterApe.poolLength()).toNumber()).to.equal(this.NUM_POOLS);
      });

      it('should add set batch farm allocations through MasterApeAdmin', async () => {
        let pids = [];
        let allocations = [];

        for (let pid = 1; pid < this.NUM_POOLS; pid++) {
          const ALLOCATION_MULTIPLIER = 69;
          pids.push(pid);
          allocations.push((pid * ALLOCATION_MULTIPLIER) + 1);
        }

        await this.masterApeAdmin.setMasterApeFarms(pids, allocations, true, { from: farmAdmin });
        for (let pid = 1; pid < this.NUM_POOLS; pid++) {
          if (this.FIXED_PERCENTAGE_PIDS.includes(pid)) {
            continue; // Fixed percentage pids are checked below
          }
          const { allocPoint } = await this.masterApe.poolInfo(pid);
          assert.equal(allocPoint.toNumber(), allocations[pid - 1], `allocation for pid ${pid}, is inaccurate`)
        }
        await assertFixedFarmPercentages(this.masterApe, this.FIXED_PERCENTAGE_FARMS);
      });
    });

    describe('fixed percentage farms', async () => {
      it('should set fixed percentage farm', async () => {
        this.FIXED_PERCENTAGE_UPDATE = this.FIXED_PERCENTAGE_FARMS.map(({ pid, percentage }) => { return { pid, percentage: percentage * 2 } });

        for (let index = 0; index < this.FIXED_PERCENTAGE_UPDATE.length; index++) {
          const fixedFarmDetails = this.FIXED_PERCENTAGE_UPDATE[index];
          await expectRevert(this.masterApeAdmin.setFixedPercentFarmAllocation(fixedFarmDetails.pid, fixedFarmDetails.percentage, false, { from: alice }),
            'must be called by farm admin'
          );
          await expectRevert(this.masterApeAdmin.setFixedPercentFarmAllocation(fixedFarmDetails.pid, 1000000000, false, { from: farmAdmin }),
            'allocation out of bounds'
          );
          await this.masterApeAdmin.setFixedPercentFarmAllocation(fixedFarmDetails.pid, fixedFarmDetails.percentage, false, { from: farmAdmin });
          const { allocationPercent: fixedFarmAllocation, isActive: fixedFarmIsActive } = await this.masterApeAdmin.getFixedPercentFarmFromPid(fixedFarmDetails.pid);
          assert.equal(fixedFarmIsActive, true, 'fixed farm should be active')
          assert.equal(fixedFarmAllocation, fixedFarmDetails.percentage, 'fixed percentage farm allocation is incorrect')
        }

        await assertFixedFarmPercentages(this.masterApe, this.FIXED_PERCENTAGE_UPDATE);
      });

      it('should remove fixed percentage farm', async () => {
        this.FIXED_PERCENTAGE_UPDATE_2 = { ...this.FIXED_PERCENTAGE_UPDATE }
        this.FIXED_PERCENTAGE_UPDATE_2[0].percentage = 0;
        const { pid, percentage } = this.FIXED_PERCENTAGE_UPDATE_2[0]
        let totalFixedPercentFarmPercentage = await this.masterApeAdmin.totalFixedPercentFarmPercentage();
        assert.equal(totalFixedPercentFarmPercentage.toNumber(), 3500, 'total fixed percentage farm percentage is inaccurate')
        await this.masterApeAdmin.setFixedPercentFarmAllocation(pid, 0, false, { from: farmAdmin });
        // Set farm allocation to zero
        await this.masterApeAdmin.setMasterApeFarms([pid], [0], true, { from: farmAdmin });
        const { allocPoint: afterAllocationPoint } = await this.masterApe.poolInfo(pid);
        assert.equal(afterAllocationPoint.toNumber(), 0, 'fixed farm allocation should be 0')
        totalFixedPercentFarmPercentage = await this.masterApeAdmin.totalFixedPercentFarmPercentage();
        assert.equal(totalFixedPercentFarmPercentage.toNumber(), 1500, 'total fixed percentage farm percentage is inaccurate')
        const fixedPercentFarmLength = await this.masterApeAdmin.getNumberOfFixedPercentFarms();
        assert.equal(fixedPercentFarmLength, 2, 'fixed farm percentage length inaccurate')
        // Check fixed farm status
        const { allocationPercent: fixedFarmAllocation, isActive: fixedFarmIsActive } = await this.masterApeAdmin.getFixedPercentFarmFromPid(pid);
        assert.equal(fixedFarmIsActive, false, 'fixed farm should be inactive')
        assert.equal(fixedFarmAllocation, 0, 'fixed percentage farm allocation is incorrect');
        // Check that pool is disabled
        const { allocPoint } = await this.masterApe.poolInfo(pid);
        assert.equal(allocPoint.toNumber(), 0, `allocation for pid ${pid}, is inaccurate`)
        // Check that the fixed farm percentages are accurate
        await assertFixedFarmPercentages(this.masterApe, this.FIXED_PERCENTAGE_UPDATE_2);
      });
    });
  });

  describe('onlyOwner functions', async function () {

    before(async () => {
      await setupMasterApeAdmin(this, this.NUM_POOLS - 1);
    });

    describe('negative test cases', async () => {

      it('should NOT adjust the MasterApe bonus multiplier from wrong address', async () => {
        const NEW_MULTIPLIER = 50;
        await expectRevert(this.masterApeAdmin.updateMasterApeMultiplier(NEW_MULTIPLIER, { from: alice }),
          'Ownable: caller is not the owner'
        );
      });

      it('should NOT set pendingMasterApe admin from non-owner account', async () => {
        await expectRevert(this.masterApeAdmin.setPendingMasterApeOwner(alice, { from: alice }),
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

      it('should transfer MasterApe ownership from MasterApeAdmin', async () => {
        await this.masterApeAdmin.setPendingMasterApeOwner(owner, { from: owner });

        it('should NOT accept transfer of MasterApe ownership from non-pending owner', async () => {
          await expectRevert(this.masterApeAdmin.acceptMasterApeOwnership({ from: alice }),
            'Ownable: caller is not the owner'
          );
        });

        await this.masterApeAdmin.acceptMasterApeOwnership({ from: owner });
        const masterApeOwner = await this.masterApe.owner();
        assert.equal(masterApeOwner, owner, `Owner of MasterApe not transferred to owner`)
      });
    });
  });
});