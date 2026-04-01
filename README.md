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
-----------------                  ------------------------------------------
Manufacturer  ---- register ------> EquipmentRegistry.sol
SCO           ---- shopinspect ----> EquipmentRegistry.sol (signShopInspection)
ABSA          ---- certify --------> EquipmentRegistry.sol (issueCertificate)
ABSA          ---- activate -------> EquipmentRegistry.sol (activateEquipment)
SCO           ---- loginspect -----> InspectionLog.sol
ABSA          ---- custody --------> OwnershipTransfer.sol (assignInitialCustody)
Operator      ---- initxfer -------> OwnershipTransfer.sol (initiateTransfer)
                                             |
                                             +-- compliance gate --> reverts if
                                                                     isCompliant
                                                                     returns false
Operator      ---- completexfer ---> OwnershipTransfer.sol (completeTransfer)
Auditor / ACQ -- status query (free eth_call, no gas) ---------------------------
```

`OwnershipTransfer` calls `InspectionLog.isCompliant()` when a transfer is initiated. If the compliance flag is `false` — no passing inspection on record, or the last inspection is overdue — `initiateTransfer` reverts on-chain before the transfer is queued.

---

## Role-Based Access Control (RBAC)

All write functions are protected by OpenZeppelin `AccessControl`. Role constants are defined in `contracts/libraries/Roles.sol`.

| Role | Contract | Permitted actions |
|---|---|---|
| `MANUFACTURER_ROLE` | EquipmentRegistry | `registerEquipment` |
| `SCO_ROLE` | EquipmentRegistry | `signShopInspection` |
| `SCO_ROLE` | InspectionLog | `logInspection` |
| `ABSA_ROLE` | EquipmentRegistry | `issueCertificate`, `activateEquipment` |
| `ABSA_ROLE` | InspectionLog | `checkOverdue`, `setInspectionInterval` |
| `ABSA_ROLE` | OwnershipTransfer | `assignInitialCustody` |
| `OPERATOR_ROLE` | OwnershipTransfer | `initiateTransfer` (must also be current custodian) |
| Current custodian | OwnershipTransfer | `completeTransfer`, `cancelTransfer` (address check only, no role) |
| `DEFAULT_ADMIN_ROLE` | All contracts | `grantRole` / `revokeRole` — assigned to deployer |

Roles are granted post-deploy using `scripts/grant-roles.js` (see **Grant Roles** section below).

---

## Repository Structure

```text
IronLedger/
├── cmd/ironledger-cli/main.go        <- CLI entry point
├── internal/client/sepolia.go        <- Ethereum RPC client + EIP-155 tx signer
├── pkg/contracts/
│   ├── equipment_registry.go         <- Go ABI binding for EquipmentRegistry
│   ├── inspection_log.go             <- Go ABI binding for InspectionLog
│   └── ownership_transfer.go         <- Go ABI binding for OwnershipTransfer
├── contracts/
│   ├── EquipmentRegistry.sol
│   ├── InspectionLog.sol
│   ├── OwnershipTransfer.sol
│   ├── interfaces/
│   │   ├── IEquipmentRegistry.sol
│   │   ├── IInspectionLog.sol
│   │   └── IOwnershipTransfer.sol
│   └── libraries/
│       └── Roles.sol                 <- Shared RBAC role constants
├── scripts/
│   ├── deploy.js                     <- Deploys all 3 contracts to Sepolia
│   └── grant-roles.js                <- Grants all roles to deployer wallet
├── docs/
│   ├── architecture
│   │   ├── architecture.md
│   │   ├── IronLedger_Process_Flow.docx
│   │   └── IronLedger_System_Architecture.pdf
│   ├── smart-contracts
│   │   ├── IronLedger_Function_Signatures.xlsx
│   │   └── IronLedger_State_Variables_and_Event_Schemas.xlsx 
│   └── ui
│       ├── IronLedger_Integration_Diagram.html
│       ├── IronLedger_Roles_Permissions.xlsx
│       └── IronLedger_UI_Mockup.html
├── test/
│   └── placeholder.test.js           <- Hardhat test suite (31 tests)
├── .env.example                      <- Credential template
├── .gitignore
├── Makefile                          <- deps / bindings / build / clean
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

