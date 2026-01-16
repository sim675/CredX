// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @title StakingRewards
/// @notice Users stake the governance token and earn native MATIC from protocol fees
contract StakingRewards is ReentrancyGuard {
    IERC20 public immutable stakingToken; // GovernanceToken (CGOV)

    uint256 public totalSupply;
    mapping(address => uint256) public balances;

    // reward accounting (in MATIC)
    uint256 public rewardPerTokenStored;
    mapping(address => uint256) public userRewardPerTokenPaid;
    mapping(address => uint256) public rewards;

    event Staked(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    event RewardPaid(address indexed user, uint256 reward);
    event RewardsAdded(uint256 amount);

    constructor(address _stakingToken) {
        require(_stakingToken != address(0), "Staking token is zero");
        stakingToken = IERC20(_stakingToken);
    }

    modifier updateReward(address account) {
        if (account != address(0)) {
            rewards[account] = earned(account);
            userRewardPerTokenPaid[account] = rewardPerTokenStored;
        }
        _;
    }

    /// @notice Current reward per staked token (scaled by 1e18)
    function rewardPerToken() public view returns (uint256) {
        return rewardPerTokenStored;
    }

    /// @notice How much MATIC a user has earned but not yet claimed
    function earned(address account) public view returns (uint256) {
        uint256 balance = balances[account];
        if (balance == 0) {
            return rewards[account];
        }

        uint256 paid = userRewardPerTokenPaid[account];
        uint256 current = rewardPerTokenStored;
        uint256 pending = (balance * (current - paid)) / 1e18;
        return rewards[account] + pending;
    }

    /// @notice Stake governance tokens to earn MATIC rewards
    function stake(uint256 amount) external nonReentrant updateReward(msg.sender) {
        require(amount > 0, "Cannot stake 0");
        totalSupply += amount;
        balances[msg.sender] += amount;
        require(stakingToken.transferFrom(msg.sender, address(this), amount), "Stake transfer failed");
        emit Staked(msg.sender, amount);
    }

    /// @notice Withdraw staked governance tokens
    function withdraw(uint256 amount) public nonReentrant updateReward(msg.sender) {
        require(amount > 0, "Cannot withdraw 0");
        require(balances[msg.sender] >= amount, "Insufficient balance");
        totalSupply -= amount;
        balances[msg.sender] -= amount;
        require(stakingToken.transfer(msg.sender, amount), "Withdraw transfer failed");
        emit Withdrawn(msg.sender, amount);
    }

    /// @notice Claim accumulated MATIC rewards
    function getReward() public nonReentrant updateReward(msg.sender) {
        uint256 reward = rewards[msg.sender];
        if (reward > 0) {
            rewards[msg.sender] = 0;
            (bool sent, ) = payable(msg.sender).call{value: reward}("");
            require(sent, "Reward transfer failed");
            emit RewardPaid(msg.sender, reward);
        }
    }

    /// @notice Withdraw stake and claim rewards in a single transaction
    function exit() external {
        withdraw(balances[msg.sender]);
        getReward();
    }

    /// @notice Called by the marketplace to distribute new MATIC rewards
    /// @dev msg.value is the new reward amount to be shared among stakers
    function notifyRewardAmount() external payable {
        require(msg.value > 0, "No reward");
        require(totalSupply > 0, "No stakers");

        uint256 rewardPerTokenIncrement = (msg.value * 1e18) / totalSupply;
        rewardPerTokenStored += rewardPerTokenIncrement;

        emit RewardsAdded(msg.value);
    }

    receive() external payable {}
}
