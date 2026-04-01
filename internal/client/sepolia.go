// Package client provides the Ethereum network client for IronLedger.
// It wraps go-ethereum's ethclient to manage RPC connections and transaction signing
// specifically for the Sepolia testnet.
package client

import (
	"context"
	"crypto/ecdsa"
	"errors"
	"fmt"
	"math/big"

	"github.com/ethereum/go-ethereum/accounts/abi/bind"
	"github.com/ethereum/go-ethereum/crypto"
	"github.com/ethereum/go-ethereum/ethclient"
)

// SepoliaClient wraps an active go-ethereum RPC connection together with
// the address of the primary contract the CLI will interact with.
type SepoliaClient struct {
	RPCURL    string            // Alchemy / Infura WebSocket or HTTPS endpoint
	EthClient *ethclient.Client // Live connection; nil until Connect() succeeds
}

// NewSepoliaClient constructs a SepoliaClient that is ready to connect.
// Call Connect() to open the underlying RPC transport.
func NewSepoliaClient(rpcURL string) *SepoliaClient {
	return &SepoliaClient{RPCURL: rpcURL}
}

// Connect dials the Sepolia RPC endpoint and stores the live client.
// Returns an error if the endpoint is unreachable or the URL is malformed.
func (s *SepoliaClient) Connect() error {
	client, err := ethclient.Dial(s.RPCURL)
	if err != nil {
		return fmt.Errorf("sepolia: failed to dial RPC endpoint %q: %w", s.RPCURL, err)
	}
	s.EthClient = client
	return nil
}

// GetAuthTransactor builds a *bind.TransactOpts that is fully configured for
// signing and broadcasting a transaction on Sepolia.
//
// It performs four network round-trips:
//  1. Retrieves the chain ID (must be 11155111 for Sepolia).
//  2. Derives the sender address from the raw private key.
//  3. Fetches the current pending nonce for that address.
//  4. Requests the network's suggested gas price (legacy pricing).
//
// The returned TransactOpts can be passed directly to any abigen-generated
// contract transactor method (e.g. registry.RegisterEquipment(auth, ...)).
func (s *SepoliaClient) GetAuthTransactor(privateKeyHex string) (*bind.TransactOpts, error) {
	if s.EthClient == nil {
		return nil, errors.New("sepolia: client is not connected; call Connect() first")
	}

	// ── Step 1: Parse the raw hex private key into an ECDSA key object ──────
	// crypto.HexToECDSA strips a leading "0x" if present.
	privateKey, err := crypto.HexToECDSA(privateKeyHex)
	if err != nil {
		return nil, fmt.Errorf("sepolia: invalid private key: %w", err)
	}

	// ── Step 2: Derive the Ethereum address that owns this key ───────────────
	publicKey := privateKey.Public()
	publicKeyECDSA, ok := publicKey.(*ecdsa.PublicKey)
	if !ok {
		return nil, errors.New("sepolia: could not cast public key to ECDSA")
	}
	fromAddress := crypto.PubkeyToAddress(*publicKeyECDSA)

	ctx := context.Background()

	// ── Step 3: Retrieve the chain ID so replay-protection is enforced ───────
	// Sepolia's chain ID is 11155111.  NewKeyedTransactorWithChainID embeds
	// this into every EIP-155 transaction signature.
	chainID, err := s.EthClient.ChainID(ctx)
	if err != nil {
		return nil, fmt.Errorf("sepolia: could not fetch chain ID: %w", err)
	}

	// ── Step 4: Fetch the pending nonce for the sender ───────────────────────
	// Using "pending" ensures we account for any unmined transactions already
	// in the mempool from this address.
	nonce, err := s.EthClient.PendingNonceAt(ctx, fromAddress)
	if err != nil {
		return nil, fmt.Errorf("sepolia: could not fetch nonce for %s: %w", fromAddress.Hex(), err)
	}

	// ── Step 5: Ask the node for a reasonable gas price ──────────────────────
	// SuggestGasPrice returns the median of recent base fees plus a small tip.
	gasPrice, err := s.EthClient.SuggestGasPrice(ctx)
	if err != nil {
		return nil, fmt.Errorf("sepolia: could not fetch gas price: %w", err)
	}

	// ── Step 6: Build the TransactOpts ───────────────────────────────────────
	// NewKeyedTransactorWithChainID creates a signer that attaches a valid
	// EIP-155 ECDSA signature to every transaction using the private key.
	auth, err := bind.NewKeyedTransactorWithChainID(privateKey, chainID)
	if err != nil {
		return nil, fmt.Errorf("sepolia: could not create transactor: %w", err)
	}

	auth.Nonce = big.NewInt(int64(nonce))
	auth.GasPrice = gasPrice
	// GasLimit of 0 tells go-ethereum to estimate gas automatically via eth_estimateGas.
	auth.GasLimit = uint64(0)

	return auth, nil
}
