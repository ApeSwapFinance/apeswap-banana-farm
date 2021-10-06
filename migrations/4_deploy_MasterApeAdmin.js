const { getNetworkConfig } = require('../deploy-config')
const MasterApeAdmin = artifacts.require("MasterApeAdmin");

module.exports = async function(deployer, network, accounts) {
    const { masterApeAddress, masterApeAdminOwner, farmAdmin} = getNetworkConfig(network, accounts);

    await deployer.deploy(MasterApeAdmin, masterApeAddress, farmAdmin);
    const masterApeAdmin = await MasterApeAdmin.at(MasterApeAdmin.address);
    await masterApeAdmin.transferOwnership(masterApeAdminOwner);

    const currentMasterApeAdminOwner = await masterApeAdmin.owner();
    const currentFarmAdmin = await masterApeAdmin.farmAdmin();

    console.dir({
      MasterApeAdminContract: masterApeAdmin.address,
      currentMasterApeAdminOwner,
      currentFarmAdmin,
    });
};