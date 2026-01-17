const hre = require("hardhat");

/**
 * DeploymentManager.js
 * 
 * Deploys the 3-Tier Real-Yield System:
 * - Tier 1: CredXUtilityToken (Access)
 * - Tier 2: CGOV + UtilityStaker (Governance Extraction)
 * - Tier 3: StakingRewards (Real-Yield Vault)
 * - Asset Link: InvoiceNFT + InvoiceMarketplace
 * 
 * Automatically links all contract addresses and roles.
 */

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("=".repeat(60));
  console.log("CredX 3-Tier Real-Yield System Deployment");
  console.log("=".repeat(60));
  console.log("Deployer:", deployer.address);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Balance:", hre.ethers.formatEther(balance), "ETH/MATIC");
  console.log("=".repeat(60));

  // ============================================================
  // TIER 1: Access Token
  // ============================================================
  console.log("\n[TIER 1] Deploying CredXUtilityToken...");
  const CredXUtilityToken = await hre.ethers.getContractFactory("CredXUtilityToken");
  const utilityToken = await CredXUtilityToken.deploy();
  await utilityToken.waitForDeployment();
  const utilityTokenAddress = await utilityToken.getAddress();
  console.log("✓ CredXUtilityToken deployed to:", utilityTokenAddress);

  // ============================================================
  // TIER 2: Governance Extraction (Deploy UtilityStaker first to get minter address)
  // ============================================================
  
  // We need to deploy UtilityStaker first, but it needs CGOV address
  // And CGOV needs UtilityStaker as minter - chicken and egg problem
  // Solution: Deploy a placeholder, then use CREATE2 or deploy in correct order
  
  // Actually, we can predict the address or deploy UtilityStaker first
  // Let's deploy CGOV with a temporary minter, then redeploy properly
  
  // Better approach: Deploy UtilityStaker with a placeholder CGOV,
  // then deploy CGOV with UtilityStaker as minter
  // This won't work because UtilityStaker calls cgov.mint()
  
  // Correct approach: Use a factory pattern or deploy CGOV first with deployer as minter
  // then transfer minter role. But CGOV has immutable minter.
  
  // Best solution: Compute UtilityStaker address before deployment using CREATE2
  // or deploy in two steps with a proxy pattern
  
  // Simplest solution for now: Deploy UtilityStaker first, get its address,
  // then deploy CGOV with that address as minter
  
  // To do this, we need to know UtilityStaker address before CGOV deployment
  // We can compute it using the deployer nonce
  
  const deployerNonce = await hre.ethers.provider.getTransactionCount(deployer.address);
  
  // The UtilityStaker will be deployed at nonce + 1 (after CGOV)
  // So we deploy CGOV first, then UtilityStaker
  // But CGOV needs UtilityStaker address...
  
  // Let's use a different approach: predict the address
  const utilityStakerNonce = deployerNonce + 1; // CGOV is deployed at current nonce
  const predictedUtilityStakerAddress = hre.ethers.getCreateAddress({
    from: deployer.address,
    nonce: utilityStakerNonce
  });
  
  console.log("\n[TIER 2] Deploying CGOV with predicted UtilityStaker address...");
  console.log("Predicted UtilityStaker address:", predictedUtilityStakerAddress);
  
  const CGOV = await hre.ethers.getContractFactory("CGOV");
  const cgov = await CGOV.deploy(predictedUtilityStakerAddress);
  await cgov.waitForDeployment();
  const cgovAddress = await cgov.getAddress();
  console.log("✓ CGOV deployed to:", cgovAddress);

  // CGOV reward rate: 1 CGOV per second per 1000 staked tokens (scaled by 1e18)
  // This means if you stake 1000 tokens, you earn 1 CGOV per second
  const rewardRate = hre.ethers.parseEther("0.001"); // 0.001 CGOV per second per token
  
  console.log("\n[TIER 2] Deploying UtilityStaker...");
  const UtilityStaker = await hre.ethers.getContractFactory("UtilityStaker");
  const utilityStaker = await UtilityStaker.deploy(
    utilityTokenAddress,
    cgovAddress,
    rewardRate
  );
  await utilityStaker.waitForDeployment();
  const utilityStakerAddress = await utilityStaker.getAddress();
  console.log("✓ UtilityStaker deployed to:", utilityStakerAddress);
  
  // Verify the predicted address matches
  if (utilityStakerAddress.toLowerCase() !== predictedUtilityStakerAddress.toLowerCase()) {
    console.error("❌ ERROR: Predicted address mismatch!");
    console.error("Expected:", predictedUtilityStakerAddress);
    console.error("Actual:", utilityStakerAddress);
    process.exit(1);
  }
  console.log("✓ Address prediction verified!");

  // ============================================================
  // TIER 3: Real-Yield Vault
  // ============================================================
  console.log("\n[TIER 3] Deploying StakingRewards...");
  const StakingRewards = await hre.ethers.getContractFactory("StakingRewards");
  const stakingRewards = await StakingRewards.deploy(cgovAddress);
  await stakingRewards.waitForDeployment();
  const stakingRewardsAddress = await stakingRewards.getAddress();
  console.log("✓ StakingRewards deployed to:", stakingRewardsAddress);

  // ============================================================
  // ASSET LINK: InvoiceNFT + InvoiceMarketplace
  // ============================================================
  console.log("\n[ASSET LINK] Deploying InvoiceNFT...");
  const InvoiceNFT = await hre.ethers.getContractFactory("InvoiceNFT");
  const invoiceNFT = await InvoiceNFT.deploy(stakingRewardsAddress);
  await invoiceNFT.waitForDeployment();
  const invoiceNFTAddress = await invoiceNFT.getAddress();
  console.log("✓ InvoiceNFT deployed to:", invoiceNFTAddress);

  console.log("\n[ASSET LINK] Deploying InvoiceMarketplace (Implementation)...");
  const InvoiceMarketplace = await hre.ethers.getContractFactory("InvoiceMarketplace");
  const marketplaceImpl = await InvoiceMarketplace.deploy();
  await marketplaceImpl.waitForDeployment();
  const marketplaceImplAddress = await marketplaceImpl.getAddress();
  console.log("✓ InvoiceMarketplace Implementation deployed to:", marketplaceImplAddress);

  // Deploy TransparentUpgradeableProxy
  console.log("\n[ASSET LINK] Deploying TransparentUpgradeableProxy...");
  const TransparentUpgradeableProxy = await hre.ethers.getContractFactory("TransparentUpgradeableProxy");
  
  const initData = InvoiceMarketplace.interface.encodeFunctionData("initialize", [
    invoiceNFTAddress
  ]);

  const proxy = await TransparentUpgradeableProxy.deploy(
    marketplaceImplAddress,
    deployer.address,
    initData
  );
  await proxy.waitForDeployment();
  const proxyAddress = await proxy.getAddress();
  console.log("✓ InvoiceMarketplace Proxy deployed to:", proxyAddress);

  // ============================================================
  // WIRE UP: Set marketplace on InvoiceNFT
  // ============================================================
  console.log("\n[WIRING] Setting marketplace on InvoiceNFT...");
  const txSetMarketplace = await invoiceNFT.setMarketplace(proxyAddress);
  await txSetMarketplace.wait();
  console.log("✓ InvoiceNFT marketplace set to proxy");

  // ============================================================
  // DEPLOYMENT SUMMARY
  // ============================================================
  console.log("\n" + "=".repeat(60));
  console.log("DEPLOYMENT COMPLETE - 3-Tier Real-Yield System");
  console.log("=".repeat(60));
  console.log("\n[TIER 1: Access]");
  console.log("  CredXUtilityToken:", utilityTokenAddress);
  console.log("\n[TIER 2: Governance Extraction]");
  console.log("  CGOV:", cgovAddress);
  console.log("  UtilityStaker:", utilityStakerAddress);
  console.log("\n[TIER 3: Real-Yield Vault]");
  console.log("  StakingRewards:", stakingRewardsAddress);
  console.log("\n[Asset Link]");
  console.log("  InvoiceNFT:", invoiceNFTAddress);
  console.log("  InvoiceMarketplace Impl:", marketplaceImplAddress);
  console.log("  InvoiceMarketplace Proxy:", proxyAddress);
  console.log("\n" + "=".repeat(60));
  console.log("MATIC FLOW: InvoiceNFT.repayInvoice() -> 5% fee -> StakingRewards");
  console.log("CGOV FLOW: Stake CredXUtilityToken -> UtilityStaker -> Mint CGOV");
  console.log("YIELD FLOW: Stake CGOV -> StakingRewards -> Earn MATIC");
  console.log("=".repeat(60));

  // Return addresses for verification scripts
  return {
    utilityToken: utilityTokenAddress,
    cgov: cgovAddress,
    utilityStaker: utilityStakerAddress,
    stakingRewards: stakingRewardsAddress,
    invoiceNFT: invoiceNFTAddress,
    marketplaceImpl: marketplaceImplAddress,
    marketplaceProxy: proxyAddress
  };
}

main()
  .then((addresses) => {
    console.log("\nDeployed addresses:", JSON.stringify(addresses, null, 2));
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Deployment Failed:");
    console.error(error);
    process.exit(1);
  });
