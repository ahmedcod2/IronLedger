// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./interfaces/IEquipmentRegistry.sol";

/// @title EquipmentRegistry
/// @notice Draft smart contract for regulated equipment registration and lifecycle state.
/// @dev This milestone focuses on structure and comments rather than full production logic.
contract EquipmentRegistry is IEquipmentRegistry {
    mapping(string => Equipment) private equipmentById;

    /// @notice Registers a new equipment asset with core metadata and operator ownership.
    /// @dev Future versions should enforce role-based access control and duplicate checks.
    function registerEquipment(
        string calldata assetId,
        string calldata crn,
        string calldata aNumber,
        string calldata mdrHash,
        address initialOperator
    ) external override {
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
    function setCertificateIssued(string calldata assetId, bool issued) external override {
        equipmentById[assetId].certificateIssued = issued;
    }

    /// @notice Updates the compliance flag used by transfer and reporting workflows.
    function setComplianceStatus(string calldata assetId, bool compliant) external override {
        equipmentById[assetId].compliant = compliant;
    }

    /// @notice Returns the full equipment record for read-only consumers such as auditors or UI clients.
    function getEquipment(string calldata assetId) external view override returns (Equipment memory) {
        return equipmentById[assetId];
    }
}
