import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  const [deployer] = await ethers.getSigners();
  
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await ethers.provider.getBalance(deployer.address)).toString());

  // Deploy WETH
  console.log("\n📄 Deploying WETH...");
  const WETH = await ethers.getContractFactory("WETH");
  const weth = await WETH.deploy();
  await weth.waitForDeployment();
  const wethAddress = await weth.getAddress();
  console.log("✅ WETH deployed to:", wethAddress);

  // Deploy Factory
  console.log("\n📄 Deploying SherwoodFactory...");
  const SherwoodFactory = await ethers.getContractFactory("SherwoodFactory");
  const factory = await SherwoodFactory.deploy(deployer.address);
  await factory.waitForDeployment();
  const factoryAddress = await factory.getAddress();
  console.log("✅ SherwoodFactory deployed to:", factoryAddress);

  // Deploy Router
  console.log("\n📄 Deploying SherwoodRouter02...");
  const SherwoodRouter02 = await ethers.getContractFactory("SherwoodRouter02");
  const router = await SherwoodRouter02.deploy(factoryAddress, wethAddress);
  await router.waitForDeployment();
  const routerAddress = await router.getAddress();
  console.log("✅ SherwoodRouter02 deployed to:", routerAddress);

  // Deploy TREES Token
  console.log("\n📄 Deploying TREES Token...");
  const TREES = await ethers.getContractFactory("TREES");
  const trees = await TREES.deploy();
  await trees.waitForDeployment();
  const treesAddress = await trees.getAddress();
  console.log("✅ TREES deployed to:", treesAddress);

  // Save deployment addresses
  const deployments = {
    network: (await ethers.provider.getNetwork()).name,
    chainId: Number((await ethers.provider.getNetwork()).chainId),
    deployer: deployer.address,
    contracts: {
      WETH: wethAddress,
      SherwoodFactory: factoryAddress,
      SherwoodRouter02: routerAddress,
      TREES: treesAddress,
    },
    deployedAt: new Date().toISOString(),
  };

  const deploymentsPath = path.join(__dirname, "../deployments.json");
  fs.writeFileSync(deploymentsPath, JSON.stringify(deployments, null, 2));
  console.log("\n📝 Deployment info saved to deployments.json");

  // Also create a frontend-compatible config
  const frontendConfig = {
    chainId: deployments.chainId,
    chainName: "Robinhood Chain Testnet",
    nativeCurrency: {
      name: "ETH",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrl: process.env.RPC_URL || "https://rpc.testnet.chain.robinhood.com",
    blockExplorer: "https://explorer.testnet.chain.robinhood.com",
    contracts: deployments.contracts,
  };

  const frontendConfigPath = path.join(__dirname, "../../frontend/src/config/contracts.json");
  const frontendConfigDir = path.dirname(frontendConfigPath);
  if (!fs.existsSync(frontendConfigDir)) {
    fs.mkdirSync(frontendConfigDir, { recursive: true });
  }
  fs.writeFileSync(frontendConfigPath, JSON.stringify(frontendConfig, null, 2));
  console.log("📝 Frontend config saved to frontend/src/config/contracts.json");

  console.log("\n🎉 Deployment complete!");
  console.log("\n📋 Summary:");
  console.log("   WETH:", wethAddress);
  console.log("   Factory:", factoryAddress);
  console.log("   Router:", routerAddress);
  console.log("   TREES:", treesAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
