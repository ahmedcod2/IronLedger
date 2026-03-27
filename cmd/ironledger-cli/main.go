// main is the entry-point for the IronLedger command-line interface.
//
// Usage:
//
//	ironledger-cli register  <assetId> <crn> <aNumber> <mdrHash> <operatorAddress>
//	ironledger-cli inspect   <assetId> <unixDate> <passed: true|false> <notes>
//	ironledger-cli transfer  <assetId> <newOperatorAddress>
//	ironledger-cli status    <assetId>
//
// All wallet and network credentials are read from a .env file in the
// working directory (see .env.example for the required keys).
package main

import (
	"context"
	"fmt"
	"log"
	"math/big"
	"os"
	"strconv"
	"strings"

	"github.com/ethereum/go-ethereum/accounts/abi/bind"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/core/types"
	"github.com/joho/godotenv"

	"github.com/ahmedcod2/IronLedger/internal/client"
	"github.com/ahmedcod2/IronLedger/pkg/contracts"
)

func main() {
	// ── 1. Load .env ─────────────────────────────────────────────────────────
	// godotenv reads a .env file from the current working directory and injects
	// the key=value pairs into the process environment.  It is safe to call
	// even when actual environment variables have already been set (e.g. in CI).
	if err := godotenv.Load(); err != nil {
		log.Fatalf("error: could not load .env file — %v\n"+
			"Create one from .env.example and re-run the command.", err)
	}

	rpcURL      := mustEnv("SEPOLIA_RPC_URL")
	privateKey  := mustEnv("PRIVATE_KEY")
	registryAddr := mustEnv("REGISTRY_CONTRACT_ADDRESS")
	inspectAddr  := mustEnv("INSPECTION_CONTRACT_ADDRESS")
	transferAddr := mustEnv("TRANSFER_CONTRACT_ADDRESS")

	// ── 2. Guard: require a sub-command ──────────────────────────────────────
	if len(os.Args) < 2 {
		printUsage()
		os.Exit(1)
	}
	command := strings.ToLower(os.Args[1])

	// ── 3. Connect to Sepolia ─────────────────────────────────────────────────
	sepoliaClient := client.NewSepoliaClient(rpcURL)
	if err := sepoliaClient.Connect(); err != nil {
		log.Fatalf("error: could not connect to Sepolia RPC: %v", err)
	}
	log.Println("Connected to Sepolia testnet.")

	// ── 4. Build the authenticated transaction signer ─────────────────────────
	// GetAuthTransactor fetches the on-chain nonce, chain ID, and gas price so
	// every transaction is properly signed and replay-protected.
	auth, err := sepoliaClient.GetAuthTransactor(privateKey)
	if err != nil {
		log.Fatalf("error: could not create transaction signer: %v", err)
	}

	// ── 5. Dispatch to the correct contract method ────────────────────────────
	switch command {

	// ── register ─────────────────────────────────────────────────────────────
	// Writes a new equipment asset record to EquipmentRegistry.sol.
	// Args: <assetId> <crn> <aNumber> <mdrHash> <operatorAddress>
	case "register":
		requireArgs(command, os.Args, 7)

		assetId   := os.Args[2]
		crn       := os.Args[3]
		aNumber   := os.Args[4]
		mdrHash   := os.Args[5]
		operator  := common.HexToAddress(os.Args[6])

		// Instantiate the Go binding that wraps the deployed EquipmentRegistry contract.
		registry, err := contracts.NewEquipmentRegistry(
			common.HexToAddress(registryAddr),
			sepoliaClient.EthClient,
		)
		if err != nil {
			log.Fatalf("error: could not bind EquipmentRegistry contract: %v", err)
		}

		// Send the RegisterEquipment transaction.  auth carries the private-key
		// signature; the node will broadcast it to the mempool.
		tx, err := registry.RegisterEquipment(auth, assetId, crn, aNumber, mdrHash, operator)
		if err != nil {
			log.Fatalf("error: RegisterEquipment transaction failed: %v", err)
		}
		log.Printf("RegisterEquipment submitted — tx hash: %s", tx.Hash().Hex())

		// Block until the transaction is included in a mined block.
		waitForReceipt(sepoliaClient, tx)

	// ── inspect ───────────────────────────────────────────────────────────────
	// Appends an inspection record to InspectionLog.sol.
	// Args: <assetId> <unixTimestamp> <passed: true|false> <notes>
	case "inspect":
		requireArgs(command, os.Args, 6)

		assetId      := os.Args[2]
		unixDateStr  := os.Args[3]
		passedStr    := strings.ToLower(os.Args[4])
		notes        := os.Args[5]

		unixDate, err := strconv.ParseInt(unixDateStr, 10, 64)
		if err != nil {
			log.Fatalf("error: <unixDate> must be a Unix timestamp integer, got %q", unixDateStr)
		}
		passed := passedStr == "true" || passedStr == "pass" || passedStr == "1"

		// Instantiate the InspectionLog binding.
		inspLog, err := contracts.NewInspectionLog(
			common.HexToAddress(inspectAddr),
			sepoliaClient.EthClient,
		)
		if err != nil {
			log.Fatalf("error: could not bind InspectionLog contract: %v", err)
		}

		tx, err := inspLog.LogInspection(auth, assetId, big.NewInt(unixDate), passed, notes)
		if err != nil {
			log.Fatalf("error: LogInspection transaction failed: %v", err)
		}
		log.Printf("LogInspection submitted — tx hash: %s", tx.Hash().Hex())
		waitForReceipt(sepoliaClient, tx)

	// ── transfer ──────────────────────────────────────────────────────────────
	// Transfers custody of an asset via OwnershipTransfer.sol.
	// Args: <assetId> <newOperatorAddress>
	case "transfer":
		requireArgs(command, os.Args, 4)

		assetId      := os.Args[2]
		newOperator  := common.HexToAddress(os.Args[3])

		// Instantiate the OwnershipTransfer binding.
		transfer, err := contracts.NewOwnershipTransfer(
			common.HexToAddress(transferAddr),
			sepoliaClient.EthClient,
		)
		if err != nil {
			log.Fatalf("error: could not bind OwnershipTransfer contract: %v", err)
		}

		// Optionally check eligibility before sending the transaction so we
		// can give a clear error without wasting gas.
		callOpts := &bind.CallOpts{Context: context.Background()}
		eligible, err := transfer.CanTransfer(callOpts, assetId)
		if err != nil {
			log.Fatalf("error: CanTransfer query failed: %v", err)
		}
		if !eligible {
			log.Fatalf("error: asset %q is not eligible for transfer "+
				"(certificate not issued or compliance flag is false)", assetId)
		}

		tx, err := transfer.TransferOwnership(auth, assetId, newOperator)
		if err != nil {
			log.Fatalf("error: TransferOwnership transaction failed: %v", err)
		}
		log.Printf("TransferOwnership submitted — tx hash: %s", tx.Hash().Hex())
		waitForReceipt(sepoliaClient, tx)

	// ── status ────────────────────────────────────────────────────────────────
	// Read-only query: prints the on-chain record for an asset.
	// Args: <assetId>
	case "status":
		requireArgs(command, os.Args, 3)

		assetId := os.Args[2]

		registry, err := contracts.NewEquipmentRegistry(
			common.HexToAddress(registryAddr),
			sepoliaClient.EthClient,
		)
		if err != nil {
			log.Fatalf("error: could not bind EquipmentRegistry contract: %v", err)
		}

		// CallOpts with no From address indicates a read-only eth_call — free, no gas.
		callOpts := &bind.CallOpts{Context: context.Background()}
		equipment, err := registry.GetEquipment(callOpts, assetId)
		if err != nil {
			log.Fatalf("error: GetEquipment call failed: %v", err)
		}

		if !equipment.Exists {
			fmt.Printf("Asset %q not found on-chain.\n", assetId)
			return
		}

		fmt.Printf("\n── IronLedger Asset Status ─────────────────────────\n")
		fmt.Printf("  Asset ID          : %s\n", equipment.AssetId)
		fmt.Printf("  CRN               : %s\n", equipment.Crn)
		fmt.Printf("  A-Number          : %s\n", equipment.ANumber)
		fmt.Printf("  MDR Hash          : %s\n", equipment.MdrHash)
		fmt.Printf("  Current Operator  : %s\n", equipment.CurrentOperator.Hex())
		fmt.Printf("  Certificate Issued: %v\n", equipment.CertificateIssued)
		fmt.Printf("  Compliant         : %v\n", equipment.Compliant)
		fmt.Printf("────────────────────────────────────────────────────\n\n")

	default:
		fmt.Fprintf(os.Stderr, "unknown command: %q\n\n", command)
		printUsage()
		os.Exit(1)
	}
}

