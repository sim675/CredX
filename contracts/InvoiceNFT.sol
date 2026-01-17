// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title InvoiceNFT (Asset Link)
/// @notice ERC721 representing invoice documents with repayment and 5% fee routing
/// @dev Gas-optimized with immutable addresses and custom errors
interface IStakingRewards {
    function notifyRewardAmount() external payable;
}

contract InvoiceNFT is ERC721URIStorage, Ownable {
    address public marketplace;
    address payable public immutable stakingRewards;

    uint256 public constant FEE_BPS = 500; // 5% protocol fee

    struct InvoiceData {
        uint256 amount;
        address buyer;
        bool repaid;
    }

    mapping(uint256 => InvoiceData) public invoiceData;

    error ZeroAddress();
    error OnlyMarketplace();
    error OnlyBuyer();
    error AlreadyRepaid();
    error IncorrectAmount();
    error TransferFailed();

    event MarketplaceUpdated(address indexed oldMarketplace, address indexed newMarketplace);
    event InvoiceRepaid(uint256 indexed tokenId, address indexed buyer, uint256 amount, uint256 fee);

    constructor(address payable _stakingRewards) ERC721("CredX Invoice", "CINVOICE") Ownable(msg.sender) {
        if (_stakingRewards == address(0)) revert ZeroAddress();
        stakingRewards = _stakingRewards;
    }

    function setMarketplace(address _marketplace) external onlyOwner {
        if (_marketplace == address(0)) revert ZeroAddress();
        emit MarketplaceUpdated(marketplace, _marketplace);
        marketplace = _marketplace;
    }

    /// @notice Mint an invoice NFT to the MSME when an invoice is created
    /// @param to MSME address
    /// @param tokenId Invoice ID
    /// @param uri Metadata URI
    /// @param amount Invoice amount in wei
    /// @param buyer Big buyer address who will repay
    function mintInvoice(
        address to,
        uint256 tokenId,
        string calldata uri,
        uint256 amount,
        address buyer
    ) external {
        if (msg.sender != marketplace) revert OnlyMarketplace();
        
        invoiceData[tokenId] = InvoiceData({
            amount: amount,
            buyer: buyer,
            repaid: false
        });
        
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
    }

    /// @notice Repay an invoice - 5% fee goes to StakingRewards, rest to MSME
    /// @param tokenId Invoice NFT ID to repay
    function repayInvoice(uint256 tokenId) external payable {
        InvoiceData storage data = invoiceData[tokenId];
        
        if (msg.sender != data.buyer) revert OnlyBuyer();
        if (data.repaid) revert AlreadyRepaid();
        if (msg.value != data.amount) revert IncorrectAmount();

        data.repaid = true;

        // Calculate 5% protocol fee
        uint256 fee;
        uint256 msmeAmount;
        unchecked {
            fee = (msg.value * FEE_BPS) / 10_000;
            msmeAmount = msg.value - fee;
        }

        // Send fee to StakingRewards vault
        if (fee > 0) {
            IStakingRewards(stakingRewards).notifyRewardAmount{value: fee}();
        }

        // Send remainder to MSME (NFT owner)
        address msme = ownerOf(tokenId);
        (bool sent, ) = payable(msme).call{value: msmeAmount}("");
        if (!sent) revert TransferFailed();

        emit InvoiceRepaid(tokenId, msg.sender, msg.value, fee);
    }

    /// @notice Check if an invoice has been repaid
    function isRepaid(uint256 tokenId) external view returns (bool) {
        return invoiceData[tokenId].repaid;
    }
}
