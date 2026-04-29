const { ethers } = require("hardhat");
const { expect } = require("chai");

describe("IronLedger — Full Lifecycle & Gas Report", function () {
  let registry, inspectionLog, ownershipTransfer;
  let deployer, manufacturer, sco, absa, operator, operator2;

  // Shared test data
  const CRN       = "CRN-0C18768";
  const MDR_HASH  = ethers.encodeBytes32String("MDR-HASH-001");
  const MAWP      = 1750;
  const A_NUMBER  = "A-4521";
  const NOTES     = ethers.encodeBytes32String("Shop inspection OK");
  const INTERVAL  = 60; // 60 seconds for testing

  before(async function () {
    [deployer, manufacturer, sco, absa, operator, operator2] = await ethers.getSigners();

    // ── Deploy EquipmentRegistry ──────────────────────────────────────────
    const EquipmentRegistry = await ethers.getContractFactory("EquipmentRegistry");
    registry = await EquipmentRegistry.deploy();
    

    // ── Deploy InspectionLog ──────────────────────────────────────────────
    const InspectionLog = await ethers.getContractFactory("InspectionLog");
    inspectionLog = await InspectionLog.deploy(absa.address, await registry.getAddress(), INTERVAL);
    

    // ── Deploy OwnershipTransfer ──────────────────────────────────────────
    const OwnershipTransfer = await ethers.getContractFactory("OwnershipTransfer");
    ownershipTransfer = await OwnershipTransfer.deploy(absa.address, await registry.getAddress(), await inspectionLog.getAddress());
    

    // ── Grant roles ───────────────────────────────────────────────────────
    const MANUFACTURER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("MANUFACTURER_ROLE"));
    const SCO_ROLE          = ethers.keccak256(ethers.toUtf8Bytes("SCO_ROLE"));
    const ABSA_ROLE         = ethers.keccak256(ethers.toUtf8Bytes("ABSA_ROLE"));
    const OPERATOR_ROLE     = ethers.keccak256(ethers.toUtf8Bytes("OPERATOR_ROLE"));

    await registry.grantRole(MANUFACTURER_ROLE, manufacturer.address);
    await registry.grantRole(SCO_ROLE, sco.address);
    await registry.grantRole(ABSA_ROLE, absa.address);

    await inspectionLog.grantRole(SCO_ROLE, sco.address);

    await ownershipTransfer.grantRole(ABSA_ROLE, absa.address);
    await ownershipTransfer.grantRole(OPERATOR_ROLE, operator.address);
    await ownershipTransfer.grantRole(OPERATOR_ROLE, operator2.address);
  });

  // ── EquipmentRegistry ────────────────────────────────────────────────────

  describe("EquipmentRegistry", function () {

    it("registerEquipment — emits EquipmentRegistered and returns ID 1", async function () {
      const tx = await registry.connect(manufacturer).registerEquipment(CRN, MDR_HASH, MAWP);
      await expect(tx)
        .to.emit(registry, "EquipmentRegistered")
        .withArgs(1, manufacturer.address, CRN);

      const eq = await registry.getEquipment(1);
      expect(eq.crn).to.equal(CRN);
      expect(eq.mawp).to.equal(MAWP);
      expect(eq.status).to.equal(0); // Registered
    });

    it("registerEquipment — reverts if caller lacks MANUFACTURER_ROLE", async function () {
      await expect(
        registry.connect(operator).registerEquipment(CRN, MDR_HASH, MAWP)
      ).to.be.revertedWith("EquipmentRegistry: caller is not a manufacturer");
    });

    it("signShopInspection — emits ShopInspectionSigned", async function () {
      await expect(registry.connect(sco).signShopInspection(1))
        .to.emit(registry, "ShopInspectionSigned")
        .withArgs(1, sco.address);

      const eq = await registry.getEquipment(1);
      expect(eq.status).to.equal(1); // ShopInspected
    });

    it("signShopInspection — reverts if caller lacks SCO_ROLE", async function () {
      // Register a second equipment to test against
      await registry.connect(manufacturer).registerEquipment("CRN-TEST-02", MDR_HASH, 1000);
      await expect(
        registry.connect(operator).signShopInspection(2)
      ).to.be.revertedWith("EquipmentRegistry: caller is not a SCO");
    });

    it("issueCertificate — emits CertificateIssued", async function () {
      await expect(registry.connect(absa).issueCertificate(1, A_NUMBER))
        .to.emit(registry, "CertificateIssued")
        .withArgs(1, absa.address, A_NUMBER);

      const eq = await registry.getEquipment(1);
      expect(eq.aNumber).to.equal(A_NUMBER);
      expect(eq.status).to.equal(2); // Certified
    });

    it("issueCertificate — reverts if equipment not shop inspected", async function () {
      await expect(
        registry.connect(absa).issueCertificate(2, A_NUMBER)
      ).to.be.revertedWith("EquipmentRegistry: equipment has not been shop inspected");
    });

    it("activateEquipment — emits EquipmentActivated", async function () {
      await expect(registry.connect(absa).activateEquipment(1))
        .to.emit(registry, "EquipmentActivated")
        .withArgs(1, absa.address);

      const eq = await registry.getEquipment(1);
      expect(eq.status).to.equal(3); // Active
    });

    it("activateEquipment — reverts if not certified", async function () {
      await expect(
        registry.connect(absa).activateEquipment(2)
      ).to.be.revertedWith("EquipmentRegistry: equipment has not been certified");
    });

    it("isCertified — returns true for Active equipment", async function () {
      expect(await registry.isCertified(1)).to.equal(true);
    });

    it("getEquipment — reverts for non-existent ID", async function () {
      await expect(registry.getEquipment(999))
        .to.be.revertedWith("EquipmentRegistry: equipment does not exist");
    });
  });

  // ── InspectionLog ────────────────────────────────────────────────────────

  describe("InspectionLog", function () {

    it("logInspection (Pass) — emits InspectionLogged and ComplianceFlagUpdated", async function () {
      await expect(inspectionLog.connect(sco).logInspection(1, 0, NOTES))
        .to.emit(inspectionLog, "InspectionLogged")
        .withArgs(1, 1, sco.address, 0)
        .and.to.emit(inspectionLog, "ComplianceFlagUpdated")
        .withArgs(1, true);

      expect(await inspectionLog.isCompliant(1)).to.equal(true);
    });

    it("logInspection (Fail) — sets compliance to false", async function () {
      await expect(inspectionLog.connect(sco).logInspection(1, 1, NOTES))
        .to.emit(inspectionLog, "ComplianceFlagUpdated")
        .withArgs(1, false);

      expect(await inspectionLog.isCompliant(1)).to.equal(false);
    });

    it("logInspection — reverts if caller lacks SCO_ROLE", async function () {
      await expect(
        inspectionLog.connect(operator).logInspection(1, 0, NOTES)
      ).to.be.revertedWith("InspectionLog: caller is not a SCO");
    });

    it("logInspection (Pass again) — restores compliance", async function () {
      await inspectionLog.connect(sco).logInspection(1, 0, NOTES);
      expect(await inspectionLog.isCompliant(1)).to.equal(true);
    });

    it("getInspectionHistory — returns all records", async function () {
      const history = await inspectionLog.getInspectionHistory(1);
      expect(history.length).to.equal(3);
    });

    it("getLastInspection — returns most recent record", async function () {
      const last = await inspectionLog.getLastInspection(1);
      expect(last.result).to.equal(0); // Pass
    });

    it("checkOverdue — emits ComplianceFlagUpdated after interval", async function () {
      // Fast-forward time past the interval
      await ethers.provider.send("evm_increaseTime", [120]);
      await ethers.provider.send("evm_mine");

      await expect(inspectionLog.connect(absa).checkOverdue(1))
        .to.emit(inspectionLog, "ComplianceFlagUpdated")
        .withArgs(1, false);

      expect(await inspectionLog.isCompliant(1)).to.equal(false);
    });

    it("setInspectionInterval — updates interval", async function () {
      await inspectionLog.connect(absa).setInspectionInterval(3600);
      expect(await inspectionLog.inspectionInterval()).to.equal(3600);
      // Reset back for transfer tests
      await inspectionLog.connect(absa).setInspectionInterval(INTERVAL);
    });

    it("getLastInspection — reverts if no inspections recorded", async function () {
      await expect(inspectionLog.getLastInspection(999))
        .to.be.revertedWith("InspectionLog: no inspections recorded for this asset");
    });
  });

  // ── OwnershipTransfer ────────────────────────────────────────────────────

  describe("OwnershipTransfer", function () {

    before(async function () {
      // Restore compliance before transfer tests
      await inspectionLog.connect(sco).logInspection(1, 0, NOTES);
    });

    it("assignInitialCustody — emits CustodyAssigned", async function () {
      await expect(ownershipTransfer.connect(absa).assignInitialCustody(1, operator.address))
        .to.emit(ownershipTransfer, "CustodyAssigned")
        .withArgs(1, operator.address);

      expect(await ownershipTransfer.getCurrentOwner(1)).to.equal(operator.address);
    });

    it("assignInitialCustody — reverts if already assigned", async function () {
      await expect(
        ownershipTransfer.connect(absa).assignInitialCustody(1, operator2.address)
      ).to.be.revertedWith("OwnershipTransfer: custody already assigned");
    });

    it("initiateTransfer — emits TransferInitiated", async function () {
      await expect(ownershipTransfer.connect(operator).initiateTransfer(1, operator2.address))
        .to.emit(ownershipTransfer, "TransferInitiated")
        .withArgs(1, operator.address, operator2.address);

      expect(await ownershipTransfer.getPendingTransfer(1)).to.equal(operator2.address);
    });

    it("initiateTransfer — reverts if equipment not compliant", async function () {
      // Register and set up a second equipment
      await registry.connect(manufacturer).registerEquipment("CRN-TEST-03", MDR_HASH, 2000);
      await registry.connect(sco).signShopInspection(3);
      await registry.connect(absa).issueCertificate(3, "A-9999");
      await registry.connect(absa).activateEquipment(3);
      await ownershipTransfer.connect(absa).assignInitialCustody(3, operator.address);
      // No inspection logged — not compliant
      await expect(
        ownershipTransfer.connect(operator).initiateTransfer(3, operator2.address)
      ).to.be.revertedWith("OwnershipTransfer: equipment is not compliant");
    });

    it("cancelTransfer — emits TransferCancelled", async function () {
      // Transfer already initiated in previous test — cancel it directly
      await expect(ownershipTransfer.connect(operator).cancelTransfer(1))
        .to.emit(ownershipTransfer, "TransferCancelled")
        .withArgs(1, operator.address);
      expect(await ownershipTransfer.getPendingTransfer(1)).to.equal(ethers.ZeroAddress);
    });

    it("completeTransfer — emits TransferCompleted and updates owner", async function () {
      // Re-initiate after cancel, then complete
      await ownershipTransfer.connect(operator).initiateTransfer(1, operator2.address);
      await expect(ownershipTransfer.connect(operator).completeTransfer(1))
        .to.emit(ownershipTransfer, "TransferCompleted")
        .withArgs(1, operator.address, operator2.address);
      expect(await ownershipTransfer.getCurrentOwner(1)).to.equal(operator2.address);
    });

    it("completeTransfer — reverts if no pending transfer", async function () {
      // operator2 is now owner, no pending transfer exists
      await expect(
        ownershipTransfer.connect(operator2).completeTransfer(1)
      ).to.be.revertedWith("OwnershipTransfer: no pending transfer");
    });

    it("getTransferHistory — returns full history", async function () {
      const history = await ownershipTransfer.getTransferHistory(1);
      expect(history.length).to.be.greaterThan(0);
    });
  });
});
