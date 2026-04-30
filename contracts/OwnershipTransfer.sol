// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "./interfaces/IOwnershipTransfer.sol";
import "./interfaces/IEquipmentRegistry.sol";
import "./interfaces/IInspectionLog.sol";
import "./libraries/Roles.sol";

/// @title OwnershipTransfer
/// @notice Two-step custody transfer contract with compliance gating via InspectionLog.
/// @dev Equipment must be compliant (per InspectionLog) before a transfer can be initiated.
///      The current custodian initiates the transfer; they confirm it after an off-chain handover.
contract OwnershipTransfer is IOwnershipTransfer, AccessControl {
    IEquipmentRegistry public immutable registry;
    IInspectionLog public immutable inspectionLog;

    mapping(uint256 => address) public currentOwner;
    mapping(uint256 => TransferRecord[]) public transferHistory;
    mapping(uint256 => address) public pendingTransfer;

    // ─── Role Modifiers ──────────────────────────────────────────────────────

    modifier onlyABSA() {
        require(hasRole(Roles.ABSA_ROLE, msg.sender), "OwnershipTransfer: caller is not an ABSA inspector");
        _;
    }

    /// @dev Checks that the caller is the registered custodian of this specific equipment.
    modifier onlyOwner(uint256 equipmentId) {
        require(
            currentOwner[equipmentId] == msg.sender,
            "OwnershipTransfer: caller is not the current owner"
        );
        _;
    }

    modifier onlyOperator() {
        require(hasRole(Roles.OPERATOR_ROLE, msg.sender), "OwnershipTransfer: caller is not an operator");
        _;
    }

    // ─── Constructor ─────────────────────────────────────────────────────────

    /// @param absa Address to be granted ABSA_ROLE on deployment.
    /// @param equipmentRegistry Address of the EquipmentRegistry contract.
    /// @param _inspectionLog Address of the InspectionLog contract used for compliance gating.
    constructor(
        address absa,
        address equipmentRegistry,
        address _inspectionLog
    ) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(Roles.ABSA_ROLE, absa);
        registry = IEquipmentRegistry(equipmentRegistry);
        inspectionLog = IInspectionLog(_inspectionLog);
    }

    // ─── State-Changing Functions ─────────────────────────────────────────────

    /// @inheritdoc IOwnershipTransfer
    /// @dev Can only be called once per equipment asset; used after activateEquipment.
    function assignInitialCustody(uint256 equipmentId, address operator)
        external
        override
        onlyABSA
    {
        require(currentOwner[equipmentId] == address(0), "OwnershipTransfer: custody already assigned");
        require(operator != address(0), "OwnershipTransfer: invalid operator address");

        currentOwner[equipmentId] = operator;
        transferHistory[equipmentId].push(
            TransferRecord({
                from: address(0),
                to: operator,
                transferredAt: block.timestamp,
                transferredBy: msg.sender
            })
        );

        emit CustodyAssigned(equipmentId, operator);
    }

    /// @inheritdoc IOwnershipTransfer
    /// @dev Caller must be both the current custodian and hold OPERATOR_ROLE.
    ///      Equipment must also be compliant per InspectionLog before transfer is locked in.
    function initiateTransfer(uint256 equipmentId, address to)
        external
        override
        onlyOwner(equipmentId)
        onlyOperator
    {
        require(to != address(0), "OwnershipTransfer: invalid recipient address");
        require(pendingTransfer[equipmentId] == address(0), "OwnershipTransfer: transfer already pending");
        require(inspectionLog.isCompliant(equipmentId), "OwnershipTransfer: equipment is not compliant");

        pendingTransfer[equipmentId] = to;

        emit TransferInitiated(equipmentId, msg.sender, to);
    }

    /// @inheritdoc IOwnershipTransfer
    /// @dev Called by the current custodian after off-chain handover is complete.
    function completeTransfer(uint256 equipmentId)
        external
        override
        onlyOwner(equipmentId)
    {
        address to = pendingTransfer[equipmentId];
        require(to != address(0), "OwnershipTransfer: no pending transfer");

        address from = currentOwner[equipmentId];
        currentOwner[equipmentId] = to;
        pendingTransfer[equipmentId] = address(0);

        transferHistory[equipmentId].push(
            TransferRecord({
                from: from,
                to: to,
                transferredAt: block.timestamp,
                transferredBy: msg.sender
            })
        );

        emit TransferCompleted(equipmentId, from, to);
    }

    /// @inheritdoc IOwnershipTransfer
    function cancelTransfer(uint256 equipmentId)
        external
        override
        onlyOwner(equipmentId)
    {
        require(pendingTransfer[equipmentId] != address(0), "OwnershipTransfer: no pending transfer");
        pendingTransfer[equipmentId] = address(0);

        emit TransferCancelled(equipmentId, msg.sender);
    }

    // ─── View Functions ───────────────────────────────────────────────────────

    /// @inheritdoc IOwnershipTransfer
    function getCurrentOwner(uint256 equipmentId) external view override returns (address) {
        return currentOwner[equipmentId];
    }

    /// @inheritdoc IOwnershipTransfer
    function getTransferHistory(uint256 equipmentId)
        external
        view
        override
        returns (TransferRecord[] memory)
    {
        return transferHistory[equipmentId];
    }

    /// @inheritdoc IOwnershipTransfer
    function getPendingTransfer(uint256 equipmentId)
        external
        view
        override
        returns (address to)
    {
        return pendingTransfer[equipmentId];
    }
}