All 31 tests should pass, covering RBAC access control and the full 4-step lifecycle on all three contracts.

### 5. Deploy contracts to Sepolia

Set the required env vars in `.env`:
```
ABSA_ADDRESS=0x...                  # wallet that receives ABSA_ROLE on deploy
INSPECTION_INTERVAL_SECS=2592000    # inspection interval in seconds (30 days)
```

Then deploy:
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

This grants `MANUFACTURER_ROLE`, `SCO_ROLE`, `ABSA_ROLE`, and `OPERATOR_ROLE` on all contracts to the wallet in your `.env`. To grant roles to a different address, set `GRANT_TO=0x...` in `.env` before running the script.

---

## CLI Usage

```
.\bin\ironledger-cli.exe <command> [arguments]
```

| Command | Arguments | Role required |
|---|---|---|
| `register` | `<crn> <mdrHashHex> <mawp>` | `MANUFACTURER_ROLE` |
| `shopinspect` | `<equipmentId>` | `SCO_ROLE` |
| `certify` | `<equipmentId> <aNumber>` | `ABSA_ROLE` |
| `activate` | `<equipmentId>` | `ABSA_ROLE` |
| `loginspect` | `<equipmentId> <pass\|fail> <notesHashHex>` | `SCO_ROLE` |
| `custody` | `<equipmentId> <operatorAddress>` | `ABSA_ROLE` |
| `initxfer` | `<equipmentId> <toAddress>` | `OPERATOR_ROLE` + must be current custodian |
| `completexfer` | `<equipmentId>` | Must be current custodian |
| `cancelxfer` | `<equipmentId>` | Must be current custodian |
| `status` | `<equipmentId>` | None (free read) |

### Full lifecycle example

```powershell
# 1. Register a new pressure vessel (Manufacturer)
#    mdrHashHex = keccak256 of the MDR document (64 hex chars, no 0x), mawp in kPa
#    The CLI prints the assigned equipment ID after the transaction mines
.\bin\ironledger-cli.exe register CRN-2024-99 4e16e0a60bcf45c8867d36abc5840fa5c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6 10000
# Output: Equipment registered successfully — ID: 1 (use this ID for all subsequent commands)

# 2. SCO signs off on shop inspection
.\bin\ironledger-cli.exe shopinspect 1

# 3. ABSA issues certificate with A-number
.\bin\ironledger-cli.exe certify 1 A-4521

# 4. ABSA activates equipment for field use
.\bin\ironledger-cli.exe activate 1

# 5. Log a passing inspection (SCO)
#    notesHashHex = keccak256 of off-chain inspection notes (64 hex chars, no 0x)
.\bin\ironledger-cli.exe loginspect 1 pass aabbccdd11223344aabbccdd11223344aabbccdd11223344aabbccdd11223344

# 6. ABSA assigns initial custody to an operator
.\bin\ironledger-cli.exe custody 1 0xOperatorAddress

# 7. Operator initiates custody transfer
.\bin\ironledger-cli.exe initxfer 1 0xNewOperatorAddress

# 8. Complete the transfer
.\bin\ironledger-cli.exe completexfer 1

# 9. Read on-chain status (free eth_call, no gas)
.\bin\ironledger-cli.exe status 1
```

Each write command prints the transaction hash and blocks until the transaction is mined:
```
Connected to Sepolia testnet.
RegisterEquipment submitted - tx: 0x54061d...
Waiting for transaction 0x54061d... to be mined...
Mined in block 10536889 - gas used: 187624
Equipment registered successfully — ID: 1 (use this ID for all subsequent commands)
```

The `register` command additionally parses the `EquipmentRegistered` event from the receipt and prints the assigned on-chain equipment ID. All subsequent commands (`shopinspect`, `certify`, `activate`, `loginspect`, `custody`, `initxfer`) take this ID as their first argument.

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
