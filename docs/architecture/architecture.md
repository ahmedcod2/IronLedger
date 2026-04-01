# IronLedger Architecture

## On-chain contracts (Solidity 0.8.24 / OpenZeppelin 5.x)

All three contracts use `AccessControl` from OpenZeppelin. Role constants are centralised in `contracts/libraries/Roles.sol` so `hasRole()` checks are always consistent.

**EquipmentRegistry** — the source of truth for every pressure asset. Tracks a 4-step lifecycle:
`Registered → ShopInspected → Certified → Active`
Each transition is gated by a different role: manufacturer registers, SCO signs the shop inspection, ABSA issues the certificate and activates the asset.

**InspectionLog** — append-only inspection history keyed by `equipmentId`. Each record stores inspector address, timestamp, pass/fail result, and a `bytes32` hash of off-chain notes. The contract maintains a `complianceFlag` per asset and a configurable `inspectionInterval`; calling `checkOverdue` flips the flag to false if the last inspection is stale.

**OwnershipTransfer** — two-step custody transfer. `initiateTransfer` gates on `InspectionLog.isCompliant()` before queuing a pending transfer; `completeTransfer` is called by the same custodian after off-chain handover to finalise it. Full transfer history is kept on-chain.

## Role map

| Role | Granted to | Gate |
|---|---|---|
| `MANUFACTURER_ROLE` | Equipment manufacturers | `registerEquipment` |
| `SCO_ROLE` | Shop Check Officers | `signShopInspection`, `logInspection` |
| `ABSA_ROLE` | Regulatory inspectors | `issueCertificate`, `activateEquipment`, `checkOverdue`, `setInspectionInterval`, `assignInitialCustody` |
| `OPERATOR_ROLE` | Equipment operators | `initiateTransfer` (must also be current custodian) |
| `DEFAULT_ADMIN_ROLE` | Deployer wallet | `grantRole` / `revokeRole` on all contracts |

`completeTransfer` and `cancelTransfer` are guarded by an address check only — the caller must be the registered custodian, no role required.

## Off-chain layer (Go 1.24 / go-ethereum v1.17.1)

**`internal/client/sepolia.go`** — dials the Sepolia RPC, fetches chain ID / nonce / gas price, and returns a fully configured `*bind.TransactOpts` signer.

**`pkg/contracts/`** — hand-written ABI bindings (equipment_registry.go, inspection_log.go, ownership_transfer.go). Each file embeds the full JSON ABI as a string constant and exposes typed Go methods that wrap `contract.Transact` and `contract.Call`.

**`cmd/ironledger-cli/main.go`** — 10-command CLI. Commands map 1-to-1 onto contract functions. All write commands block until the transaction is mined and print the gas used.

## Deployment flow

1. `npx hardhat run scripts/deploy.js --network sepolia` — deploys all three contracts in order (EquipmentRegistry first, then InspectionLog with its address, then OwnershipTransfer with both).
2. `npx hardhat run scripts/grant-roles.js --network sepolia` — grants all write roles to the operator wallet.
3. Copy the printed contract addresses into `.env`.
4. `go build -o bin/ironledger-cli.exe ./cmd/ironledger-cli/...` — build the CLI.
