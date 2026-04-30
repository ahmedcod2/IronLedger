// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title IInspectionLog
/// @notice Interface for storing inspection history and managing equipment compliance status.
interface IInspectionLog {
    enum Result { Pass, Fail }

    struct InspectionRecord {
        uint256 inspectionId;
        address inspector;
        uint256 inspectedAt;
        Result result;
        bytes32 notesHash;
    }

    /// @notice Appends a new inspection record for an equipment asset.
    function logInspection(uint256 equipmentId, Result result, bytes32 notesHash) external;

    /// @notice Marks equipment non-compliant if its last inspection is overdue.
    function checkOverdue(uint256 equipmentId) external;

    /// @notice Updates the global inspection interval used for overdue checks.
    function setInspectionInterval(uint256 intervalSeconds) external;

    /// @notice Returns whether an equipment asset is currently compliant.
    function isCompliant(uint256 equipmentId) external view returns (bool);

    /// @notice Returns the full inspection history for an equipment asset.
    function getInspectionHistory(uint256 equipmentId) external view returns (InspectionRecord[] memory);

    /// @notice Returns the most recent inspection record for an equipment asset.
    /// @dev Reverts if no inspections have been recorded for the asset.
    function getLastInspection(uint256 equipmentId) external view returns (InspectionRecord memory);

    // ─── Events ───────────────────────────────────────────────────────────────

    /// @notice Emitted when a new inspection is recorded for an equipment asset.
    event InspectionLogged(
        uint256 indexed equipmentId,
        uint256 indexed inspectionId,
        address indexed inspector,
        Result result
    );

    /// @notice Emitted when the compliance flag changes (either direction).
    /// @param compliant True if the asset is now compliant; false if revoked.
    event ComplianceFlagUpdated(uint256 indexed equipmentId, bool compliant);
}
