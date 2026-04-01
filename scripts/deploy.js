// IronLedger deployment script
// Run with: npx hardhat run scripts/deploy.js --network sepolia
//
// Required environment variables (set in .env before running):
//   SEPOLIA_RPC_URL          — Infura / Alchemy wss or https endpoint
//   PRIVATE_KEY              — deployer wallet private key (no 0x prefix)
//   ABSA_ADDRESS             — wallet that receives the ABSA_ROLE on all contracts
//   INSPECTION_INTERVAL_SECS — how many seconds between required inspections (e.g. 2592000 = 30 days)
//
// After this script finishes, copy the three printed addresses into your .env file.

const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString(), "wei\n");

  const absaAddress    = process.env.ABSA_ADDRESS;
  const intervalSecs   = process.env.INSPECTION_INTERVAL_SECS || "2592000"; // default 30 days

  if (!absaAddress) {
    throw new Error("ABSA_ADDRESS env var is required. Set it in your .env file.");
  }

  // ── 1. Deploy EquipmentRegistry ───────────────────────────────────────────
  // Constructor: no arguments — roles are granted via grant-roles.js after deploy
  const EquipmentRegistry = await ethers.getContractFactory("EquipmentRegistry");
  const registry = await EquipmentRegistry.deploy();
  await registry.waitForDeployment();
  const registryAddress = await registry.getAddress();
  console.log("EquipmentRegistry deployed to:", registryAddress);

  // ── 2. Deploy InspectionLog ───────────────────────────────────────────────
  // Constructor: (address absa, address equipmentRegistry, uint256 intervalSeconds)
  const InspectionLog = await ethers.getContractFactory("InspectionLog");
  const inspectionLog = await InspectionLog.deploy(absaAddress, registryAddress, intervalSecs);
  await inspectionLog.waitForDeployment();
  const inspectionAddress = await inspectionLog.getAddress();
  console.log("InspectionLog deployed to:     ", inspectionAddress);

  // ── 3. Deploy OwnershipTransfer ───────────────────────────────────────────
  // Constructor: (address absa, address equipmentRegistry, address inspectionLog)
  const OwnershipTransfer = await ethers.getContractFactory("OwnershipTransfer");
  const ownershipTransfer = await OwnershipTransfer.deploy(absaAddress, registryAddress, inspectionAddress);
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
