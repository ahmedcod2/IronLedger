// IronLedger test suite
// Run with: npx hardhat test
//
// Covers the full equipment lifecycle across all three contracts:
//   EquipmentRegistry  → register → shopInspect → certify → activate
//   InspectionLog      → logInspection → checkOverdue → setInspectionInterval
//   OwnershipTransfer  → assignInitialCustody → initiateTransfer → completeTransfer / cancelTransfer

const { expect } = require("chai");
const { ethers }  = require("hardhat");

// ── Shared fixture ────────────────────────────────────────────────────────────
// Deploys all three contracts and grants roles to the relevant test accounts.
async function deploySystem() {
  const [deployer, manufacturer, sco, absa, operator, operator2] = await ethers.getSigners();

  const MANUFACTURER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("MANUFACTURER_ROLE"));
  const SCO_ROLE          = ethers.keccak256(ethers.toUtf8Bytes("SCO_ROLE"));
  const ABSA_ROLE         = ethers.keccak256(ethers.toUtf8Bytes("ABSA_ROLE"));
  const OPERATOR_ROLE     = ethers.keccak256(ethers.toUtf8Bytes("OPERATOR_ROLE"));

  const intervalSecs = 60; // 1 minute for tests

  const EquipmentRegistry = await ethers.getContractFactory("EquipmentRegistry");
  const registry = await EquipmentRegistry.deploy();
  await registry.waitForDeployment();

  const InspectionLog = await ethers.getContractFactory("InspectionLog");
  const inspLog = await InspectionLog.deploy(absa.address, registry.target, intervalSecs);
  await inspLog.waitForDeployment();

  const OwnershipTransfer = await ethers.getContractFactory("OwnershipTransfer");
  const transfer = await OwnershipTransfer.deploy(absa.address, registry.target, inspLog.target);
  await transfer.waitForDeployment();

  // Grant roles
  await registry.grantRole(MANUFACTURER_ROLE, manufacturer.address);
  await registry.grantRole(SCO_ROLE, sco.address);
  await registry.grantRole(ABSA_ROLE, absa.address);

  await inspLog.grantRole(SCO_ROLE, sco.address);
  await inspLog.grantRole(ABSA_ROLE, absa.address);

  await transfer.grantRole(ABSA_ROLE, absa.address);
  await transfer.grantRole(OPERATOR_ROLE, operator.address);
  await transfer.grantRole(OPERATOR_ROLE, operator2.address);

  const mdrHash   = ethers.keccak256(ethers.toUtf8Bytes("MDR-001"));
  const notesHash = ethers.keccak256(ethers.toUtf8Bytes("all good"));

  return {
    registry, inspLog, transfer,
    deployer, manufacturer, sco, absa, operator, operator2,
    MANUFACTURER_ROLE, SCO_ROLE, ABSA_ROLE, OPERATOR_ROLE,
    mdrHash, notesHash, intervalSecs,
  };
}

// Helper: register one piece of equipment and return its uint256 id
async function registerOne(registry, manufacturer, mdrHash) {
  const tx = await registry.connect(manufacturer).registerEquipment("CRN-001", mdrHash, 1000n);
  const receipt = await tx.wait();
  // equipmentCount is incremented before emitting; return 1 for the first equipment
  return 1n;
}

