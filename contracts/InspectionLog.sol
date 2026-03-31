// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "./interfaces/IInspectionLog.sol";
import "./libraries/Roles.sol";

/// @title InspectionLog
/// @notice Records inspection events and tracks compliance status for pressure equipment.
/// @dev Compliance is set automatically based on pass/fail outcomes. The ABSA role can
///      trigger overdue checks to revoke compliance when the inspection interval is exceeded.
contract InspectionLog is IInspectionLog, AccessControl {
    mapping(uint256 => InspectionRecord[]) public inspections;
    mapping(uint256 => uint256) public lastInspectedAt;
    mapping(uint256 => bool) public complianceFlag;
    uint256 public inspectionInterval;

    // ─── Role Modifiers ──────────────────────────────────────────────────────

    modifier onlySCO() {
        require(hasRole(Roles.SCO_ROLE, msg.sender), "InspectionLog: caller is not a SCO");
        _;
    }

    modifier onlyABSA() {
        require(hasRole(Roles.ABSA_ROLE, msg.sender), "InspectionLog: caller is not an ABSA inspector");
        _;
    }

    // ─── Constructor ─────────────────────────────────────────────────────────

    /// @param absa Address to be granted ABSA_ROLE on deployment.
    /// @param intervalSeconds Initial inspection interval in seconds.
    constructor(
        address absa,
        address /* equipmentRegistry — reserved for future cross-contract validation */,
        uint256 intervalSeconds
    ) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(Roles.ABSA_ROLE, absa);
        inspectionInterval = intervalSeconds;
    }

    // ─── State-Changing Functions ─────────────────────────────────────────────

    /// @inheritdoc IInspectionLog
    function logInspection(
        uint256 equipmentId,
        Result result,
        bytes32 notesHash
    ) external override onlySCO {
        uint256 inspectionId = inspections[equipmentId].length + 1;

        inspections[equipmentId].push(
            InspectionRecord({
                inspectionId: inspectionId,
                inspector: msg.sender,
                inspectedAt: block.timestamp,
                result: result,
                notesHash: notesHash
            })
        );

        lastInspectedAt[equipmentId] = block.timestamp;
        complianceFlag[equipmentId] = (result == Result.Pass);
    }

    /// @inheritdoc IInspectionLog
    /// @dev Sets complianceFlag to false if the last inspection is older than inspectionInterval.
    function checkOverdue(uint256 equipmentId) external override onlyABSA {
        if (
            inspectionInterval > 0 &&
            block.timestamp > lastInspectedAt[equipmentId] + inspectionInterval
        ) {
            complianceFlag[equipmentId] = false;
        }
    }

    /// @inheritdoc IInspectionLog
    function setInspectionInterval(uint256 intervalSeconds) external override onlyABSA {
        inspectionInterval = intervalSeconds;
    }

    // ─── View Functions ───────────────────────────────────────────────────────

    /// @inheritdoc IInspectionLog
    function isCompliant(uint256 equipmentId) external view override returns (bool) {
        return complianceFlag[equipmentId];
    }

    /// @inheritdoc IInspectionLog
    function getInspectionHistory(uint256 equipmentId)
        external
        view
        override
        returns (InspectionRecord[] memory)
    {
        return inspections[equipmentId];
    }
}
