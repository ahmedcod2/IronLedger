// IronLedger deployment script
// Run with: npx hardhat run scripts/deploy.js --network sepolia
//
// Requires in hardhat.config.js:
//   networks.sepolia.url  = process.env.SEPOLIA_RPC_URL
//   networks.sepolia.accounts = [process.env.PRIVATE_KEY]
//
// After this script finishes, copy the three printed addresses into your .env file.

const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString(), "wei\n");

  // ── 1. Deploy EquipmentRegistry ───────────────────────────────────────────
  // No constructor arguments required.
  const EquipmentRegistry = await ethers.getContractFactory("EquipmentRegistry");
  const registry = await EquipmentRegistry.deploy();
  await registry.waitForDeployment();
  const registryAddress = await registry.getAddress();
  console.log("EquipmentRegistry deployed to:", registryAddress);

  // ── 2. Deploy InspectionLog ───────────────────────────────────────────────
  // No constructor arguments required.
  const InspectionLog = await ethers.getContractFactory("InspectionLog");
  const inspectionLog = await InspectionLog.deploy();
  await inspectionLog.waitForDeployment();
  const inspectionAddress = await inspectionLog.getAddress();
  console.log("InspectionLog deployed to:     ", inspectionAddress);

  // ── 3. Deploy OwnershipTransfer ───────────────────────────────────────────
  // Requires the EquipmentRegistry address so it can call getEquipment() internally.
  const OwnershipTransfer = await ethers.getContractFactory("OwnershipTransfer");
  const ownershipTransfer = await OwnershipTransfer.deploy(registryAddress);
  await ownershipTransfer.waitForDeployment();
  const transferAddress = await ownershipTransfer.getAddress();
  console.log("OwnershipTransfer deployed to: ", transferAddress);

  // ── Summary — copy these into your .env ───────────────────────────────────
  console.log("\n─────────────────────────────────────────────────────");
  console.log("Copy these values into your .env file:");
  console.log("─────────────────────────────────────────────────────");
  console.log(`REGISTRY_CONTRACT_ADDRESS=${registryAddress}`);
  console.log(`INSPECTION_CONTRACT_ADDRESS=${inspectionAddress}`);
  console.log(`TRANSFER_CONTRACT_ADDRESS=${transferAddress}`);
  console.log("─────────────────────────────────────────────────────");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
