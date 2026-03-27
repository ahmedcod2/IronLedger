# IronLedger Architecture Notes

## On-chain contracts
- EquipmentRegistry: stores asset identity and certification state
- InspectionLog: stores inspection records and compliance flags
- OwnershipTransfer: controls custody transfer and blocks transfer when compliance issues exist

## Off-chain scaffold
A Go CLI can later:
- simulate stakeholders
- read deployed contract state
- submit transactions through RPC
- support interim demo workflows
