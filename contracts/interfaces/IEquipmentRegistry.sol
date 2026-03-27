// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title IEquipmentRegistry
/// @notice Interface for registering regulated equipment and reading its current lifecycle state.
interface IEquipmentRegistry {
    struct Equipment {
        string assetId;
        string crn;
        string aNumber;
        string mdrHash;
        address currentOperator;
        bool certificateIssued;
        bool compliant;
        bool exists;
    }

    /// @notice Registers a new equipment asset with its regulatory identifiers.
    function registerEquipment(
        string calldata assetId,
        string calldata crn,
        string calldata aNumber,
        string calldata mdrHash,
        address initialOperator
    ) external;

    /// @notice Marks whether the certificate of inspection has been issued.
    function setCertificateIssued(string calldata assetId, bool issued) external;

    /// @notice Updates the compliance flag for a given asset.
    function setComplianceStatus(string calldata assetId, bool compliant) external;

    /// @notice Returns the stored equipment record for an asset id.
    function getEquipment(string calldata assetId) external view returns (Equipment memory);
}
