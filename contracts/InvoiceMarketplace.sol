// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./InvoiceNFT.sol";
import "./StakingRewards.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @title InvoiceMarketplace for MSMEs, investors, and big buyers on Polygon
/// @notice Simple invoice financing marketplace using native MATIC
contract InvoiceMarketplace is ReentrancyGuard {
    enum Status {
        None,
        PendingBuyer,
        Fundraising,
        Funded,
        Repaid,
        Defaulted
    }

    struct Invoice {
        uint256 id;
        address msme;
        address buyer;
        uint256 amount; // total invoice amount in wei (MATIC)
        uint256 fundedAmount; // how much investors have funded so far
        uint256 dueDate; // unix timestamp
        uint256 discountRate; // in basis points, e.g. 100 = 1%
        Status status;
        string metadataURI; // IPFS hash or off-chain metadata link
        address exclusiveInvestor; // NEW: address(0) for public, or specific address for private
    }

    uint256 public nextInvoiceId;
    mapping(uint256 => Invoice) public invoices;
    mapping(uint256 => address[]) private _investors;
    mapping(uint256 => mapping(address => uint256)) public investments;
    // Gross amount repaid by the buyer (principal + interest)
    mapping(uint256 => uint256) public totalRepaid;
    // Net amount available to investors after protocol fee
    mapping(uint256 => uint256) public totalRepaidForInvestors;

    address public owner;
    bool public paused;
    uint256 public feeBps;
    InvoiceNFT public invoiceNFT;
    StakingRewards public stakingRewards;
    bool private _initialized;

    event InvoiceCreated(
        uint256 indexed id,
        address indexed msme,
        address indexed buyer,
        uint256 amount,
        uint256 dueDate,
        uint256 discountRate,
        string metadataURI,
        address exclusiveInvestor // Updated event
    );

    event Invested(
        uint256 indexed id,
        address indexed investor,
        uint256 amount,
        uint256 fundedAmount
    );

    event InvoiceFunded(uint256 indexed id);
    event InvoiceRepaid(uint256 indexed id, uint256 totalRepaid);
    event InvoiceDefaulted(uint256 indexed id);
    event InvoiceConfirmed(uint256 indexed id, address indexed buyer);
    event RepaymentClaimed(uint256 indexed id, address indexed investor, uint256 amount);
    event RefundClaimed(uint256 indexed id, address indexed investor, uint256 amount);

    modifier invoiceExists(uint256 id) {
        require(invoices[id].status != Status.None, "Invoice does not exist");
        _;
    }

    modifier onlyBuyer(uint256 id) {
        require(msg.sender == invoices[id].buyer, "Only buyer can call");
        _;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    modifier whenNotPaused() {
        require(!paused, "Paused");
        _;
    }

    function initialize(
        address _invoiceNFT,
        address payable _stakingRewards,
        uint256 _feeBps
    ) external {
        require(!_initialized, "Already initialized");
        require(_invoiceNFT != address(0), "NFT zero");
        require(_stakingRewards != address(0), "Staking zero");
        require(_feeBps <= 10_000, "fee too high");

        owner = msg.sender;
        invoiceNFT = InvoiceNFT(_invoiceNFT);
        stakingRewards = StakingRewards(_stakingRewards);

        feeBps = _feeBps;
        _initialized = true;
    }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Owner zero");
        owner = newOwner;
    }

    function pause() external onlyOwner {
        paused = true;
    }

    function unpause() external onlyOwner {
        paused = false;
    }

    function setFeeBps(uint256 _feeBps) external onlyOwner {
        require(_feeBps <= 10_000, "fee too high");
        feeBps = _feeBps;
    }

    function setInvoiceNFT(address _invoiceNFT) external onlyOwner {
        require(_invoiceNFT != address(0), "NFT zero");
        invoiceNFT = InvoiceNFT(_invoiceNFT);
    }

    function setStakingRewards(address payable _stakingRewards) external onlyOwner {
        require(_stakingRewards != address(0), "Staking zero");
        stakingRewards = StakingRewards(_stakingRewards);
    }

    /// @notice Create a new invoice listed for funding
    /// @param buyer Address of the big buyer who will repay the invoice
    /// @param amount Total invoice amount in wei (MATIC)
    /// @param dueDate Due date as unix timestamp
    /// @param discountRate Discount rate in basis points (1% = 100)
    /// @param metadataURI Off-chain metadata (e.g. IPFS/IPNS/HTTPS)
    /// @param exclusiveInvestor Use address(0) for Public, or specific address for Private
    function createInvoice(
        address buyer,
        uint256 amount,
        uint256 dueDate,
        uint256 discountRate,
        string calldata metadataURI,
        address exclusiveInvestor // NEW parameter
    ) external whenNotPaused returns (uint256) {
        require(buyer != address(0), "Buyer required");
        require(amount > 0, "Amount must be > 0");
        require(dueDate > block.timestamp, "Due date must be in future");

        nextInvoiceId += 1;
        uint256 id = nextInvoiceId;

        invoices[id] = Invoice({
            id: id,
            msme: msg.sender,
            buyer: buyer,
            amount: amount,
            fundedAmount: 0,
            dueDate: dueDate,
            discountRate: discountRate,
            status: Status.PendingBuyer,
            metadataURI: metadataURI,
            exclusiveInvestor: exclusiveInvestor // NEW assignment
        });

        emit InvoiceCreated(
            id,
            msg.sender,
            buyer,
            amount,
            dueDate,
            discountRate,
            metadataURI,
            exclusiveInvestor
        );

        if (address(invoiceNFT) != address(0)) {
            invoiceNFT.mintInvoice(msg.sender, id, metadataURI);
        }

        return id;
    }

    function confirmInvoice(uint256 id) external invoiceExists(id) onlyBuyer(id) whenNotPaused {
        Invoice storage inv = invoices[id];
        require(inv.status == Status.PendingBuyer, "Waiting for Buyer");
        inv.status = Status.Fundraising;
        emit InvoiceConfirmed(id, inv.buyer);
    }

    /// @notice Invest native MATIC into an invoice that is currently fundraising
    function investInInvoice(uint256 id) external payable invoiceExists(id) whenNotPaused nonReentrant {
        Invoice storage inv = invoices[id];
        require(inv.status == Status.Fundraising, "Not fundraising");
        require(block.timestamp <= inv.dueDate, "Invoice expired");
        
        // NEW: Check for private investor restriction
        if (inv.exclusiveInvestor != address(0)) {
            require(msg.sender == inv.exclusiveInvestor, "Only exclusive investor allowed");
        }

        require(msg.value > 0, "No value sent");
        require(inv.fundedAmount + msg.value <= inv.amount, "Overfunding");

        if (investments[id][msg.sender] == 0) {
            _investors[id].push(msg.sender);
        }

        investments[id][msg.sender] += msg.value;
        inv.fundedAmount += msg.value;

        emit Invested(id, msg.sender, msg.value, inv.fundedAmount);

        if (inv.fundedAmount == inv.amount) {
            inv.status = Status.Funded;
            emit InvoiceFunded(id);

            (bool sent, ) = inv.msme.call{value: inv.amount}("");
            require(sent, "Transfer to MSME failed");
        }
    }

    function repayInvoice(uint256 id) external payable invoiceExists(id) onlyBuyer(id) whenNotPaused nonReentrant {
        Invoice storage inv = invoices[id];
        require(inv.status == Status.Funded, "Invoice not funded");

        uint256 interest = (inv.amount * inv.discountRate) / 10_000;
        uint256 totalOwed = inv.amount + interest;
        require(msg.value == totalOwed, "Incorrect repayment amount");

        inv.status = Status.Repaid;

        uint256 fee = (interest * feeBps) / 10_000;
        uint256 amountForInvestors = msg.value - fee;
        totalRepaid[id] = msg.value;
        totalRepaidForInvestors[id] = amountForInvestors;

        if (fee > 0 && address(stakingRewards) != address(0)) {
            stakingRewards.notifyRewardAmount{value: fee}();
        }

        emit InvoiceRepaid(id, msg.value);
    }

    function claimRepayment(uint256 id) external invoiceExists(id) whenNotPaused nonReentrant {
        Invoice storage inv = invoices[id];
        require(inv.status == Status.Repaid, "Invoice not repaid");

        uint256 principal = investments[id][msg.sender];
        require(principal > 0, "No investment");

        uint256 amountForInvestors = totalRepaidForInvestors[id];
        require(amountForInvestors > 0, "No funds");

        uint256 payout = (amountForInvestors * principal) / inv.amount;
        investments[id][msg.sender] = 0;

        (bool sent, ) = payable(msg.sender).call{value: payout}("");
        require(sent, "Payout failed");

        emit RepaymentClaimed(id, msg.sender, payout);
    }

    function claimRefund(uint256 id) external invoiceExists(id) whenNotPaused nonReentrant {
        Invoice storage inv = invoices[id];
        require(inv.status == Status.Fundraising, "Not fundraising");
        require(block.timestamp > inv.dueDate, "Invoice not expired");

        uint256 principal = investments[id][msg.sender];
        require(principal > 0, "No investment");

        investments[id][msg.sender] = 0;
        inv.fundedAmount -= principal;

        (bool sent, ) = payable(msg.sender).call{value: principal}("");
        require(sent, "Refund failed");

        emit RefundClaimed(id, msg.sender, principal);
    }

    function markDefaulted(uint256 id) external invoiceExists(id) {
        Invoice storage inv = invoices[id];
        require(inv.status == Status.Funded, "Cannot default");
        require(block.timestamp > inv.dueDate, "Not past due date");

        inv.status = Status.Defaulted;
        emit InvoiceDefaulted(id);
    }

    function getInvestors(uint256 id) external view invoiceExists(id) returns (address[] memory) {
        return _investors[id];
    }
}