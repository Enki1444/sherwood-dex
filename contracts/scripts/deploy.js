const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH");

  // Deploy WETH
  console.log("\n1. Deploying WETH...");
  const WETH = await ethers.getContractFactory("WETH");
  const weth = await WETH.deploy();
  await weth.waitForDeployment();
  const wethAddress = await weth.getAddress();
  console.log("WETH deployed to:", wethAddress);

  // Deploy Factory
  console.log("\n2. Deploying SherwoodFactory...");
  const Factory = await ethers.getContractFactory("SherwoodFactory");
  const factory = await Factory.deploy(deployer.address);
  await factory.waitForDeployment();
  const factoryAddress = await factory.getAddress();
  console.log("SherwoodFactory deployed to:", factoryAddress);

  // Deploy Router
  console.log("\n3. Deploying SherwoodRouter02...");
  const Router = await ethers.getContractFactory("SherwoodRouter02");
  const router = await Router.deploy(factoryAddress, wethAddress);
  await router.waitForDeployment();
  const routerAddress = await router.getAddress();
  console.log("SherwoodRouter02 deployed to:", routerAddress);

  // Deploy TREES token
  console.log("\n4. Deploying TREES token...");
  const TREES = await ethers.getContractFactory("TREES");
  const trees = await TREES.deploy(ethers.parseUnits("1000000", 18)); // 1M initial supply
  await trees.waitForDeployment();
  const treesAddress = await trees.getAddress();
  console.log("TREES deployed to:", treesAddress);

  // Get INIT_CODE_HASH
  const initCodeHash = await factory.INIT_CODE_PAIR_HASH();
  console.log("\nINIT_CODE_PAIR_HASH:", initCodeHash);

  // Save deployment addresses
  const deploymentInfo = {
    network: (await ethers.provider.getNetwork()).name,
    chainId: Number((await ethers.provider.getNetwork()).chainId),
    deployer: deployer.address,
    contracts: {
      WETH: wethAddress,
      SherwoodFactory: factoryAddress,
      SherwoodRouter: routerAddress,
      TREES: treesAddress,
    },
    initCodeHash: initCodeHash,
    timestamp: new Date().toISOString(),
  };

  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }
  
  const deploymentFile = path.join(deploymentsDir, `${deploymentInfo.network}.json`);
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
  console.log("\nDeployment info saved to:", deploymentFile);

  // Also save to frontend config
  const frontendConfigPath = path.join(__dirname, "..", "..", "frontend", "src", "config", "contracts.json");
  const frontendConfig = {
    chainId: deploymentInfo.chainId,
    chainName: deploymentInfo.network === "robinhood" ? "Robinhood Chain Testnet" : deploymentInfo.network,
    nativeCurrency: {
      name: "ETH",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrl: process.env.RPC_URL || "https://rpc.testnet.chain.robinhood.com",
    blockExplorer: "https://explorer.testnet.chain.robinhood.com",
    contracts: deploymentInfo.contracts,
    initCodeHash: initCodeHash,
  };
  
  fs.writeFileSync(frontendConfigPath, JSON.stringify(frontendConfig, null, 2));
  console.log("Frontend config saved to:", frontendConfigPath);

  console.log("\n=== Deployment Complete ===");
  console.log("Factory:", factoryAddress);
  console.log("Router:", routerAddress);
  console.log("WETH:", wethAddress);
  console.log("TREES:", treesAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
