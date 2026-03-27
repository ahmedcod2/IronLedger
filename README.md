# IronLedger

IronLedger is a blockchain-based pressure equipment lifecycle and compliance tracking system for oil and gas assets. It records equipment registration, inspection history, compliance status, and custody transfer events on Ethereum Sepolia.

## Why Golang is in this repo
CSE 540 expects projects to use **Golang and Solidity**. For this Smart Contract Design Draft, the core grading focus is the smart contract structure, interfaces, README, and code comments. This repository therefore includes:
- **Solidity** draft contracts and interfaces for the on-chain design
- a lightweight **Golang** CLI scaffold for future off-chain interaction and workflow simulation

## Project Scope for this Draft
This draft demonstrates the initial contract design for:
- `EquipmentRegistry.sol`
- `InspectionLog.sol`
- `OwnershipTransfer.sol`

It also includes a small Go CLI scaffold that can later be extended to call deployed contracts, simulate stakeholders, or drive demos.

## Proposed Repository Structure
```text
IronLedger/
├── README.md
├── package.json
├── hardhat.config.js
├── go.mod
├── contracts/
│   ├── EquipmentRegistry.sol
│   ├── InspectionLog.sol
│   ├── OwnershipTransfer.sol
│   └── interfaces/
│       ├── IEquipmentRegistry.sol
│       ├── IInspectionLog.sol
│       └── IOwnershipTransfer.sol
├── cmd/
│   └── ironledger-cli/
│       └── main.go
├── internal/
│   └── client/
│       └── sepolia.go
├── scripts/
│   └── deploy.js
├── test/
│   └── placeholder.test.js
└── docs/
    └── architecture.md
```

## Dependencies
### Solidity / Hardhat
- Node.js 18+
- npm
- Hardhat
- Ethers.js

### Golang
- Go 1.22+

## Setup
### Solidity setup
```bash
npm install
npx hardhat compile
```

### Go setup
```bash
go mod tidy
go run ./cmd/ironledger-cli
```

## Basic Usage / Deployment
This repository is currently a **design draft**, not a full implementation.
- Compile contracts with Hardhat
- Review interfaces and function signatures in `contracts/`
- Use the Go CLI scaffold as a starting point for future off-chain workflow simulation
- A later milestone can connect the Go client to Sepolia RPC and deployed contract addresses

## Intended Roles in the System
- Manufacturer / ABSA: register equipment and certificates
- Safety Codes Officer: log inspections and update compliance state
- Operator / Acquiring Operator: request or receive custody transfer
- Auditor: read lifecycle history

## Notes
- The contracts are intentionally light on full business logic because this milestone emphasizes structure and organization.
- The Go code is intentionally minimal and serves as a scaffold to show alignment with the course expectation that projects use both Golang and Solidity.
