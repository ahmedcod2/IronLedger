// main is the entry-point for the IronLedger command-line interface.
//
// Usage:
//
//	ironledger-cli register      <crn> <mdrHashHex> <mawp>
//	ironledger-cli shopinspect   <equipmentId>
//	ironledger-cli certify        <equipmentId> <aNumber>
//	ironledger-cli activate       <equipmentId>
//	ironledger-cli loginspect     <equipmentId> <pass|fail> <notesHashHex>
//	ironledger-cli custody        <equipmentId> <operatorAddress>
//	ironledger-cli initxfer       <equipmentId> <toAddress>
//	ironledger-cli completexfer   <equipmentId>
//	ironledger-cli cancelxfer     <equipmentId>
//	ironledger-cli status         <equipmentId>
//
// All wallet and network credentials are read from a .env file in the
// working directory (see .env.example for the required keys).
package main

import (
	"context"
	"encoding/hex"
	"fmt"
	"log"
	"math/big"
	"os"
	"strings"

	"github.com/ethereum/go-ethereum/accounts/abi/bind"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/core/types"
	"github.com/joho/godotenv"

	"github.com/ahmedcod2/IronLedger/internal/client"
	"github.com/ahmedcod2/IronLedger/pkg/contracts"
)

var statusLabels = []string{"Registered", "ShopInspected", "Certified", "Active"}

