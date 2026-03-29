# IronLedger

IronLedger is a blockchain-based pressure equipment lifecycle and provenance system for the Alberta oil and gas sector. It anchors equipment registration, inspection history, compliance status, and custody transfer events to an immutable Ethereum ledger, making the full lifecycle of any regulated pressure asset auditable by ABSA, Safety Codes Officers, Operators, and Auditors at any time.

**Course:** CSE 540 — Team 4, Spring B 2026  
**Network:** Ethereum Sepolia Testnet (Chain ID 11155111)  
**Stack:** Solidity 0.8.24 · Hardhat · Go 1.24 · go-ethereum v1.17.1

---

## Deployed Contracts (Sepolia)

Contract addresses are set in your `.env` file after running the deploy script.
See `.env.example` for the required variable names and `scripts/deploy.js` for deployment instructions.

---

## Architecture

```
Off-Chain                          On-Chain (Sepolia)
─────────────────                  ──────────────────────────────────────
Manufacturer  ──── register ──────► EquipmentRegistry.sol
SCO           ──── inspect  ──────► InspectionLog.sol
ABSA          ──── certify  ──────► EquipmentRegistry.sol
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

## Repository Structure

```text
IronLedger/
├── cmd/ironledger-cli/main.go        ← CLI entry point (4 commands)
├── internal/client/sepolia.go        ← Ethereum RPC client + EIP-155 tx signer
├── pkg/contracts/
│   ├── equipment_registry.go         ← Go ABI binding for EquipmentRegistry
│   ├── inspection_log.go             ← Go ABI binding for InspectionLog
│   └── ownership_transfer.go         ← Go ABI binding for OwnershipTransfer
├── contracts/
│   ├── EquipmentRegistry.sol
│   ├── InspectionLog.sol
│   ├── OwnershipTransfer.sol
│   └── interfaces/
│       ├── IEquipmentRegistry.sol
│       ├── IInspectionLog.sol
│       ├── IOwnershipTransfer.sol
├── scripts/deploy.js                 ← Hardhat deployment (all 3 contracts)
├── docs/
│   ├── architecture.md
│   └── IronLedger_Architecture_Diagram.html
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

---

## Setup

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
# Edit .env and fill in:
#   SEPOLIA_RPC_URL   — Alchemy or Infura HTTPS endpoint
#   PRIVATE_KEY       — 64-char hex private key (no 0x prefix)
#   (contract addresses are already filled in above)
```

### 3. Build the CLI

```bash
go build -o bin/ironledger-cli.exe ./cmd/ironledger-cli/...
```

---

## CLI Usage

```
ironledger-cli <command> [arguments]

Commands:
  register  <assetId> <crn> <aNumber> <mdrHash> <operatorAddress>
  inspect   <assetId> <unixTimestamp> <passed: true|false> <notes>
  transfer  <assetId> <newOperatorAddress>
  status    <assetId>
```

### Example — full lifecycle

```powershell
# Register a new pressure vessel
.\bin\ironledger-cli.exe register VESSEL-001 CRN-2024-99 A-4521 0xabc...def 0xYourAddress

# Log a passing inspection (Unix timestamp)
.\bin\ironledger-cli.exe inspect VESSEL-001 1743033600 true "Shop inspection passed."

# Query on-chain record (free — no gas)
.\bin\ironledger-cli.exe status VESSEL-001

# Transfer custody (reverts if certificateIssued or compliant is false)
.\bin\ironledger-cli.exe transfer VESSEL-001 0xNewOperatorAddress
```

---

## Re-deploying Contracts

```bash
npx hardhat run scripts/deploy.js --network sepolia
# Copy the printed addresses into .env
```

## Regenerating Go Bindings (after contract changes)

```bash
make bindings   # requires solc 0.8.24 and abigen on PATH
make build
```

---

## Roles in the System

| Role | Permitted actions |
|---|---|
| Manufacturer | `register` — submit equipment design and MDR hash |
| Safety Codes Officer (SCO) | `inspect` — sign shop and in-service inspections |
| ABSA | `certify` — issue Certificate of Inspection |
| Operator | `transfer` — initiate custody transfer |
| Acquiring Operator / Auditor | `status` — read-only provenance query |
