// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "./interfaces/IEquipmentRegistry.sol";
import "./libraries/Roles.sol";

/// @title EquipmentRegistry
/// @notice Smart contract for regulated pressure equipment registration and lifecycle management.
/// @dev Role-based access is enforced via OpenZeppelin AccessControl. Role constants are
///      imported from Roles.sol to guarantee hash consistency across the system.
contract EquipmentRegistry is IEquipmentRegistry, AccessControl {
    mapping(uint256 => Equipment) public equipment;
    uint256 public equipmentCount;

    // ─── Role Modifiers ──────────────────────────────────────────────────────

    modifier onlyManufacturer() {
        require(hasRole(Roles.MANUFACTURER_ROLE, msg.sender), "EquipmentRegistry: caller is not a manufacturer");
        _;
    }

    modifier onlySCO() {
        require(hasRole(Roles.SCO_ROLE, msg.sender), "EquipmentRegistry: caller is not a SCO");
        _;
    }

    modifier onlyABSA() {
        require(hasRole(Roles.ABSA_ROLE, msg.sender), "EquipmentRegistry: caller is not an ABSA inspector");
        _;
    }

    // ─── Constructor ─────────────────────────────────────────────────────────

    /// @notice Grants DEFAULT_ADMIN_ROLE to the deployer so roles can be assigned post-deploy.
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    // ─── State-Changing Functions ─────────────────────────────────────────────

    /// @inheritdoc IEquipmentRegistry
    /// @dev Auto-increments equipmentCount and uses it as the new ID.
    function registerEquipment(
        string calldata crn,
        bytes32 mdrHash,
        uint256 mawp
    ) external override onlyManufacturer returns (uint256 equipmentId) {
        equipmentCount++;
        equipmentId = equipmentCount;

        equipment[equipmentId] = Equipment({
            equipmentId: equipmentId,
            crn: crn,
            aNumber: "",
            mdrHash: mdrHash,
            mawp: mawp,
            manufacturer: msg.sender,
            registeredAt: block.timestamp,
            shopInspector: address(0),
            shopInspectedAt: 0,
            certificateIssuer: address(0),
            certificateIssuedAt: 0,
            status: Status.Registered
        });

        emit EquipmentRegistered(equipmentId, msg.sender, crn);
    }

    /// @inheritdoc IEquipmentRegistry
    function signShopInspection(uint256 equipmentId) external override onlySCO {
        Equipment storage eq = equipment[equipmentId];
        require(eq.equipmentId != 0, "EquipmentRegistry: equipment does not exist");
        require(eq.status == Status.Registered, "EquipmentRegistry: equipment is not in Registered state");

        eq.shopInspector = msg.sender;
        eq.shopInspectedAt = block.timestamp;
        eq.status = Status.ShopInspected;

        emit ShopInspectionSigned(equipmentId, msg.sender);
    }

    /// @inheritdoc IEquipmentRegistry
    function issueCertificate(uint256 equipmentId, string calldata aNumber)
        external
        override
        onlyABSA
    {
        Equipment storage eq = equipment[equipmentId];
        require(eq.equipmentId != 0, "EquipmentRegistry: equipment does not exist");
        require(eq.status == Status.ShopInspected, "EquipmentRegistry: equipment has not been shop inspected");

        eq.aNumber = aNumber;
        eq.certificateIssuer = msg.sender;
        eq.certificateIssuedAt = block.timestamp;
        eq.status = Status.Certified;

        emit CertificateIssued(equipmentId, msg.sender, aNumber);
    }

    /// @inheritdoc IEquipmentRegistry
    function activateEquipment(uint256 equipmentId) external override onlyABSA {
        Equipment storage eq = equipment[equipmentId];
        require(eq.equipmentId != 0, "EquipmentRegistry: equipment does not exist");
        require(eq.status == Status.Certified, "EquipmentRegistry: equipment has not been certified");

        eq.status = Status.Active;

        emit EquipmentActivated(equipmentId);
    }

    // ─── View Functions ───────────────────────────────────────────────────────

    /// @inheritdoc IEquipmentRegistry
    function getEquipment(uint256 equipmentId)
        external
        view
        override
        returns (Equipment memory)
    {
        require(equipment[equipmentId].equipmentId != 0, "EquipmentRegistry: equipment does not exist");
        return equipment[equipmentId];
    }

    /// @inheritdoc IEquipmentRegistry
    function isCertified(uint256 equipmentId) external view override returns (bool) {
        Status s = equipment[equipmentId].status;
        return s == Status.Certified || s == Status.Active;
    }
}