func main() {
	// -- 1. Load .env ---------------------------------------------------------
	if err := godotenv.Load(); err != nil {
		log.Fatalf("error: could not load .env file - %v\n"+
			"Create one from .env.example and re-run the command.", err)
	}

	rpcURL := mustEnv("SEPOLIA_RPC_URL")
	privateKey := mustEnv("PRIVATE_KEY")
	registryAddr := mustEnv("REGISTRY_CONTRACT_ADDRESS")
	inspectAddr := mustEnv("INSPECTION_CONTRACT_ADDRESS")
	transferAddr := mustEnv("TRANSFER_CONTRACT_ADDRESS")

	// -- 2. Guard: require a sub-command --------------------------------------
	if len(os.Args) < 2 {
		printUsage()
		os.Exit(1)
	}
	command := strings.ToLower(os.Args[1])

	// -- 3. Connect to Sepolia -------------------------------------------------
	sepoliaClient := client.NewSepoliaClient(rpcURL)
	if err := sepoliaClient.Connect(); err != nil {
		log.Fatalf("error: could not connect to Sepolia RPC: %v", err)
	}
	log.Println("Connected to Sepolia testnet.")

	// -- 4. Build the authenticated transaction signer -------------------------
	auth, err := sepoliaClient.GetAuthTransactor(privateKey)
	if err != nil {
		log.Fatalf("error: could not create transaction signer: %v", err)
	}

	// -- 5. Dispatch -----------------------------------------------------------
	switch command {

	// -- register --------------------------------------------------------------
	// Args: <crn> <mdrHashHex> <mawp>
	case "register":
		requireArgs(command, os.Args, 5)

		crn := os.Args[2]
		mdrHash := mustBytes32(os.Args[3])
		mawp := mustBigInt(os.Args[4])

		registry, err := contracts.NewEquipmentRegistry(
			common.HexToAddress(registryAddr), sepoliaClient.EthClient)
		if err != nil {
			log.Fatalf("error: could not bind EquipmentRegistry: %v", err)
		}

		tx, err := registry.RegisterEquipment(auth, crn, mdrHash, mawp)
		if err != nil {
			log.Fatalf("error: RegisterEquipment failed: %v", err)
		}
		log.Printf("RegisterEquipment submitted - tx: %s", tx.Hash().Hex())
		receipt := waitForReceipt(sepoliaClient, tx)
		equipmentId, err := contracts.EquipmentIdFromReceipt(receipt)
		if err != nil {
			log.Fatalf("error: could not parse equipment ID from receipt: %v", err)
		}
		log.Printf("Equipment registered successfully — ID: %s (use this ID for all subsequent commands)", equipmentId.String())

	// -- shopinspect -----------------------------------------------------------
	// Args: <equipmentId>
	case "shopinspect":
		requireArgs(command, os.Args, 3)

		id := mustBigInt(os.Args[2])

		registry, err := contracts.NewEquipmentRegistry(
			common.HexToAddress(registryAddr), sepoliaClient.EthClient)
		if err != nil {
			log.Fatalf("error: could not bind EquipmentRegistry: %v", err)
		}

		tx, err := registry.SignShopInspection(auth, id)
		if err != nil {
			log.Fatalf("error: SignShopInspection failed: %v", err)
		}
		log.Printf("SignShopInspection submitted - tx: %s", tx.Hash().Hex())
		waitForReceipt(sepoliaClient, tx)

	// -- certify ---------------------------------------------------------------
	// Args: <equipmentId> <aNumber>
	case "certify":
		requireArgs(command, os.Args, 4)

		id := mustBigInt(os.Args[2])
		aNumber := os.Args[3]

		registry, err := contracts.NewEquipmentRegistry(
			common.HexToAddress(registryAddr), sepoliaClient.EthClient)
		if err != nil {
			log.Fatalf("error: could not bind EquipmentRegistry: %v", err)
		}

		tx, err := registry.IssueCertificate(auth, id, aNumber)
		if err != nil {
			log.Fatalf("error: IssueCertificate failed: %v", err)
		}
		log.Printf("IssueCertificate submitted - tx: %s", tx.Hash().Hex())
		waitForReceipt(sepoliaClient, tx)

	// -- activate --------------------------------------------------------------
	// Args: <equipmentId>
	case "activate":
		requireArgs(command, os.Args, 3)

		id := mustBigInt(os.Args[2])

		registry, err := contracts.NewEquipmentRegistry(
			common.HexToAddress(registryAddr), sepoliaClient.EthClient)
		if err != nil {
			log.Fatalf("error: could not bind EquipmentRegistry: %v", err)
		}

		tx, err := registry.ActivateEquipment(auth, id)
		if err != nil {
			log.Fatalf("error: ActivateEquipment failed: %v", err)
		}
		log.Printf("ActivateEquipment submitted - tx: %s", tx.Hash().Hex())
		waitForReceipt(sepoliaClient, tx)

	// -- loginspect ------------------------------------------------------------
	// Args: <equipmentId> <pass|fail> <notesHashHex>
	case "loginspect":
		requireArgs(command, os.Args, 5)

		id := mustBigInt(os.Args[2])
		resultArg := strings.ToLower(os.Args[3])
		notesHash := mustBytes32(os.Args[4])

		var result uint8 // 0 = Pass, 1 = Fail
		if resultArg == "fail" {
			result = 1
		} else if resultArg != "pass" {
			log.Fatalf("error: result must be \"pass\" or \"fail\", got %q", os.Args[3])
		}

		inspLog, err := contracts.NewInspectionLog(
			common.HexToAddress(inspectAddr), sepoliaClient.EthClient)
		if err != nil {
			log.Fatalf("error: could not bind InspectionLog: %v", err)
		}

		tx, err := inspLog.LogInspection(auth, id, result, notesHash)
		if err != nil {
			log.Fatalf("error: LogInspection failed: %v", err)
		}
		log.Printf("LogInspection submitted - tx: %s", tx.Hash().Hex())
		waitForReceipt(sepoliaClient, tx)

	// -- custody ---------------------------------------------------------------
	// Args: <equipmentId> <operatorAddress>
	case "custody":
		requireArgs(command, os.Args, 4)

		id := mustBigInt(os.Args[2])
		operator := common.HexToAddress(os.Args[3])

		transfer, err := contracts.NewOwnershipTransfer(
			common.HexToAddress(transferAddr), sepoliaClient.EthClient)
		if err != nil {
			log.Fatalf("error: could not bind OwnershipTransfer: %v", err)
		}

		tx, err := transfer.AssignInitialCustody(auth, id, operator)
		if err != nil {
			log.Fatalf("error: AssignInitialCustody failed: %v", err)
		}
		log.Printf("AssignInitialCustody submitted - tx: %s", tx.Hash().Hex())
		waitForReceipt(sepoliaClient, tx)

	// -- initxfer --------------------------------------------------------------
	// Args: <equipmentId> <toAddress>
	case "initxfer":
		requireArgs(command, os.Args, 4)

		id := mustBigInt(os.Args[2])
		to := common.HexToAddress(os.Args[3])

		transfer, err := contracts.NewOwnershipTransfer(
			common.HexToAddress(transferAddr), sepoliaClient.EthClient)
		if err != nil {
			log.Fatalf("error: could not bind OwnershipTransfer: %v", err)
		}

		tx, err := transfer.InitiateTransfer(auth, id, to)
		if err != nil {
			log.Fatalf("error: InitiateTransfer failed: %v", err)
		}
		log.Printf("InitiateTransfer submitted - tx: %s", tx.Hash().Hex())
		waitForReceipt(sepoliaClient, tx)

	// -- completexfer ----------------------------------------------------------
	// Args: <equipmentId>
	case "completexfer":
		requireArgs(command, os.Args, 3)

		id := mustBigInt(os.Args[2])

		transfer, err := contracts.NewOwnershipTransfer(
			common.HexToAddress(transferAddr), sepoliaClient.EthClient)
		if err != nil {
			log.Fatalf("error: could not bind OwnershipTransfer: %v", err)
		}

		tx, err := transfer.CompleteTransfer(auth, id)
		if err != nil {
			log.Fatalf("error: CompleteTransfer failed: %v", err)
		}
		log.Printf("CompleteTransfer submitted - tx: %s", tx.Hash().Hex())
		waitForReceipt(sepoliaClient, tx)

	// -- cancelxfer ------------------------------------------------------------
	// Args: <equipmentId>
	case "cancelxfer":
		requireArgs(command, os.Args, 3)

		id := mustBigInt(os.Args[2])

		transfer, err := contracts.NewOwnershipTransfer(
			common.HexToAddress(transferAddr), sepoliaClient.EthClient)
		if err != nil {
			log.Fatalf("error: could not bind OwnershipTransfer: %v", err)
		}

		tx, err := transfer.CancelTransfer(auth, id)
		if err != nil {
			log.Fatalf("error: CancelTransfer failed: %v", err)
		}
		log.Printf("CancelTransfer submitted - tx: %s", tx.Hash().Hex())
		waitForReceipt(sepoliaClient, tx)

	// -- status ----------------------------------------------------------------
	// Args: <equipmentId>
	case "status":
		requireArgs(command, os.Args, 3)

		id := mustBigInt(os.Args[2])

		registry, err := contracts.NewEquipmentRegistry(
			common.HexToAddress(registryAddr), sepoliaClient.EthClient)
		if err != nil {
			log.Fatalf("error: could not bind EquipmentRegistry: %v", err)
		}
		transfer, err := contracts.NewOwnershipTransfer(
			common.HexToAddress(transferAddr), sepoliaClient.EthClient)
		if err != nil {
			log.Fatalf("error: could not bind OwnershipTransfer: %v", err)
		}

		callOpts := &bind.CallOpts{Context: context.Background()}

		eq, err := registry.GetEquipment(callOpts, id)
		if err != nil {
			log.Fatalf("error: GetEquipment call failed: %v", err)
		}

		statusStr := "Unknown"
		if int(eq.Status) < len(statusLabels) {
			statusStr = statusLabels[eq.Status]
		}

		owner, err := transfer.GetCurrentOwner(callOpts, id)
		if err != nil {
			log.Fatalf("error: GetCurrentOwner call failed: %v", err)
		}
		pending, err := transfer.GetPendingTransfer(callOpts, id)
		if err != nil {
			log.Fatalf("error: GetPendingTransfer call failed: %v", err)
		}

		fmt.Printf("\n-- IronLedger Equipment Status ---------------------\n")
		fmt.Printf("  Equipment ID       : %s\n", eq.EquipmentId.String())
		fmt.Printf("  CRN                : %s\n", eq.Crn)
		fmt.Printf("  A-Number           : %s\n", eq.ANumber)
		fmt.Printf("  MDR Hash           : 0x%x\n", eq.MdrHash)
		fmt.Printf("  MAWP               : %s\n", eq.Mawp.String())
		fmt.Printf("  Status             : %s\n", statusStr)
		fmt.Printf("  Registered At      : %s\n", eq.RegisteredAt.String())
		fmt.Printf("  Shop Inspected At  : %s\n", eq.ShopInspectedAt.String())
		fmt.Printf("  Certificate Issued : %s\n", eq.CertificateIssuedAt.String())
		fmt.Printf("  Current Owner      : %s\n", owner.Hex())
		fmt.Printf("  Pending Transfer To: %s\n", pending.Hex())
		fmt.Printf("----------------------------------------------------\n\n")

	default:
		fmt.Fprintf(os.Stderr, "unknown command: %q\n\n", command)
		printUsage()
		os.Exit(1)
	}
}

