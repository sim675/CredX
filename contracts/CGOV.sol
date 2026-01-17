// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";

/// @title CGOV (Tier 2: Governance Token)
/// @notice ERC20Votes governance token for on-chain DAO voting
/// @dev Only the UtilityStaker contract can mint CGOV
contract CGOV is ERC20, ERC20Permit, ERC20Votes {
    address public immutable minter;

    error NotMinter();
    error ZeroAddress();
    error ZeroAmount();

    modifier onlyMinter() {
        if (msg.sender != minter) revert NotMinter();
        _;
    }

    constructor(address _minter) 
        ERC20("CredX Governance", "CGOV") 
        ERC20Permit("CredX Governance") 
    {
        if (_minter == address(0)) revert ZeroAddress();
        minter = _minter;
    }

    /// @notice Mint CGOV to stakers via UtilityStaker
    /// @param to Recipient address
    /// @param amount Amount to mint
    function mint(address to, uint256 amount) external onlyMinter {
        if (to == address(0)) revert ZeroAddress();
        if (amount == 0) revert ZeroAmount();
        _mint(to, amount);
    }

    /// @notice Required override for ERC20Votes
    function _update(address from, address to, uint256 value) internal override(ERC20, ERC20Votes) {
        super._update(from, to, value);
    }

    /// @notice Required override for ERC20Permit/Nonces
    function nonces(address owner) public view override(ERC20Permit, Nonces) returns (uint256) {
        return super.nonces(owner);
    }
}
