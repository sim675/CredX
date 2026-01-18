const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  
  console.log("-----------------------------------------------");
  console.log("Upgrading InvoiceMarketplace with account:", deployer.address);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "MATIC");
  console.log("-----------------------------------------------");

  // IMPORTANT: Update this with your existing proxy address
  const PROXY_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0x180E2165d4eFF5c37dCE6282497C41c8FEADC8Eb";
  
  console.log("Proxy address:", PROXY_ADDRESS);
  
  // Deploy new implementation
  console.log("\n1. Deploying new InvoiceMarketplace implementation...");
  const InvoiceMarketplace = await hre.ethers.getContractFactory("InvoiceMarketplace");
  const newImplementation = await InvoiceMarketplace.deploy();
  await newImplementation.waitForDeployment();
  const newImplAddress = await newImplementation.getAddress();
  console.log("New implementation deployed to:", newImplAddress);

  // Get ProxyAdmin to perform the upgrade
  // The ProxyAdmin was set to deployer.address in the original deploy script
  console.log("\n2. Upgrading proxy to new implementation...");
  
  // For TransparentUpgradeableProxy, the admin calls upgradeTo on the proxy
  // But we need to call through the ProxyAdmin contract
  // Get the ProxyAdmin artifact
  const ProxyAdmin = await hre.ethers.getContractFactory("ProxyAdmin");
  
  // The ProxyAdmin address can be found by looking at the proxy's admin slot
  // For now, let's try using the ITransparentUpgradeableProxy interface
  const ITransparentUpgradeableProxy = await hre.ethers.getContractAt(
    [
      "function upgradeToAndCall(address newImplementation, bytes memory data) external",
      "function upgradeTo(address newImplementation) external"
    ],
    PROXY_ADDRESS,
    deployer
  );

  try {
    // Try to upgrade (this may fail if deployer is not the admin)
    const tx = await ITransparentUpgradeableProxy.upgradeTo(newImplAddress);
    await tx.wait();
    console.log("✅ Proxy upgraded successfully!");
  } catch (error) {
    console.log("\n⚠️  Direct upgrade failed. This is expected for TransparentUpgradeableProxy.");
    console.log("You need to call upgrade through the ProxyAdmin contract.");
    console.log("\nManual upgrade steps:");
    console.log("1. Find your ProxyAdmin address (created during initial deployment)");
    console.log("2. Call ProxyAdmin.upgradeAndCall(proxyAddress, newImplementation, '0x')");
    console.log("\nNew implementation address to use:", newImplAddress);
    console.log("\nAlternatively, you can redeploy a fresh proxy (Option B in the instructions)");
    return;
  }

  console.log("-----------------------------------------------");
  console.log("Upgrade complete!");
  console.log("Proxy address (unchanged):", PROXY_ADDRESS);
  console.log("New implementation:", newImplAddress);
  console.log("-----------------------------------------------");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Upgrade Failed:");
    console.error(error);
    process.exit(1);
  });
