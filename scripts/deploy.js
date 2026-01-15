const hre = require("hardhat");

async function main() {
  // 1. Get the signer (the account that will pay gas)
  const [deployer] = await hre.ethers.getSigners();

  console.log("-----------------------------------------------");
  console.log("Deploying contracts with account:", deployer.address);

  // 2. Check balance to ensure you have enough MATIC/POL on Amoy
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "MATIC");
  console.log("-----------------------------------------------");

  // 3. Deploy GovernanceToken (CGOV)
  const GovernanceToken = await hre.ethers.getContractFactory("GovernanceToken");
  const governanceToken = await GovernanceToken.deploy();
  await governanceToken.waitForDeployment();
  const governanceTokenAddress = await governanceToken.getAddress();
  console.log("GovernanceToken (CGOV) deployed to:", governanceTokenAddress);

  // 4. Deploy StakingRewards (stakes CGOV, earns MATIC rewards)
  const StakingRewards = await hre.ethers.getContractFactory("StakingRewards");
  const stakingRewards = await StakingRewards.deploy(governanceTokenAddress);
  await stakingRewards.waitForDeployment();
  const stakingRewardsAddress = await stakingRewards.getAddress();
  console.log("StakingRewards deployed to:", stakingRewardsAddress);

  // 5. Deploy InvoiceNFT (ERC721 for invoice documents)
  const InvoiceNFT = await hre.ethers.getContractFactory("InvoiceNFT");
  const invoiceNFT = await InvoiceNFT.deploy();
  await invoiceNFT.waitForDeployment();
  const invoiceNFTAddress = await invoiceNFT.getAddress();
  console.log("InvoiceNFT deployed to:", invoiceNFTAddress);

  // 6. Deploy InvoiceMarketplace implementation
  const InvoiceMarketplace = await hre.ethers.getContractFactory("InvoiceMarketplace");
  const invoiceMarketplaceImpl = await InvoiceMarketplace.deploy();
  await invoiceMarketplaceImpl.waitForDeployment();
  const invoiceMarketplaceImplAddress = await invoiceMarketplaceImpl.getAddress();
  console.log("InvoiceMarketplace implementation deployed to:", invoiceMarketplaceImplAddress);

  // 7. Deploy TransparentUpgradeableProxy for InvoiceMarketplace
  const TransparentUpgradeableProxy = await hre.ethers.getContractFactory("TransparentUpgradeableProxy");

  // feeBps is the share of interest sent to StakingRewards (e.g. 500 = 5%)
  const feeBps = 500;

  // Encode the initialize call for the proxy constructor
  const initData = InvoiceMarketplace.interface.encodeFunctionData("initialize", [
    invoiceNFTAddress,
    stakingRewardsAddress,
    feeBps,
  ]);

  console.log("Deploying TransparentUpgradeableProxy...");
  const proxy = await TransparentUpgradeableProxy.deploy(
    invoiceMarketplaceImplAddress,
    deployer.address,
    initData
  );

  await proxy.waitForDeployment();
  const proxyAddress = await proxy.getAddress();
  console.log("InvoiceMarketplace proxy deployed to:", proxyAddress);

  // 8. Wire InvoiceNFT to use the proxy as the marketplace
  const txSetMarketplace = await invoiceNFT.setMarketplace(proxyAddress);
  await txSetMarketplace.wait();
  console.log("InvoiceNFT marketplace set to proxy address");

  console.log("-----------------------------------------------");
  console.log("Deployment summary:");
  console.log("GovernanceToken (CGOV):        ", governanceTokenAddress);
  console.log("StakingRewards:                ", stakingRewardsAddress);
  console.log("InvoiceNFT:                    ", invoiceNFTAddress);
  console.log("InvoiceMarketplace Impl:       ", invoiceMarketplaceImplAddress);
  console.log("InvoiceMarketplace Proxy (use this in frontend):", proxyAddress);
  console.log("-----------------------------------------------");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Deployment Failed:");
    console.error(error);
    process.exit(1);
  });