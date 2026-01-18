const hre = require("hardhat");

/**
 * Fresh deployment of InvoiceMarketplace (with pause functionality removed)
 * 
 * IMPORTANT: This creates a NEW contract address. You will need to:
 * 1. Update NEXT_PUBLIC_CONTRACT_ADDRESS in .env
 * 2. Update INVOICE_MARKETPLACE_ADDRESS in lib/contracts/addresses.ts
 * 3. Call invoiceNFT.setMarketplace(newProxyAddress) to wire the NFT contract
 */
async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("-----------------------------------------------");
  console.log("Fresh deployment of InvoiceMarketplace");
  console.log("Deploying with account:", deployer.address);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "MATIC");
  console.log("-----------------------------------------------");

  // Get existing contract addresses from your addresses.ts
  const INVOICE_NFT_ADDRESS = "0x980f2D43c3664B090F4b1B7B5f7E296B4c118c7D";
  
  console.log("Using existing InvoiceNFT:", INVOICE_NFT_ADDRESS);

  // 1. Deploy new InvoiceMarketplace implementation
  console.log("\n1. Deploying InvoiceMarketplace implementation...");
  const InvoiceMarketplace = await hre.ethers.getContractFactory("InvoiceMarketplace");
  const invoiceMarketplaceImpl = await InvoiceMarketplace.deploy();
  await invoiceMarketplaceImpl.waitForDeployment();
  const implAddress = await invoiceMarketplaceImpl.getAddress();
  console.log("Implementation deployed to:", implAddress);

  // 2. Deploy TransparentUpgradeableProxy
  console.log("\n2. Deploying TransparentUpgradeableProxy...");
  const TransparentUpgradeableProxy = await hre.ethers.getContractFactory("TransparentUpgradeableProxy");

  // Encode the initialize call
  const initData = InvoiceMarketplace.interface.encodeFunctionData("initialize", [
    INVOICE_NFT_ADDRESS
  ]);

  const proxy = await TransparentUpgradeableProxy.deploy(
    implAddress,
    deployer.address,
    initData
  );
  await proxy.waitForDeployment();
  const proxyAddress = await proxy.getAddress();
  console.log("Proxy deployed to:", proxyAddress);

  // 3. Wire InvoiceNFT to use the new marketplace
  console.log("\n3. Setting marketplace on InvoiceNFT...");
  const InvoiceNFT = await hre.ethers.getContractFactory("InvoiceNFT");
  const invoiceNFT = InvoiceNFT.attach(INVOICE_NFT_ADDRESS);
  
  try {
    const tx = await invoiceNFT.setMarketplace(proxyAddress);
    await tx.wait();
    console.log("✅ InvoiceNFT marketplace updated!");
  } catch (error) {
    console.log("⚠️  Could not update InvoiceNFT marketplace.");
    console.log("   You may need to call setMarketplace manually if you're not the owner.");
    console.log("   Command: invoiceNFT.setMarketplace('" + proxyAddress + "')");
  }

  console.log("\n-----------------------------------------------");
  console.log("✅ Deployment Complete!");
  console.log("-----------------------------------------------");
  console.log("\nIMPORTANT: Update these values in your project:");
  console.log("\n1. In .env:");
  console.log(`   NEXT_PUBLIC_CONTRACT_ADDRESS=${proxyAddress}`);
  console.log("\n2. In lib/contracts/addresses.ts:");
  console.log(`   export const INVOICE_MARKETPLACE_ADDRESS = "${proxyAddress}";`);
  console.log("\n-----------------------------------------------");
  console.log("Implementation address:", implAddress);
  console.log("Proxy address (use this):", proxyAddress);
  console.log("-----------------------------------------------");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Deployment Failed:");
    console.error(error);
    process.exit(1);
  });
