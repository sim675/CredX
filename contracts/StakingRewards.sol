// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/// @title StakingRewards (Tier 3: Real-Yield Vault)
/// @notice Stake CGOV to earn native MATIC/POL from protocol fees
/// @dev Synthetix-style O(1) reward distribution, gas-optimized with unchecked math
contract StakingRewards {
    using SafeERC20 for IERC20;

    IERC20 public immutable stakingToken; // CGOV token

    uint256 public totalStaked;
    mapping(address => uint256) public stakedBalance;

    // O(1) reward accounting (in native MATIC/POL)
    uint256 public rewardPerTokenStored;
    mapping(address => uint256) public userRewardPerTokenPaid;
    mapping(address => uint256) public pendingRewards;

    error ZeroAmount();
    error InsufficientBalance();
    error TransferFailed();
    error NoStakers();

    event Staked(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    event RewardPaid(address indexed user, uint256 reward);
    event RewardsAdded(uint256 amount);

    constructor(address _stakingToken) {
        stakingToken = IERC20(_stakingToken);
    }

    /// @notice Current reward per staked token (scaled by 1e18)
    function rewardPerToken() public view returns (uint256) {
        return rewardPerTokenStored;
    }

    /// @notice Calculate earned MATIC for an account
    function earned(address account) public view returns (uint256) {
        unchecked {
            uint256 balance = stakedBalance[account];
            if (balance == 0) {
                return pendingRewards[account];
            }
            uint256 rewardDelta = rewardPerTokenStored - userRewardPerTokenPaid[account];
            return pendingRewards[account] + (balance * rewardDelta) / 1e18;
        }
    }

    modifier updateReward(address account) {
        if (account != address(0)) {
            pendingRewards[account] = earned(account);
            userRewardPerTokenPaid[account] = rewardPerTokenStored;
        }
        _;
    }

    /// @notice Stake CGOV tokens to earn MATIC rewards
    /// @param amount Amount of CGOV to stake
    function stake(uint256 amount) external updateReward(msg.sender) {
        if (amount == 0) revert ZeroAmount();
        
        unchecked {
            totalStaked += amount;
            stakedBalance[msg.sender] += amount;
        }
        
        stakingToken.safeTransferFrom(msg.sender, address(this), amount);
        emit Staked(msg.sender, amount);
    }

    /// @notice Withdraw staked CGOV tokens
    /// @param amount Amount to withdraw
    function withdraw(uint256 amount) public updateReward(msg.sender) {
        if (amount == 0) revert ZeroAmount();
        if (stakedBalance[msg.sender] < amount) revert InsufficientBalance();
        
        unchecked {
            totalStaked -= amount;
            stakedBalance[msg.sender] -= amount;
        }
        
        stakingToken.safeTransfer(msg.sender, amount);
        emit Withdrawn(msg.sender, amount);
    }

    /// @notice Claim accumulated MATIC rewards
    function getReward() public updateReward(msg.sender) {
        uint256 reward = pendingRewards[msg.sender];
        if (reward > 0) {
            pendingRewards[msg.sender] = 0;
            (bool sent, ) = payable(msg.sender).call{value: reward}("");
            if (!sent) revert TransferFailed();
            emit RewardPaid(msg.sender, reward);
        }
    }

    /// @notice Withdraw stake and claim rewards in one transaction
    function exit() external {
        uint256 balance = stakedBalance[msg.sender];
        if (balance > 0) {
            withdraw(balance);
        }
        getReward();
    }

    /// @notice Called by InvoiceNFT to distribute protocol fees
    /// @dev Implements O(1) Synthetix-style instant reward distribution
    function notifyRewardAmount() external payable {
        if (msg.value == 0) revert ZeroAmount();
        if (totalStaked == 0) revert NoStakers();

        unchecked {
            uint256 rewardPerTokenIncrement = (msg.value * 1e18) / totalStaked;
            rewardPerTokenStored += rewardPerTokenIncrement;
        }

        emit RewardsAdded(msg.value);
    }

    /// @notice Receive native MATIC/POL
    receive() external payable {}
}
