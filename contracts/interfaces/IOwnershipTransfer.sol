// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title IOwnershipTransfer
/// @notice Interface for custody transfer logic between operators.
interface IOwnershipTransfer {
    /// @notice Transfers equipment custody to a new operator if compliance conditions are satisfied.
    function transferOwnership(string calldata assetId, address newOperator) external;

    /// @notice Returns whether an equipment asset is currently eligible for transfer.
    function canTransfer(string calldata assetId) external view returns (bool);
}
