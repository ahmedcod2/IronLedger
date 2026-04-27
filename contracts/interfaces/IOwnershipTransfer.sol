// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title IOwnershipTransfer
/// @notice Interface for two-step custody transfer logic between certified operators.
interface IOwnershipTransfer {
    struct TransferRecord {
        address from;
        address to;
        uint256 transferredAt;
        address transferredBy;
    }

    /// @notice Assigns the initial custodian of a newly activated equipment asset.
    function assignInitialCustody(uint256 equipmentId, address operator) external;

    /// @notice Initiates a pending transfer to a new operator.
    function initiateTransfer(uint256 equipmentId, address to) external;

    /// @notice Finalises the pending transfer, updating the current owner.
    function completeTransfer(uint256 equipmentId) external;

    /// @notice Cancels an in-progress pending transfer.
    function cancelTransfer(uint256 equipmentId) external;

    /// @notice Returns the current custodian of the equipment.
    function getCurrentOwner(uint256 equipmentId) external view returns (address);

    /// @notice Returns the full custody transfer history for an equipment asset.
    function getTransferHistory(uint256 equipmentId) external view returns (TransferRecord[] memory);

    /// @notice Returns the address of the pending transfer recipient, or address(0) if none.
    function getPendingTransfer(uint256 equipmentId) external view returns (address to);

    // ─── Events ───────────────────────────────────────────────────────────────

    /// @notice Emitted when ABSA assigns the first custodian after equipment activation.
    event CustodyAssigned(uint256 indexed equipmentId, address indexed operator);

    /// @notice Emitted when a custodian initiates a pending transfer.
    event TransferInitiated(uint256 indexed equipmentId, address indexed from, address indexed to);

    /// @notice Emitted when a pending transfer is finalised and ownership changes.
    event TransferCompleted(uint256 indexed equipmentId, address indexed from, address indexed to);

    /// @notice Emitted when a pending transfer is cancelled by the current custodian.
    event TransferCancelled(uint256 indexed equipmentId, address indexed cancelledBy);
}