// ── helpers ───────────────────────────────────────────────────────────────────

// mustEnv reads an environment variable and terminates the process with a
// descriptive error if the variable is empty or not set.
func mustEnv(key string) string {
	v := os.Getenv(key)
	if v == "" {
		log.Fatalf("error: required environment variable %q is not set.\n"+
			"Check your .env file.", key)
	}
	return v
}

// requireArgs asserts that len(args) >= required, printing usage and exiting if not.
func requireArgs(cmd string, args []string, required int) {
	if len(args) < required {
		fmt.Fprintf(os.Stderr, "error: %q requires %d argument(s), got %d.\n\n",
			cmd, required-2, len(args)-2)
		printUsage()
		os.Exit(1)
	}
}

// waitForReceipt blocks until tx is included in a mined block or the context
// is cancelled.  It prints the block number and gas consumed on success and
// terminates the process with a descriptive message if the tx reverts.
func waitForReceipt(c *client.SepoliaClient, tx *types.Transaction) {
	log.Printf("Waiting for transaction %s to be mined…", tx.Hash().Hex())

	// bind.WaitMined polls eth_getTransactionReceipt until the node returns a
	// non-nil receipt, meaning the transaction has been included in a block.
	receipt, err := bind.WaitMined(context.Background(), c.EthClient, tx)
	if err != nil {
		log.Fatalf("error waiting for receipt: %v", err)
	}

	// Status 1 == success; 0 == reverted on-chain.
	if receipt.Status == 0 {
		log.Fatalf("error: transaction %s was reverted on-chain. "+
			"Check contract logic and gas limit.", tx.Hash().Hex())
	}

	log.Printf("Transaction mined successfully in block %d (gas used: %d).",
		receipt.BlockNumber.Uint64(), receipt.GasUsed)
}

func printUsage() {
	fmt.Print(`IronLedger CLI — blockchain-based pressure equipment provenance

Usage:
  ironledger-cli <command> [arguments]

Commands:
  register  <assetId> <crn> <aNumber> <mdrHash> <operatorAddress>
              Register a new piece of pressure equipment on-chain.

  inspect   <assetId> <unixTimestamp> <passed: true|false> <notes>
              Log an inspection outcome for an asset.

  transfer  <assetId> <newOperatorAddress>
              Transfer custody to a new operator (must be eligible).

  status    <assetId>
              Read and print the on-chain record for an asset (free call).

Environment (set in .env):
  SEPOLIA_RPC_URL              Alchemy or Infura HTTPS/WSS endpoint
  PRIVATE_KEY                  Hex-encoded private key (no 0x prefix)
  REGISTRY_CONTRACT_ADDRESS    Deployed EquipmentRegistry  address
  INSPECTION_CONTRACT_ADDRESS  Deployed InspectionLog      address
  TRANSFER_CONTRACT_ADDRESS    Deployed OwnershipTransfer  address
`)
}

