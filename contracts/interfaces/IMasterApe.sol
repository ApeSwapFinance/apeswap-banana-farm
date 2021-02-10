pragma solidity 0.6.12;


interface IMasterApe {
    function updateMultiplier(uint256 multiplierNumber) external; // onlyOwner
    function add(uint256 _allocPoint, address _lpToken, bool _withUpdate) external; // onlyOwner
    function set(uint256 _pid, uint256 _allocPoint, bool _withUpdate) external; // onlyOwner
    function poolLength() external view returns (uint256);
    function checkPoolDuplicate(address _lpToken) external view;
    function getMultiplier(uint256 _from, uint256 _to) external view returns (uint256);
    function pendingCake(uint256 _pid, address _user) external view returns (uint256);
    function massUpdatePools() external;
    function updatePool(uint256 _pid) external; // validatePool(_pid);
    function deposit(uint256 _pid, uint256 _amount) external; // validatePool(_pid);
    function withdraw(uint256 _pid, uint256 _amount) external; // validatePool(_pid);
    function enterStaking(uint256 _amount) external;
    function leaveStaking(uint256 _amount) external;
    function emergencyWithdraw(uint256 _pid) external;
    function getPoolInfo(uint256 _pid) external view;
    function dev(address _devaddr) external;
}