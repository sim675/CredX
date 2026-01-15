// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title InvoiceNFT
/// @notice ERC721 token representing invoice documents/reputation (not financial claims)
contract InvoiceNFT is ERC721URIStorage, Ownable {
    address public marketplace;

    event MarketplaceUpdated(address indexed oldMarketplace, address indexed newMarketplace);

    constructor() ERC721("CredX Invoice", "CINVOICE") Ownable(msg.sender) {}

    function setMarketplace(address _marketplace) external onlyOwner {
        require(_marketplace != address(0), "Marketplace zero address");
        emit MarketplaceUpdated(marketplace, _marketplace);
        marketplace = _marketplace;
    }

    /// @notice Mint an invoice NFT to the MSME when an invoice is created
    /// @dev Can only be called by the configured marketplace contract
    function mintInvoice(address to, uint256 tokenId, string calldata uri) external {
        require(msg.sender == marketplace, "Only marketplace");
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
    }
}
