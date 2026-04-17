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
├── ui/
│   ├── index.html                            <- Web UI (serve via npx serve ui)
│   ├── app.js                                <- UI application logic
│   └── style.css                             <- Stylesheet for the Web UI
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
| Go | 1.24+ | https://go.dev/dl/ |
| Node.js | 22 LTS | https://nodejs.org |
| Git | any | https://git-scm.com |
| MetaMask | latest | https://metamask.io/download/ (browser extension — required for the Web UI) |

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
- `PRIVATE_KEY` — 64-char hex private key (with or without `0x` prefix — the Hardhat config normalises automatically)

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

## Running the Web UI

The web interface is a self-contained HTML file at `ui/index.html`. It uses **ethers.js 5.7.2** loaded directly from CDN — no build step is required for the UI itself.

> **Important:** MetaMask does **not** work when opening the file directly via `file://` in your browser. You must serve the UI over HTTP. The easiest way is with `npx serve`, which downloads and runs a local HTTP server on the fly — no extra installation is needed beyond `npm install`.

### Requirements

| Requirement | Details |
|---|---|
| Node.js 22 LTS | Required to run the local HTTP server (`npx serve`) |
| npm packages | Run `npm install` in the project root — installs `serve` and all Hardhat deps |
| MetaMask | [Install the browser extension](https://metamask.io/download/) (Chrome, Firefox, Brave, or Edge) |
| Sepolia test ETH | Your wallet must have Sepolia ETH to pay gas. Get free test ETH from a faucet (see below) |
| Deployed contract addresses | From running `scripts/deploy.js` — see the **Deploy** section above |

### Step 1 — Install dependencies

If you have not done so already:

```powershell
npm install
```

This installs Hardhat and all project dependencies. The `npx serve` command used below downloads and runs the `serve` HTTP server automatically — no separate install step is needed.

### Step 2 — Start the local HTTP server

From the project root, run:

```powershell
npx serve ui
```

You should see output like:

```
   ┌──────────────────────────────────────────────────┐
   │                                                  │
   │   Serving!                                       │
   │                                                  │
   │   - Local:    http://localhost:3000              │
   │   - Network:  http://192.168.x.x:3000            │
   │                                                  │
   └──────────────────────────────────────────────────┘
```

Leave this terminal window open while you use the UI.

### Step 3 — Open the UI in your browser

Navigate to:

```
http://localhost:3000
```

> Do **not** open `ui/index.html` directly via `file://` — MetaMask will not inject into `file://` pages and the wallet connection will fail.

### Step 4 — Set up MetaMask

1. Install the [MetaMask browser extension](https://metamask.io/download/) if you have not already.
2. Create or import a wallet. Keep your seed phrase secure.
3. Switch MetaMask to the **Sepolia** testnet:
   - Click the network selector at the top of MetaMask
   - Enable "Show test networks" in Settings → Advanced if Sepolia is not listed
   - Select **Sepolia**
4. Fund your wallet with Sepolia test ETH (free — see faucets below).

### Step 5 — Get Sepolia test ETH (free)

You need a small amount of Sepolia ETH to pay gas for write transactions. Use any of these faucets:

| Faucet | URL | Notes |
|---|---|---|
| Alchemy Sepolia Faucet | https://sepoliafaucet.com | Requires free Alchemy account; gives 0.5 ETH/day |
| Chainlink Faucet | https://faucets.chain.link/sepolia | No account required for small amounts |
| Google Faucet | Search "Sepolia faucet" in Google | Built-in result powered by Alchemy |
| Infura Faucet | https://www.infura.io/faucet/sepolia | Requires free Infura account |

Paste your MetaMask wallet address into the faucet and request ETH. The funds arrive within 15–60 seconds.

> Read-only operations (Dashboard, Equipment Detail, status checks) are free `eth_call`s — they require no ETH and do not need MetaMask at all.

### Step 6 — Connect your wallet

Click **Connect Wallet** in the top-right corner of the UI. MetaMask will prompt you to approve the connection. Once connected, your wallet address and ETH balance appear in the header. If you are on the wrong network, a red "Wrong Network" badge appears — click it and switch MetaMask to Sepolia.

### Step 7 — Configure contract addresses

Click the **⚙ Settings** button in the top-right corner and enter the three deployed contract addresses:

| Field | Value |
|---|---|
| EquipmentRegistry Address | `0xBEcfeF2471a6e1BeDbD5B6dE8c3ef8626Da2e27c` |
| InspectionLog Address | `0xFaC9EECA2b0d4823581e36A2953B7990ABcae5B5` |
| OwnershipTransfer Address | `0x82544563e6dccA61aC59Bba0C7258A816B0F9708` |

Click **Save & Connect**. The addresses are saved to your browser's `localStorage` — you only need to do this once per browser.

> If you have re-deployed the contracts yourself, use the addresses printed by `scripts/deploy.js` instead.

### Step 8 — Use the UI

Once connected, the role banner on each screen shows which roles your connected wallet holds. Available screens:

| Tab | Role required | What it does |
|---|---|---|
| Dashboard | None (read-only) | Lists all registered equipment with status and compliance badges |
| Register Equipment | `MANUFACTURER_ROLE` | Submits `registerEquipment(crn, mdrHash, mawp)` — MDR text is keccak256-hashed in-browser |
| Inspection Log | `SCO_ROLE` | Submits `logInspection` and runs compliance checks |
| Certificate | `ABSA_ROLE` | Signs shop inspection, issues certificate, and activates equipment |
| Ownership Transfer | `OPERATOR_ROLE` / custodian | Initiates, completes, or cancels custody transfers; ABSA assigns initial custody |
| Equipment Detail | None (read-only) | Full lifecycle timeline for a given equipment ID |
| Admin / Roles | `DEFAULT_ADMIN_ROLE` | Grants and revokes roles on all three contracts |

Write operations require MetaMask to sign and broadcast a transaction to Sepolia. Each call waits for the transaction to be mined (typically 12–30 seconds) before updating the UI.

---

## Independent User Setup (no contract deployment required)

If you want to interact with the already-deployed contracts on Sepolia without running any scripts yourself, you only need:

1. **Node.js 22 LTS** — to run the local HTTP server
2. **MetaMask** — browser extension with a Sepolia wallet
3. **Sepolia test ETH** — from any faucet listed above
4. A role granted to your wallet by the contract admin

### Steps for independent users

```powershell
# 1. Clone the repository
git clone https://github.com/ahmedcod2/IronLedger.git
cd IronLedger

# 2. Install dependencies
npm install

# 3. Start the UI server
npx serve ui
```

Then open `http://localhost:3000` in your browser, connect MetaMask (on Sepolia), and enter the contract addresses from the table in Step 7 above.

**Requesting a role:** Write operations are role-gated. Ask the contract admin (`DEFAULT_ADMIN_ROLE` holder) to run the following to grant you a role:

```powershell
# Admin runs this — replace address and role as needed
$env:GRANT_TO="0xYourWalletAddress"
npx hardhat run scripts/grant-roles.js --network sepolia
```

Or, if the admin has their own tooling, they can call `grantRole(roleBytes32, yourAddress)` on each contract directly. Role byte values:

| Role name | keccak256 value |
|---|---|
| `MANUFACTURER_ROLE` | `keccak256("MANUFACTURER_ROLE")` |
| `SCO_ROLE` | `keccak256("SCO_ROLE")` |
| `ABSA_ROLE` | `keccak256("ABSA_ROLE")` |
| `OPERATOR_ROLE` | `keccak256("OPERATOR_ROLE")` |

Once your role is granted, refresh the UI — the role banner on each tab will update automatically when you connect your wallet.

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

---

## Web UI Features

The browser-based UI (`ui/`) is a single-page application that communicates directly with MetaMask and the deployed Sepolia contracts. Key features:

| Feature | Description |
|---|---|
| **Dashboard** | Paginated equipment table with sortable columns, status/compliance filters, CSV export, and a recent on-chain activity feed |
| **Full-Text Search** | Search by Equipment ID, CRN, A-Number, or manufacturer address from the dashboard search bar |
| **Equipment Detail** | Full lifecycle timeline built from on-chain events across all three contracts |
| **Dark Mode** | Toggle between light and dark themes via the 🌙 button in the sidebar; respects OS preference by default |
| **Responsive Layout** | Hamburger menu, collapsible sidebar, and mobile-optimised forms for smaller screens |
| **Role-Aware Navigation** | Lock icons appear on tabs the connected wallet cannot access; role banner updates on each screen |
| **Form Persistence** | Registration and inspection form inputs are saved to `sessionStorage` so data is not lost on tab switch |
| **Print Certificate** | Generates a print-ready Certificate of Inspection styled for regulatory use |
| **My Transfers** | Shows all custody transfers involving the connected wallet across all equipment |
| **Silent Auto-Reconnect** | If MetaMask already has permission, the wallet reconnects automatically on page load without prompting |