// scripts/check-invoice-nft.js
const hre = require("hardhat");

async function main() {
  const marketplaceAddr = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
  const marketplace = await hre.ethers.getContractAt(
    "InvoiceMarketplace",
    marketplaceAddr
  );
  console.log("invoiceNFT on-chain:", await marketplace.invoiceNFT());
}

main();