// ── EquipmentRegistry tests ───────────────────────────────────────────────────
describe("EquipmentRegistry", function () {

  it("deploys with deployer holding DEFAULT_ADMIN_ROLE", async function () {
    const { registry, deployer } = await deploySystem();
    const DEFAULT_ADMIN_ROLE = await registry.DEFAULT_ADMIN_ROLE();
    expect(await registry.hasRole(DEFAULT_ADMIN_ROLE, deployer.address)).to.equal(true);
  });

  it("manufacturer can register equipment", async function () {
    const { registry, manufacturer, mdrHash } = await deploySystem();
    await expect(
      registry.connect(manufacturer).registerEquipment("CRN-001", mdrHash, 1000n)
    ).to.not.be.reverted;
    expect(await registry.equipmentCount()).to.equal(1n);
  });

  it("non-manufacturer cannot register equipment", async function () {
    const { registry, sco, mdrHash } = await deploySystem();
    await expect(
      registry.connect(sco).registerEquipment("CRN-001", mdrHash, 1000n)
    ).to.be.reverted;
  });

  it("getEquipment returns correct fields after registration", async function () {
    const { registry, manufacturer, mdrHash } = await deploySystem();
    const id = await registerOne(registry, manufacturer, mdrHash);
    const eq = await registry.getEquipment(id);
    expect(eq.crn).to.equal("CRN-001");
    expect(eq.mdrHash).to.equal(mdrHash);
    expect(eq.mawp).to.equal(1000n);
    expect(eq.status).to.equal(0); // Registered
  });

  it("SCO can sign shop inspection after registration", async function () {
    const { registry, manufacturer, sco, mdrHash } = await deploySystem();
    const id = await registerOne(registry, manufacturer, mdrHash);
    await expect(registry.connect(sco).signShopInspection(id)).to.not.be.reverted;
    const eq = await registry.getEquipment(id);
    expect(eq.status).to.equal(1); // ShopInspected
  });

  it("shop inspection fails if equipment not yet registered", async function () {
    const { registry, sco } = await deploySystem();
    await expect(registry.connect(sco).signShopInspection(99n)).to.be.reverted;
  });

  it("ABSA can issue certificate after shop inspection", async function () {
    const { registry, manufacturer, sco, absa, mdrHash } = await deploySystem();
    const id = await registerOne(registry, manufacturer, mdrHash);
    await registry.connect(sco).signShopInspection(id);
    await expect(registry.connect(absa).issueCertificate(id, "A-0001")).to.not.be.reverted;
    const eq = await registry.getEquipment(id);
    expect(eq.status).to.equal(2); // Certified
    expect(eq.aNumber).to.equal("A-0001");
  });

  it("certificate issuance fails before shop inspection", async function () {
    const { registry, manufacturer, absa, mdrHash } = await deploySystem();
    const id = await registerOne(registry, manufacturer, mdrHash);
    await expect(registry.connect(absa).issueCertificate(id, "A-0001")).to.be.reverted;
  });

  it("ABSA can activate after certificate issued", async function () {
    const { registry, manufacturer, sco, absa, mdrHash } = await deploySystem();
    const id = await registerOne(registry, manufacturer, mdrHash);
    await registry.connect(sco).signShopInspection(id);
    await registry.connect(absa).issueCertificate(id, "A-0001");
    await expect(registry.connect(absa).activateEquipment(id)).to.not.be.reverted;
    const eq = await registry.getEquipment(id);
    expect(eq.status).to.equal(3); // Active
  });

  it("isCertified returns true for Certified status", async function () {
    const { registry, manufacturer, sco, absa, mdrHash } = await deploySystem();
    const id = await registerOne(registry, manufacturer, mdrHash);
    await registry.connect(sco).signShopInspection(id);
    await registry.connect(absa).issueCertificate(id, "A-0001");
    expect(await registry.isCertified(id)).to.equal(true);
  });

  it("isCertified returns true for Active status", async function () {
    const { registry, manufacturer, sco, absa, mdrHash } = await deploySystem();
    const id = await registerOne(registry, manufacturer, mdrHash);
    await registry.connect(sco).signShopInspection(id);
    await registry.connect(absa).issueCertificate(id, "A-0001");
    await registry.connect(absa).activateEquipment(id);
    expect(await registry.isCertified(id)).to.equal(true);
  });

  it("isCertified returns false before certificate", async function () {
    const { registry, manufacturer, mdrHash } = await deploySystem();
    const id = await registerOne(registry, manufacturer, mdrHash);
    expect(await registry.isCertified(id)).to.equal(false);
  });
});

