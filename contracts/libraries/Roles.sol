// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title Roles
/// @notice Single source of truth for all AccessControl role constants in IronLedger.
/// @dev Import this library in every contract that uses AccessControl. Centralising the
///      keccak256 hashes here guarantees that hasRole() checks are identical across
///      EquipmentRegistry, InspectionLog, and OwnershipTransfer — a mismatch would cause
///      silent authorisation failures that are hard to debug on-chain.
library Roles {
    /// @notice Granted to equipment manufacturers. Permits registering new assets.
    bytes32 internal constant MANUFACTURER_ROLE = keccak256("MANUFACTURER_ROLE");

    /// @notice Granted to Shop Check Officers. Permits logging inspection events.
    bytes32 internal constant SCO_ROLE = keccak256("SCO_ROLE");

    /// @notice Granted to ABSA inspectors / regulatory admins. Permits issuing
    ///         certificates and updating compliance status.
    bytes32 internal constant ABSA_ROLE = keccak256("ABSA_ROLE");

    /// @notice Granted to equipment operators. Permits initiating custody transfers.
    bytes32 internal constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");
}