// -- helpers -------------------------------------------------------------------

func mustEnv(key string) string {
	v := os.Getenv(key)
	if v == "" {
		log.Fatalf("error: required environment variable %q is not set.\n"+
			"Check your .env file.", key)
	}
	return v
}

func requireArgs(cmd string, args []string, required int) {
	if len(args) < required {
		fmt.Fprintf(os.Stderr, "error: %q requires %d argument(s), got %d.\n\n",
			cmd, required-2, len(args)-2)
		printUsage()
		os.Exit(1)
	}
}

// mustBigInt parses a decimal uint256 string and terminates on failure.
func mustBigInt(s string) *big.Int {
	n, ok := new(big.Int).SetString(s, 10)
	if !ok {
		log.Fatalf("error: expected a decimal integer, got %q", s)
	}
	return n
}

// mustBytes32 decodes a 0x-prefixed or bare 64-char hex string into [32]byte.
func mustBytes32(s string) [32]byte {
	s = strings.TrimPrefix(s, "0x")
	b, err := hex.DecodeString(s)
	if err != nil || len(b) != 32 {
		log.Fatalf("error: expected a 32-byte hex string (64 hex chars), got %q", s)
	}
	var out [32]byte
	copy(out[:], b)
	return out
}

// waitForReceipt blocks until tx is mined, prints the result, and returns the receipt.
func waitForReceipt(c *client.SepoliaClient, tx *types.Transaction) *types.Receipt {
	log.Printf("Waiting for transaction %s to be mined...", tx.Hash().Hex())
	receipt, err := bind.WaitMined(context.Background(), c.EthClient, tx)
	if err != nil {
		log.Fatalf("error: waiting for receipt failed: %v", err)
	}
	if receipt.Status == types.ReceiptStatusFailed {
		log.Fatalf("error: transaction reverted (block %d)", receipt.BlockNumber.Uint64())
	}
	log.Printf("Mined in block %d - gas used: %d", receipt.BlockNumber.Uint64(), receipt.GasUsed)
	return receipt
}

