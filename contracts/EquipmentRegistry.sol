// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "./interfaces/IEquipmentRegistry.sol";
import "./libraries/Roles.sol";

/// @title EquipmentRegistry
/// @notice Smart contract for regulated equipment registration and lifecycle state.
/// @dev Role-based access is enforced via OpenZeppelin AccessControl. Role constants
///      are imported from Roles.sol to ensure hash consistency across the system.
contract EquipmentRegistry is IEquipmentRegistry, AccessControl {
    mapping(string => Equipment) private equipmentById;

    /// @notice Grants DEFAULT_ADMIN_ROLE to the deployer so they can assign roles post-deploy.
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    /// @notice Registers a new equipment asset with core metadata and operator ownership.
    /// @dev Caller must hold MANUFACTURER_ROLE.
    function registerEquipment(
        string calldata assetId,
        string calldata crn,
        string calldata aNumber,
        string calldata mdrHash,
        address initialOperator
    ) external override onlyRole(Roles.MANUFACTURER_ROLE) {
        equipmentById[assetId] = Equipment({
            assetId: assetId,
            crn: crn,
            aNumber: aNumber,
            mdrHash: mdrHash,
            currentOperator: initialOperator,
            certificateIssued: false,
            compliant: false,
            exists: true
        });
    }

    /// @notice Updates commissioning certificate status for a registered asset.
    /// @dev Caller must hold ABSA_ROLE.
    function setCertificateIssued(string calldata assetId, bool issued)
        external
        override
        onlyRole(Roles.ABSA_ROLE)
    {
        equipmentById[assetId].certificateIssued = issued;
    }

    /// @notice Updates the compliance flag used by transfer and reporting workflows.
    /// @dev Caller must hold ABSA_ROLE. A future iteration should restrict this to a
    ///      trusted InspectionLog contract address so compliance is set automatically.
    function setComplianceStatus(string calldata assetId, bool compliant)
        external
        override
        onlyRole(Roles.ABSA_ROLE)
    {
        equipmentById[assetId].compliant = compliant;
    }

    /// @notice Returns the full equipment record for read-only consumers such as auditors or UI clients.
    function getEquipment(string calldata assetId) external view override returns (Equipment memory) {
        return equipmentById[assetId];
    }
}
