# IronLedger — Makefile
#
# Requires:
#   - Go  1.22+          (https://go.dev/dl/)
#   - solc 0.8.24        (https://docs.soliditylang.org/en/latest/installing-solidity.html)
#   - abigen             installed via:  go install github.com/ethereum/go-ethereum/cmd/abigen@latest
#   - make               (use Git Bash / WSL on Windows, or install via Chocolatey: choco install make)
#
# Quick start:
#   1.  cp .env.example .env && <fill in .env>
#   2.  make deps
#   3.  make bindings
#   4.  make build
#   5.  ./bin/ironledger-cli status <assetId>

# ── Variables ─────────────────────────────────────────────────────────────────
BINARY        := bin/ironledger-cli
CONTRACTS_DIR := contracts
OUT_ABI       := build/abi
OUT_BIN       := build/bin
PKG_CONTRACTS := pkg/contracts
GO_MODULE     := github.com/ahmedcod2/IronLedger

.PHONY: all deps build bindings clean test

all: deps bindings build

# ── deps ──────────────────────────────────────────────────────────────────────
# Pull all Go module dependencies declared in go.mod and generate go.sum.
deps:
	go get github.com/ethereum/go-ethereum@latest
	go get github.com/joho/godotenv@latest
	go mod tidy

# ── build ─────────────────────────────────────────────────────────────────────
# Compile the CLI binary into ./bin/
build:
	mkdir -p bin
	go build -o $(BINARY) ./cmd/ironledger-cli/...
	@echo "Built: $(BINARY)"

# ── bindings ──────────────────────────────────────────────────────────────────
# Regenerate the Go bindings in pkg/contracts/ from the Solidity source files.
#
# Pipeline for EACH contract:
#   1. solc          — compiles the Solidity and outputs a JSON ABI file + bytecode
#   2. abigen        — reads the ABI and produces a type-safe Go file
#
# After running `make bindings` the hand-authored files in pkg/contracts/ are
# replaced with the authoritative abigen output.  Commit the result.
bindings: $(OUT_ABI)
	# ── EquipmentRegistry ────────────────────────────────────────────────────
	solc --abi --bin \
	     --include-path node_modules/ \
	     --base-path . \
	     $(CONTRACTS_DIR)/EquipmentRegistry.sol \
	     -o $(OUT_ABI)/EquipmentRegistry \
	     --overwrite

	abigen \
	    --abi  $(OUT_ABI)/EquipmentRegistry/EquipmentRegistry.abi \
	    --bin  $(OUT_ABI)/EquipmentRegistry/EquipmentRegistry.bin \
	    --pkg  contracts \
	    --type EquipmentRegistry \
	    --out  $(PKG_CONTRACTS)/equipment_registry.go

	# ── InspectionLog ────────────────────────────────────────────────────────
	solc --abi --bin \
	     --include-path node_modules/ \
	     --base-path . \
	     $(CONTRACTS_DIR)/interfaces/InspectionLog.sol \
	     -o $(OUT_ABI)/InspectionLog \
	     --overwrite

	abigen \
	    --abi  $(OUT_ABI)/InspectionLog/InspectionLog.abi \
	    --bin  $(OUT_ABI)/InspectionLog/InspectionLog.bin \
	    --pkg  contracts \
	    --type InspectionLog \
	    --out  $(PKG_CONTRACTS)/inspection_log.go

	# ── OwnershipTransfer ────────────────────────────────────────────────────
	solc --abi --bin \
	     --include-path node_modules/ \
	     --base-path . \
	     $(CONTRACTS_DIR)/OwnershipTransfer.sol \
	     -o $(OUT_ABI)/OwnershipTransfer \
	     --overwrite

	abigen \
	    --abi  $(OUT_ABI)/OwnershipTransfer/OwnershipTransfer.abi \
	    --bin  $(OUT_ABI)/OwnershipTransfer/OwnershipTransfer.bin \
	    --pkg  contracts \
	    --type OwnershipTransfer \
	    --out  $(PKG_CONTRACTS)/ownership_transfer.go

	@echo "Go bindings written to $(PKG_CONTRACTS)/"

$(OUT_ABI):
	mkdir -p $(OUT_ABI)

# ── test ──────────────────────────────────────────────────────────────────────
test:
	go test ./... -v

# ── clean ─────────────────────────────────────────────────────────────────────
clean:
	rm -rf bin/ build/
