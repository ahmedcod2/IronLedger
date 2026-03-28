// Run this once after deploying to give a wallet permission to use the system.
// By default it grants to whoever deployed (your PRIVATE_KEY wallet).
// Need to grant to someone else? Just add GRANT_TO=0x... to your .env first.
//
//   npx hardhat run scripts/grant-roles.js --network sepolia

const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  // Who gets the roles — falls back to the deployer if GRANT_TO isn't set
  const grantTo = process.env.GRANT_TO || deployer.address;

  console.log("Admin wallet  :", deployer.address);
  console.log("Granting to   :", grantTo);
  console.log("");

  // These have to match exactly what's in Roles.sol, otherwise hasRole() will
  // always return false and every write transaction will revert silently
  const MANUFACTURER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("MANUFACTURER_ROLE"));
  const SCO_ROLE          = ethers.keccak256(ethers.toUtf8Bytes("SCO_ROLE"));
  const ABSA_ROLE         = ethers.keccak256(ethers.toUtf8Bytes("ABSA_ROLE"));
  const OPERATOR_ROLE     = ethers.keccak256(ethers.toUtf8Bytes("OPERATOR_ROLE"));

  // Hook up to the contracts that are already live on-chain
  const registry = await ethers.getContractAt(
    "EquipmentRegistry", process.env.REGISTRY_CONTRACT_ADDRESS
  );
  const inspectionLog = await ethers.getContractAt(
    "InspectionLog", process.env.INSPECTION_CONTRACT_ADDRESS
  );
  const ownershipTransfer = await ethers.getContractAt(
    "OwnershipTransfer", process.env.TRANSFER_CONTRACT_ADDRESS
  );

  // ── EquipmentRegistry roles ───────────────────────────────────────────────
  console.log("Granting MANUFACTURER_ROLE on EquipmentRegistry...");
  await (await registry.grantRole(MANUFACTURER_ROLE, grantTo)).wait();
  console.log("  ✔ MANUFACTURER_ROLE granted");

  console.log("Granting SCO_ROLE on EquipmentRegistry...");
  await (await registry.grantRole(SCO_ROLE, grantTo)).wait();
  console.log("  ✔ SCO_ROLE granted");

  console.log("Granting ABSA_ROLE on EquipmentRegistry...");
  await (await registry.grantRole(ABSA_ROLE, grantTo)).wait();
  console.log("  ✔ ABSA_ROLE granted");

  // ── InspectionLog roles ───────────────────────────────────────────────────
  console.log("Granting SCO_ROLE on InspectionLog...");
  await (await inspectionLog.grantRole(SCO_ROLE, grantTo)).wait();
  console.log("  ✔ SCO_ROLE granted");

  console.log("Granting ABSA_ROLE on InspectionLog...");
  await (await inspectionLog.grantRole(ABSA_ROLE, grantTo)).wait();
  console.log("  ✔ ABSA_ROLE granted");

  // ── OwnershipTransfer roles ───────────────────────────────────────────────
  console.log("Granting OPERATOR_ROLE on OwnershipTransfer...");
  await (await ownershipTransfer.grantRole(OPERATOR_ROLE, grantTo)).wait();
  console.log("  ✔ OPERATOR_ROLE granted");

  console.log("Granting ABSA_ROLE on OwnershipTransfer...");
  await (await ownershipTransfer.grantRole(ABSA_ROLE, grantTo)).wait();
  console.log("  ✔ ABSA_ROLE granted");

  console.log("\nAll roles granted. You're good to go with:", grantTo);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