// ── InspectionLog tests ───────────────────────────────────────────────────────
describe("InspectionLog", function () {

  it("SCO can log a passing inspection", async function () {
    const { inspLog, sco, notesHash } = await deploySystem();
    await expect(
      inspLog.connect(sco).logInspection(1n, 0 /* Pass */, notesHash)
    ).to.not.be.reverted;
  });

  it("non-SCO cannot log an inspection", async function () {
    const { inspLog, operator, notesHash } = await deploySystem();
    await expect(
      inspLog.connect(operator).logInspection(1n, 0, notesHash)
    ).to.be.reverted;
  });

  it("isCompliant returns true after passing inspection", async function () {
    const { inspLog, sco, notesHash } = await deploySystem();
    await inspLog.connect(sco).logInspection(1n, 0 /* Pass */, notesHash);
    expect(await inspLog.isCompliant(1n)).to.equal(true);
  });

  it("isCompliant returns false after failing inspection", async function () {
    const { inspLog, sco, notesHash } = await deploySystem();
    await inspLog.connect(sco).logInspection(1n, 1 /* Fail */, notesHash);
    expect(await inspLog.isCompliant(1n)).to.equal(false);
  });

  it("getInspectionHistory returns logged record", async function () {
    const { inspLog, sco, notesHash } = await deploySystem();
    await inspLog.connect(sco).logInspection(1n, 0, notesHash);
    const history = await inspLog.getInspectionHistory(1n);
    expect(history.length).to.equal(1);
    expect(history[0].result).to.equal(0); // Pass
    expect(history[0].notesHash).to.equal(notesHash);
  });

  it("checkOverdue marks compliant equipment non-compliant after interval", async function () {
    const { inspLog, sco, absa, notesHash, intervalSecs } = await deploySystem();
    await inspLog.connect(sco).logInspection(1n, 0, notesHash);
    expect(await inspLog.isCompliant(1n)).to.equal(true);

    // Advance time past the inspection interval
    await ethers.provider.send("evm_increaseTime", [intervalSecs + 10]);
    await ethers.provider.send("evm_mine", []);

    await inspLog.connect(absa).checkOverdue(1n);
    expect(await inspLog.isCompliant(1n)).to.equal(false);
  });

  it("ABSA can update inspection interval", async function () {
    const { inspLog, absa } = await deploySystem();
    await expect(inspLog.connect(absa).setInspectionInterval(7200n)).to.not.be.reverted;
    expect(await inspLog.inspectionInterval()).to.equal(7200n);
  });

  it("non-ABSA cannot update inspection interval", async function () {
    const { inspLog, sco } = await deploySystem();
    await expect(inspLog.connect(sco).setInspectionInterval(7200n)).to.be.reverted;
  });

  it("lastInspectedAt is updated after logInspection", async function () {
    const { inspLog, sco, notesHash } = await deploySystem();
    const before = await inspLog.lastInspectedAt(1n);
    await inspLog.connect(sco).logInspection(1n, 0, notesHash);
    const after = await inspLog.lastInspectedAt(1n);
    expect(after).to.be.greaterThan(before);
  });
});

