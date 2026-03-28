# IronLedger

IronLedger is a blockchain-based pressure equipment lifecycle and provenance system for the Alberta oil and gas sector. It anchors equipment registration, inspection history, compliance status, and custody transfer events to an immutable Ethereum ledger, making the full lifecycle of any regulated pressure asset auditable by ABSA, Safety Codes Officers, Operators, and Auditors at any time.

**Course:** CSE 540 — Team 4, Spring B 2026  
**Network:** Ethereum Sepolia Testnet (Chain ID 11155111)  
**Stack:** Solidity 0.8.24 · OpenZeppelin 5.x · Hardhat · Go 1.24 · go-ethereum v1.17.1

---

## Deployed Contracts (Sepolia)

Contract addresses are stored in your `.env` file after running the deploy script.  
See `.env.example` for required variable names.

---

## Architecture

```
Off-Chain                          On-Chain (Sepolia)
─────────────────                  ──────────────────────────────────────
Manufacturer  ──── register ──────► EquipmentRegistry.sol
SCO           ──── inspect  ──────► InspectionLog.sol
ABSA          ──── certify  ──────► EquipmentRegistry.sol (setCertificateIssued)
ABSA          ── set-compliant ───► EquipmentRegistry.sol (setComplianceStatus)
Operator      ──── transfer ──────► OwnershipTransfer.sol
                                           │
                                           └── compliance gate ──► reverts if
                                                                    cert or
                                                                    compliance
                                                                    flag false
Auditor / ACQ ── status query (free eth_call, no gas) ──────────────────────►
```

`OwnershipTransfer` cross-calls `EquipmentRegistry` on every transfer attempt. If `certificateIssued` or `compliant` is `false`, the transaction reverts on-chain — no off-chain check can bypass this.

---

## Role-Based Access Control (RBAC)

All write functions are protected by OpenZeppelin `AccessControl`. Role constants are defined in a single shared library (`contracts/libraries/Roles.sol`) to guarantee identical `keccak256` hashes across all contracts.

| Role | Contract | Permitted action |
|---|---|---|
| `MANUFACTURER_ROLE` | EquipmentRegistry | `registerEquipment` |
| `SCO_ROLE` | InspectionLog | `logInspection` |
| `ABSA_ROLE` | EquipmentRegistry | `setCertificateIssued`, `setComplianceStatus` |
| `OPERATOR_ROLE` | OwnershipTransfer | `transferOwnership` |
| `DEFAULT_ADMIN_ROLE` | All contracts | `grantRole` / `revokeRole` — assigned to deployer |

Roles are granted post-deploy using `scripts/grant-roles.js` (see **Grant Roles** section below).

---

## Repository Structure

```text
IronLedger/
├── cmd/ironledger-cli/main.go        ← CLI entry point
├── internal/client/sepolia.go        ← Ethereum RPC client + EIP-155 tx signer
├── pkg/contracts/
│   ├── equipment_registry.go         ← Go ABI binding for EquipmentRegistry
│   ├── inspection_log.go             ← Go ABI binding for InspectionLog
│   └── ownership_transfer.go         ← Go ABI binding for OwnershipTransfer
├── contracts/
│   ├── EquipmentRegistry.sol
│   ├── OwnershipTransfer.sol
│   ├── interfaces/
│   │   ├── IEquipmentRegistry.sol
│   │   ├── IInspectionLog.sol
│   │   ├── IOwnershipTransfer.sol
│   │   └── InspectionLog.sol
│   └── libraries/
│       └── Roles.sol                 ← Shared RBAC role constants
├── scripts/
│   ├── deploy.js                     ← Deploys all 3 contracts to Sepolia
│   └── grant-roles.js                ← Grants all roles to deployer wallet
├── test/
│   └── placeholder.test.js           ← Hardhat test suite (20 tests)
├── .env.example                      ← Credential template
├── .gitignore
├── Makefile                          ← deps / bindings / build / clean
├── go.mod
├── hardhat.config.js
└── package.json
```

---

## Prerequisites

