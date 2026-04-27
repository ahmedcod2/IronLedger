// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title IEquipmentRegistry
/// @notice Interface for registering regulated pressure equipment and managing its lifecycle state.
interface IEquipmentRegistry {
    enum Status { Registered, ShopInspected, Certified, Active }

    struct Equipment {
        uint256 equipmentId;
        string crn;
        string aNumber;
        bytes32 mdrHash;
        uint256 mawp;
        address manufacturer;
        uint256 registeredAt;
        address shopInspector;
        uint256 shopInspectedAt;
        address certificateIssuer;
        uint256 certificateIssuedAt;
        Status status;
    }

    /// @notice Registers a new equipment asset and returns its auto-incremented ID.
    function registerEquipment(string calldata crn, bytes32 mdrHash, uint256 mawp)
        external
        returns (uint256 equipmentId);

    /// @notice Records a shop inspection signature, advancing state to ShopInspected.
    function signShopInspection(uint256 equipmentId) external;

    /// @notice Issues a commissioning certificate, advancing state to Certified.
    function issueCertificate(uint256 equipmentId, string calldata aNumber) external;

    /// @notice Activates certified equipment, advancing state to Active.
    function activateEquipment(uint256 equipmentId) external;

    /// @notice Returns the full equipment record for a given ID.
    function getEquipment(uint256 equipmentId) external view returns (Equipment memory);

    /// @notice Returns true if the equipment is in Certified or Active state.
    function isCertified(uint256 equipmentId) external view returns (bool);

    // ─── Events ───────────────────────────────────────────────────────────────

    /// @notice Emitted when a new equipment asset is registered.
    event EquipmentRegistered(uint256 indexed equipmentId, address indexed manufacturer, string crn);

    /// @notice Emitted when a Safety Codes Officer signs the shop inspection.
    event ShopInspectionSigned(uint256 indexed equipmentId, address indexed inspector);

    /// @notice Emitted when ABSA issues a Certificate of Inspection.
    event CertificateIssued(uint256 indexed equipmentId, address indexed issuer, string aNumber);

    /// @notice Emitted when ABSA activates the equipment for in-service operation.
    event EquipmentActivated(uint256 indexed equipmentId);
}
