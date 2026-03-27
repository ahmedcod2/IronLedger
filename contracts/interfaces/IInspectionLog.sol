// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title IInspectionLog
/// @notice Interface for storing inspection events and associated compliance outcomes.
interface IInspectionLog {
    struct InspectionRecord {
        uint256 inspectionDate;
        address inspector;
        bool passed;
        string notes;
    }

    /// @notice Appends a new inspection record for an equipment asset.
    function logInspection(
        string calldata assetId,
        uint256 inspectionDate,
        bool passed,
        string calldata notes
    ) external;

    /// @notice Returns the number of inspection records stored for an asset.
    function getInspectionCount(string calldata assetId) external view returns (uint256);

    /// @notice Returns an inspection record at a given index.
    function getInspectionRecord(string calldata assetId, uint256 index)
        external
        view
        returns (InspectionRecord memory);
}
