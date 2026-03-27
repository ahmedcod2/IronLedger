// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./IInspectionLog.sol";

/// @title InspectionLog
/// @notice Draft smart contract for storing inspection history and pass/fail outcomes.
/// @dev A later iteration can integrate access control and automatic compliance updates.
contract InspectionLog is IInspectionLog {
    mapping(string => InspectionRecord[]) private inspectionsByAsset;

    /// @notice Adds a new inspection record for a specific asset.
    /// @dev Future logic can emit events and notify registry contracts of pass/fail outcomes.
    function logInspection(
        string calldata assetId,
        uint256 inspectionDate,
        bool passed,
        string calldata notes
    ) external override {
        inspectionsByAsset[assetId].push(
            InspectionRecord({
                inspectionDate: inspectionDate,
                inspector: msg.sender,
                passed: passed,
                notes: notes
            })
        );
    }

    /// @notice Returns the number of inspections recorded for a given asset.
    function getInspectionCount(string calldata assetId) external view override returns (uint256) {
        return inspectionsByAsset[assetId].length;
    }

    /// @notice Returns a single inspection record by index for audit or UI purposes.
    function getInspectionRecord(string calldata assetId, uint256 index)
        external
        view
        override
        returns (InspectionRecord memory)
    {
        return inspectionsByAsset[assetId][index];
    }
}
