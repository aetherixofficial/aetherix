// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract AetherixStaking is Ownable {
    IERC20 public immutable aetxToken;
    IERC20 public immutable usdtToken;

    mapping(address => uint256) public stakes;
    mapping(address => uint256) public lastClaimTime;

    uint256 private constant APY = 5e16; // 0.05 * 10^18 = 5 * 10^16
    uint256 private constant YEAR = 365 days;

    event Staked(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    event RewardClaimed(address indexed user, uint256 amount);

    constructor(address _aetxAddress, address _usdtAddress) {
        aetxToken = IERC20(_aetxAddress);
        usdtToken = IERC20(_usdtAddress);
        lastClaimTime[msg.sender] = block.timestamp;
    }

    function stake(uint256 amount) external {
        require(amount > 0, "Amount must be > 0");
        _claimRewards(msg.sender);
        require(aetxToken.transferFrom(msg.sender, address(this), amount), "Stake failed");
        stakes[msg.sender] += amount;
        lastClaimTime[msg.sender] = block.timestamp;
        emit Staked(msg.sender, amount);
    }

    function withdraw(uint256 amount) external {
        require(amount > 0, "Amount must be > 0");
        _claimRewards(msg.sender);
        require(stakes[msg.sender] >= amount, "Not enough staked");
        stakes[msg.sender] -= amount;
        require(aetxToken.transfer(msg.sender, amount), "Withdraw failed");
        lastClaimTime[msg.sender] = block.timestamp;
        emit Withdrawn(msg.sender, amount);
    }

    function claimRewards() external {
        _claimRewards(msg.sender);
    }

    function _claimRewards(address user) internal {
        if (stakes[user] == 0) return;

        uint256 elapsedTime = block.timestamp - lastClaimTime[user];
        if (elapsedTime == 0) return;

        uint256 reward = (stakes[user] * APY * elapsedTime) / (1e18 * YEAR);

        if (reward > 0) {
            require(usdtToken.transfer(user, reward), "Reward transfer failed");
            emit RewardClaimed(user, reward);
        }

        lastClaimTime[user] = block.timestamp;
    }

    function myStake() external view returns (uint256) {
        return stakes[msg.sender];
    }

    function pendingReward(address user) external view returns (uint256) {
        if (stakes[user] == 0) return 0;
        uint256 elapsedTime = block.timestamp - lastClaimTime[user];
        return (stakes[user] * APY * elapsedTime) / (1e18 * YEAR);
    }
}