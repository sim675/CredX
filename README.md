CredX: Decentralized Invoice Factoring Protocol

Bridging Real-World Cash Flow with On-Chain Liquidity
CredX is a Web3 infrastructure layer built on the Weliptic Chain that transforms stagnant corporate invoices into liquid,yield-bearing assets.
By tokenizing accounts receivable as NFTs, we provide MSMEs with instant working capital and investors with "Real Yield" backed by actual trade settlement.


🏦 What is CredX?
CredX solves the liquidity gap for Micro, Small, and Medium Enterprises (MSMEs) through a trustless, investor-first factoring model:

🌱 MSMEs: Access instant liquidity by listing invoices as NFTs without needing to hold or stake native tokens.

🔨 Investors: Buy discounted invoice NFTs and earn interest upon repayment.

✅ Buyers: Settle debts directly to smart contracts, ensuring transparent and automated payment routing.

💹 $CGOV Stakers: Receive a 5% Protocol Fee from every successful repayment, creating sustainable "Real Yield."

🏗 Architecture
graph TD
    A[MSME: Mints Invoice NFT] -->|Lists on Marketplace| B(CredX Marketplace Contract)
    C[Investor: Funds Invoice] -->|Sends WLP/MATIC| B
    B -->|Discounted Funds| A
    D[Buyer: Repays Invoice] -->|Total Amount Due| B
    B -->|95% Principal + Interest| C
    B -->|5% Protocol Fee| E[$CGOV Staking Vault]


✨ Key Features
1. The "Bouncer" Logic (95/5 Split)
Our Smart Contracts act as automated escrow. When a Buyer repays, the funds never touch the MSME's wallet again. The contract instantly triggers a split: 95% to the Investor and 5% to the Staking Vault.
2. Invoice NFTs (ERC721/1155)Every invoice is tokenized. This prevents "Double Financing" (the same invoice being funded twice) and allows for a verifiable, time-stamped audit trail of corporate debt.
3. Real-Yield StakingUnlike inflationary DeFi protocols, $CGOV$ rewards are fueled by a 5% cut of real-world business transactions. As trade volume grows, the staking pool grows.
4. Smart Receipts
Upon successful transaction, our UI generates a dynamic on-chain receipt breaking down the Principal, Interest, and Protocol Contribution, providing total transparency to the Buyer.

🚀 Quick Start
Prerequisites
Node.js v20+

Wagmi / Viem

MetaMask (Connected to Weliptic Chain)

1. Clone Repository
git clone https://github.com/your-org/CredX.git
2. Setup Environment
pnpm install
3. Start Development
pnpm dev

Repository Structure

CredX/
├── contracts/               # Solidity Smart Contracts
│   ├── Marketplace.sol      # Core Escrow & Splitter Logic
│   ├── InvoiceNFT.sol       # ERC721 Tokenization
│   └── StakingVault.sol     # Fee Distribution Logic
├── frontend/                # Next.js 15 App Router
│   ├── src/
│   │   ├── components/      # UI: Sidebar, Modals, SuccessReceipt
│   │   ├── hooks/           # useInvoices, useAuth, useRepay
│   │   └── config/          # Weliptic Chain Configuration
├── subgraph/                # Data Indexing for Invoices
└── docs/                    # Pitch Decks & Technical Whitepaper

🛠 Tech Stack
Framework: Next.js 15
Web3: Wagmi v2, Viem, RainbowKit
Styling: Tailwind CSS, Shadcn/UI
Chain: Weliptic (EVM Compatible L2)

🗺 Roadmap
Q1 2026: Deploy to Weliptic Mainnet.
Q1 2026: Launch Success Receipt Modal & Automated 5% Split.
Q2 2026: Cross-chain liquidity bridging for Investors.
