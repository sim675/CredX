// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title InvoiceMarketplace for MSMEs, investors, and big buyers on Polygon
/// @notice Simple invoice financing marketplace using native MATIC
contract InvoiceMarketplace {
    enum Status {
        None,
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
    }

    uint256 public nextInvoiceId;
    mapping(uint256 => Invoice) public invoices;
    mapping(uint256 => address[]) private _investors;
    mapping(uint256 => mapping(address => uint256)) public investments;

    event InvoiceCreated(
        uint256 indexed id,
        address indexed msme,
        address indexed buyer,
        uint256 amount,
        uint256 dueDate,
        uint256 discountRate,
        string metadataURI
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

    modifier invoiceExists(uint256 id) {
        require(invoices[id].status != Status.None, "Invoice does not exist");
        _;
    }

    modifier onlyBuyer(uint256 id) {
        require(msg.sender == invoices[id].buyer, "Only buyer can call");
        _;
    }

    /// @notice Create a new invoice listed for funding
    /// @param buyer Address of the big buyer who will repay the invoice
    /// @param amount Total invoice amount in wei (MATIC)
    /// @param dueDate Due date as unix timestamp
    /// @param discountRate Discount rate in basis points (1% = 100)
    /// @param metadataURI Off-chain metadata (e.g. IPFS/IPNS/HTTPS)
    function createInvoice(
        address buyer,
        uint256 amount,
        uint256 dueDate,
        uint256 discountRate,
        string calldata metadataURI
    ) external returns (uint256) {
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
            status: Status.Fundraising,
            metadataURI: metadataURI
        });

        emit InvoiceCreated(
            id,
            msg.sender,
            buyer,
            amount,
            dueDate,
            discountRate,
            metadataURI
        );

        return id;
    }

    /// @notice Invest native MATIC into an invoice that is currently fundraising
    /// @dev msg.value is the investment amount
    function investInInvoice(uint256 id) external payable invoiceExists(id) {
        Invoice storage inv = invoices[id];
        require(inv.status == Status.Fundraising, "Not fundraising");
        require(msg.value > 0, "No value sent");
        require(inv.fundedAmount + msg.value <= inv.amount, "Overfunding");

        if (investments[id][msg.sender] == 0) {
            _investors[id].push(msg.sender);
        }

        investments[id][msg.sender] += msg.value;
        inv.fundedAmount += msg.value;

        emit Invested(id, msg.sender, msg.value, inv.fundedAmount);

        // When target is reached, mark as funded and forward principal to MSME
        if (inv.fundedAmount == inv.amount) {
            inv.status = Status.Funded;
            emit InvoiceFunded(id);

            (bool sent, ) = inv.msme.call{value: inv.amount}("");
            require(sent, "Transfer to MSME failed");
        }
    }

    /// @notice Buyer repays the invoice plus yield to investors
    /// @dev msg.value must equal principal + yield based on discountRate
    function repayInvoice(uint256 id)
        external
        payable
        invoiceExists(id)
        onlyBuyer(id)
    {
        Invoice storage inv = invoices[id];
        require(inv.status == Status.Funded, "Invoice not funded");

        uint256 totalOwed = inv.amount + ((inv.amount * inv.discountRate) / 10_000);
        require(msg.value == totalOwed, "Incorrect repayment amount");

        inv.status = Status.Repaid;

        address[] storage invs = _investors[id];
        uint256 len = invs.length;

        for (uint256 i = 0; i < len; i++) {
            address investor = invs[i];
            uint256 principal = investments[id][investor];
            if (principal == 0) continue;

            // Reset first to prevent re-entrancy on this state
            investments[id][investor] = 0;

            // Pro-rata share of total repayment (principal + yield)
            uint256 payout = (msg.value * principal) / inv.amount;

            (bool sent, ) = investor.call{value: payout}("");
            require(sent, "Payout failed");
        }

        emit InvoiceRepaid(id, msg.value);
    }

    /// @notice Mark an invoice as defaulted after the due date has passed
    function markDefaulted(uint256 id) external invoiceExists(id) {
        Invoice storage inv = invoices[id];
        require(
            inv.status == Status.Funded || inv.status == Status.Fundraising,
            "Cannot default"
        );
        require(block.timestamp > inv.dueDate, "Not past due date");

        inv.status = Status.Defaulted;
        emit InvoiceDefaulted(id);
    }

    /// @notice Get list of investors for an invoice
    function getInvestors(uint256 id)
        external
        view
        invoiceExists(id)
        returns (address[] memory)
    {
        return _investors[id];
    }
}
