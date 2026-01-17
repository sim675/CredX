// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/// @title UtilityStaker (Tier 2: CGOV Generation Engine)
/// @notice Stake CredXUtilityToken to earn CGOV governance tokens
/// @dev Uses O(1) global index pattern, gas-optimized with unchecked math
interface ICGOV {
    function mint(address to, uint256 amount) external;
}

contract UtilityStaker {
    using SafeERC20 for IERC20;

    IERC20 public immutable utilityToken;
    ICGOV public immutable cgov;
    address public immutable admin;

    /// @notice CGOV minted per second per staked token (scaled by 1e18)
    uint256 public immutable rewardRate;

    uint256 public totalStaked;
    uint256 public rewardPerTokenStored;
    uint256 public lastUpdateTime;

    mapping(address => uint256) public stakedBalance;
    mapping(address => uint256) public userRewardPerTokenPaid;
    mapping(address => uint256) public pendingRewards;

    error ZeroAmount();
    error InsufficientBalance();

    event Staked(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    event RewardsClaimed(address indexed user, uint256 amount);

    constructor(
        address _utilityToken,
        address _cgov,
        uint256 _rewardRate
    ) {
        utilityToken = IERC20(_utilityToken);
        cgov = ICGOV(_cgov);
        admin = msg.sender;
        rewardRate = _rewardRate;
        lastUpdateTime = block.timestamp;
    }

    /// @notice Calculate current reward per token (scaled by 1e18)
    function rewardPerToken() public view returns (uint256) {
        if (totalStaked == 0) {
            return rewardPerTokenStored;
        }
        unchecked {
            uint256 elapsed = block.timestamp - lastUpdateTime;
            return rewardPerTokenStored + (elapsed * rewardRate * 1e18) / totalStaked;
        }
    }

    /// @notice Calculate earned CGOV for an account
    function earned(address account) public view returns (uint256) {
        unchecked {
            uint256 balance = stakedBalance[account];
            uint256 rewardDelta = rewardPerToken() - userRewardPerTokenPaid[account];
            return pendingRewards[account] + (balance * rewardDelta) / 1e18;
        }
    }

    modifier updateReward(address account) {
        rewardPerTokenStored = rewardPerToken();
        lastUpdateTime = block.timestamp;
        if (account != address(0)) {
            pendingRewards[account] = earned(account);
            userRewardPerTokenPaid[account] = rewardPerTokenStored;
        }
        _;
    }

    /// @notice Stake utility tokens to start earning CGOV
    /// @param amount Amount of utility tokens to stake
    function stake(uint256 amount) external updateReward(msg.sender) {
        if (amount == 0) revert ZeroAmount();
        
        unchecked {
            totalStaked += amount;
            stakedBalance[msg.sender] += amount;
        }
        
        utilityToken.safeTransferFrom(msg.sender, address(this), amount);
        emit Staked(msg.sender, amount);
    }

    /// @notice Withdraw staked utility tokens
    /// @param amount Amount to withdraw
    function withdraw(uint256 amount) external updateReward(msg.sender) {
        if (amount == 0) revert ZeroAmount();
        if (stakedBalance[msg.sender] < amount) revert InsufficientBalance();
        
        unchecked {
            totalStaked -= amount;
            stakedBalance[msg.sender] -= amount;
        }
        
        utilityToken.safeTransfer(msg.sender, amount);
        emit Withdrawn(msg.sender, amount);
    }

    /// @notice Claim earned CGOV tokens (minted to caller)
    function claimRewards() external updateReward(msg.sender) {
        uint256 reward = pendingRewards[msg.sender];
        if (reward > 0) {
            pendingRewards[msg.sender] = 0;
            cgov.mint(msg.sender, reward);
            emit RewardsClaimed(msg.sender, reward);
        }
    }

    /// @notice Withdraw all and claim rewards in one transaction
    function exit() external {
        uint256 balance = stakedBalance[msg.sender];
        if (balance > 0) {
            // Inline withdraw logic
            rewardPerTokenStored = rewardPerToken();
            lastUpdateTime = block.timestamp;
            pendingRewards[msg.sender] = earned(msg.sender);
            userRewardPerTokenPaid[msg.sender] = rewardPerTokenStored;
            
            unchecked {
                totalStaked -= balance;
                stakedBalance[msg.sender] = 0;
            }
            utilityToken.safeTransfer(msg.sender, balance);
            emit Withdrawn(msg.sender, balance);
        }
        
        uint256 reward = pendingRewards[msg.sender];
        if (reward > 0) {
            pendingRewards[msg.sender] = 0;
            cgov.mint(msg.sender, reward);
            emit RewardsClaimed(msg.sender, reward);
        }
    }
}