func printUsage() {
	fmt.Print(`IronLedger CLI - blockchain-based pressure equipment provenance

Usage:
  ironledger-cli <command> [arguments]

Commands:
  register    <crn> <mdrHashHex> <mawp>
                Register new equipment on-chain. Returns uint256 equipmentId.

  shopinspect <equipmentId>
                SCO sign-off on shop inspection.

  certify     <equipmentId> <aNumber>
                ABSA issue certificate and set A-Number.

  activate    <equipmentId>
                Activate certified equipment for field use.

  loginspect  <equipmentId> <pass|fail> <notesHashHex>
                Log an inspection outcome.

  custody     <equipmentId> <operatorAddress>
                Assign initial custody (ABSA only).

  initxfer    <equipmentId> <toAddress>
                Initiate a two-step custody transfer.

  completexfer <equipmentId>
                Current custodian confirms off-chain handover is complete.

  cancelxfer  <equipmentId>
                Cancel a pending transfer.

  status      <equipmentId>
                Read and print the on-chain record (free call).

Environment (set in .env):
  SEPOLIA_RPC_URL              Alchemy or Infura HTTPS/WSS endpoint
  PRIVATE_KEY                  Hex-encoded private key (no 0x prefix)
  REGISTRY_CONTRACT_ADDRESS    Deployed EquipmentRegistry address
  INSPECTION_CONTRACT_ADDRESS  Deployed InspectionLog     address
  TRANSFER_CONTRACT_ADDRESS    Deployed OwnershipTransfer address
`)
}
