// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/// @title CredXUtilityToken (Tier 1: Access)
/// @notice Lightweight ERC20 for MSMEs and Investors, admin-minted only
/// @dev Gas-optimized for Sepolia/Amoy with minimal storage
contract CredXUtilityToken is ERC20 {
    address public immutable admin;

    error NotAdmin();
    error ZeroAddress();
    error ZeroAmount();

    event AdminMint(address indexed to, uint256 amount);

    modifier onlyAdmin() {
        if (msg.sender != admin) revert NotAdmin();
        _;
    }

    constructor() ERC20("CredX Utility Token", "CREDX") {
        admin = msg.sender;
    }

    /// @notice Mint tokens to MSMEs or Investors
    /// @param to Recipient address
    /// @param amount Amount to mint
    function mint(address to, uint256 amount) external onlyAdmin {
        if (to == address(0)) revert ZeroAddress();
        if (amount == 0) revert ZeroAmount();
        _mint(to, amount);
        emit AdminMint(to, amount);
    }
}
