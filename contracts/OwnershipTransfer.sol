// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "./interfaces/IOwnershipTransfer.sol";
import "./interfaces/IEquipmentRegistry.sol";
import "./libraries/Roles.sol";

/// @title OwnershipTransfer
/// @notice Custody transfer contract that checks lifecycle compliance before transfer.
/// @dev Role-based access is enforced via OpenZeppelin AccessControl. Later versions can
///      integrate inspection checks, event emission, and richer authorization rules.
contract OwnershipTransfer is IOwnershipTransfer, AccessControl {
    IEquipmentRegistry public immutable registry;

    /// @notice Grants DEFAULT_ADMIN_ROLE to the deployer so they can assign roles post-deploy.
    constructor(address registryAddress) {
        registry = IEquipmentRegistry(registryAddress);
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    /// @notice Transfers an asset to a new operator if transfer conditions are satisfied.
    /// @dev Caller must hold OPERATOR_ROLE. Final state update is left for a later milestone.
    function transferOwnership(string calldata assetId, address newOperator) external override onlyRole(Roles.OPERATOR_ROLE) {
        require(canTransfer(assetId), "Asset is not eligible for transfer");
        // Future implementation:
        // 1. verify caller authorization
        // 2. update current operator in registry
        // 3. emit provenance transfer event
        newOperator; // silence unused variable warning in draft stage
    }

    /// @notice Returns whether a transfer is currently allowed based on certificate/compliance state.
    function canTransfer(string calldata assetId) public view override returns (bool) {
        IEquipmentRegistry.Equipment memory asset = registry.getEquipment(assetId);
        return asset.exists && asset.certificateIssued && asset.compliant;
    }
}
