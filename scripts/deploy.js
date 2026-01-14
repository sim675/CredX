const hre = require("hardhat");

async function main() {
  // 1. Get the signer (the account that will pay gas)
  // This explicitly connects your private key from hardhat.config.js to the factory
  const [deployer] = await hre.ethers.getSigners();

  console.log("-----------------------------------------------");
  console.log("Deploying contract with account:", deployer.address);
  
  // 2. Check balance to ensure you have enough MATIC on Amoy
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "MATIC");
  console.log("-----------------------------------------------");

  // 3. Get the Contract Factory
  const InvoiceMarketplace = await hre.ethers.getContractFactory("InvoiceMarketplace");

  console.log("Sending deployment transaction...");

  // 4. Deploy the contract
  const invoiceMarketplace = await InvoiceMarketplace.deploy();

  // 5. Wait for the transaction to be mined on the blockchain
  await invoiceMarketplace.waitForDeployment();

  const address = await invoiceMarketplace.getAddress();
  
  console.log("SUCCESS!");
  console.log("InvoiceMarketplace deployed to:", address);
  console.log("-----------------------------------------------");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Deployment Failed:");
    console.error(error);
    process.exit(1);
  });