| Tool | Version | Install |
|---|---|---|
| Go | 1.22+ | https://go.dev/dl/ |
| Node.js | 18+ | https://nodejs.org |
| Git | any | https://git-scm.com |

> **Windows users:** `make` is not available in PowerShell. Use the equivalent `go build` command shown below instead.

---

## Quick Start

### 1. Clone and install dependencies

```bash
git clone https://github.com/ahmedcod2/IronLedger.git
cd IronLedger
npm install
go mod tidy
```

### 2. Configure credentials

```bash
cp .env.example .env
```

Edit `.env` and fill in:
- `SEPOLIA_RPC_URL` — Alchemy or Infura HTTPS endpoint for Sepolia
- `PRIVATE_KEY` — 64-char hex private key, no `0x` prefix

### 3. Build the CLI

```powershell
go build -o bin/ironledger-cli.exe ./cmd/ironledger-cli/...
```

### 4. Run the Hardhat tests

```powershell
npx hardhat test
```

All 20 tests should pass, covering RBAC access control on all three contracts.

### 5. Deploy contracts to Sepolia

```powershell
npx hardhat run scripts/deploy.js --network sepolia
```

Copy the three printed addresses into your `.env`:
```
REGISTRY_CONTRACT_ADDRESS=0x...
INSPECTION_CONTRACT_ADDRESS=0x...
TRANSFER_CONTRACT_ADDRESS=0x...
```

### 6. Grant roles to your wallet

Your deployer wallet receives `DEFAULT_ADMIN_ROLE` automatically, but not the write roles. Run:

```powershell
npx hardhat run scripts/grant-roles.js --network sepolia
```

This grants `MANUFACTURER_ROLE`, `SCO_ROLE`, `ABSA_ROLE`, and `OPERATOR_ROLE` to the wallet in your `.env`. To grant roles to a different address, set `GRANT_TO=0x...` in `.env` before running the script.

---

## CLI Usage

```
.\bin\ironledger-cli.exe <command> [arguments]
```

| Command | Arguments | Role required |
|---|---|---|
| `register` | `<assetId> <crn> <aNumber> <mdrHash> <operatorAddress>` | `MANUFACTURER_ROLE` |
| `inspect` | `<assetId> <unixTimestamp> <true\|false> <notes>` | `SCO_ROLE` |
| `transfer` | `<assetId> <newOperatorAddress>` | `OPERATOR_ROLE` |
| `status` | `<assetId>` | None (free read) |

### Full lifecycle example

```powershell
# 1. Register a new pressure vessel (Manufacturer)
.\bin\ironledger-cli.exe register VESSEL-001 CRN-2024-99 A-4521 0x4e16e0a60bcf45c8867d36abc5840fa5 0xYourWalletAddress

# 2. Verify it was stored
.\bin\ironledger-cli.exe status VESSEL-001

# 3. Log a passing inspection (SCO)
.\bin\ironledger-cli.exe inspect VESSEL-001 1743033600 true "Passed hydrostatic test."

# 4. Issue certificate + set compliant (ABSA — via Etherscan or grant-roles wallet)
#    setCertificateIssued and setComplianceStatus must both be true before transfer

# 5. Transfer custody to new operator (Operator)
.\bin\ironledger-cli.exe transfer VESSEL-001 0xNewOperatorAddress
```

Each write command prints the transaction hash and blocks until the transaction is mined:
```
Connected to Sepolia testnet.
RegisterEquipment submitted — tx hash: 0x54061d...
Waiting for transaction 0x54061d... to be mined…
Transaction mined successfully in block 10536889 (gas used: 187624).
```

`status` is a free `eth_call` — instant, no gas, no wallet needed.

---

## Re-deploying Contracts

After any Solidity change, redeploy and re-grant roles:

```powershell
npx hardhat run scripts/deploy.js --network sepolia
# Update the three addresses in .env
npx hardhat run scripts/grant-roles.js --network sepolia
```

## Regenerating Go Bindings

After a contract ABI change, regenerate the Go bindings (requires `solc 0.8.24` and `abigen` on PATH):

```bash
make bindings
go build -o bin/ironledger-cli.exe ./cmd/ironledger-cli/...
```