// ── OwnershipTransfer tests ───────────────────────────────────────────────────
describe("OwnershipTransfer", function () {

  it("ABSA can assign initial custody", async function () {
    const { transfer, absa, operator } = await deploySystem();
    await expect(transfer.connect(absa).assignInitialCustody(1n, operator.address)).to.not.be.reverted;
    expect(await transfer.getCurrentOwner(1n)).to.equal(operator.address);
  });

  it("non-ABSA cannot assign initial custody", async function () {
    const { transfer, operator, operator2 } = await deploySystem();
    await expect(transfer.connect(operator).assignInitialCustody(1n, operator2.address)).to.be.reverted;
  });

  it("current owner can initiate transfer when compliant", async function () {
    const { transfer, inspLog, absa, operator, operator2, sco, notesHash } = await deploySystem();
    // Set up compliance
    await inspLog.connect(sco).logInspection(1n, 0, notesHash);
    await transfer.connect(absa).assignInitialCustody(1n, operator.address);
    await expect(transfer.connect(operator).initiateTransfer(1n, operator2.address)).to.not.be.reverted;
    expect(await transfer.getPendingTransfer(1n)).to.equal(operator2.address);
  });

  it("initiateTransfer reverts if equipment is not compliant", async function () {
    const { transfer, absa, operator, operator2 } = await deploySystem();
    // No inspection logged → not compliant
    await transfer.connect(absa).assignInitialCustody(1n, operator.address);
    await expect(
      transfer.connect(operator).initiateTransfer(1n, operator2.address)
    ).to.be.reverted;
  });

  it("non-owner cannot initiate transfer", async function () {
    const { transfer, inspLog, absa, operator, operator2, sco, notesHash } = await deploySystem();
    await inspLog.connect(sco).logInspection(1n, 0, notesHash);
    await transfer.connect(absa).assignInitialCustody(1n, operator.address);
    await expect(
      transfer.connect(operator2).initiateTransfer(1n, operator.address)
    ).to.be.reverted;
  });

  it("current owner can complete a pending transfer", async function () {
    const { transfer, inspLog, absa, operator, operator2, sco, notesHash } = await deploySystem();
    await inspLog.connect(sco).logInspection(1n, 0, notesHash);
    await transfer.connect(absa).assignInitialCustody(1n, operator.address);
    await transfer.connect(operator).initiateTransfer(1n, operator2.address);
    await expect(transfer.connect(operator).completeTransfer(1n)).to.not.be.reverted;
    expect(await transfer.getCurrentOwner(1n)).to.equal(operator2.address);
    expect(await transfer.getPendingTransfer(1n)).to.equal(ethers.ZeroAddress);
  });

  it("owner can cancel a pending transfer", async function () {
    const { transfer, inspLog, absa, operator, operator2, sco, notesHash } = await deploySystem();
    await inspLog.connect(sco).logInspection(1n, 0, notesHash);
    await transfer.connect(absa).assignInitialCustody(1n, operator.address);
    await transfer.connect(operator).initiateTransfer(1n, operator2.address);
    await expect(transfer.connect(operator).cancelTransfer(1n)).to.not.be.reverted;
    expect(await transfer.getCurrentOwner(1n)).to.equal(operator.address);
    expect(await transfer.getPendingTransfer(1n)).to.equal(ethers.ZeroAddress);
  });

  it("getTransferHistory grows with each transfer", async function () {
    const { transfer, inspLog, absa, operator, operator2, sco, notesHash } = await deploySystem();
    await inspLog.connect(sco).logInspection(1n, 0, notesHash);
    await transfer.connect(absa).assignInitialCustody(1n, operator.address);
    const hist1 = await transfer.getTransferHistory(1n);
    expect(hist1.length).to.equal(1); // initial custody record

    await transfer.connect(operator).initiateTransfer(1n, operator2.address);
    await transfer.connect(operator).completeTransfer(1n);
    const hist2 = await transfer.getTransferHistory(1n);
    expect(hist2.length).to.equal(2);
    expect(hist2[1].to).to.equal(operator2.address);
  });

  it("completeTransfer reverts when no pending transfer exists", async function () {
    const { transfer, absa, operator } = await deploySystem();
    await transfer.connect(absa).assignInitialCustody(1n, operator.address);
    await expect(transfer.connect(operator).completeTransfer(1n)).to.be.reverted;
  });

  it("getPendingTransfer returns ZeroAddress when none pending", async function () {
    const { transfer, absa, operator } = await deploySystem();
    await transfer.connect(absa).assignInitialCustody(1n, operator.address);
    expect(await transfer.getPendingTransfer(1n)).to.equal(ethers.ZeroAddress);
  });
});

