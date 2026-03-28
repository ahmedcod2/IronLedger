// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "./IInspectionLog.sol";
import "../libraries/Roles.sol";

/// @title InspectionLog
/// @notice Smart contract for storing inspection history and pass/fail outcomes.
/// @dev Role-based access is enforced via OpenZeppelin AccessControl. A future iteration
///      can emit events and automatically push compliance updates to EquipmentRegistry.
contract InspectionLog is IInspectionLog, AccessControl {
    mapping(string => InspectionRecord[]) private inspectionsByAsset;

    /// @notice Grants DEFAULT_ADMIN_ROLE to the deployer so they can assign roles post-deploy.
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    /// @notice Adds a new inspection record for a specific asset.
    /// @dev Caller must hold SCO_ROLE. Future logic can notify registry contracts of outcomes.
    function logInspection(
        string calldata assetId,
        uint256 inspectionDate,
        bool passed,
        string calldata notes
    ) external override onlyRole(Roles.SCO_ROLE) {
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
