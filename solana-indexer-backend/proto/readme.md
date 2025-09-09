Yellowstone gRPC Protobufs

This repository contains the core protocol buffer (.proto) definitions used by the Yellowstone Geyser gRPC plugin for Solana. These files define both the subscription service and the data structures returned by a Solana validator.

📂 Files

geyser.proto

Defines the Geyser gRPC service — the APIs and subscription mechanism for clients to stream real-time Solana updates.

solana-storage.proto

Defines the data models used within Solana (transactions, accounts, blocks, rewards, etc.). These are referenced inside geyser.proto messages to carry chain data.

🔹 geyser.proto
Purpose

geyser.proto provides the interface for connecting to a validator’s Geyser plugin via gRPC.
It describes:

Available RPC methods (Subscribe, Ping, GetSlot, etc.).

Subscription filters (accounts, slots, transactions, blocks, etc.).

The structure of updates streamed back to clients.

Key Components

Service Definition

service Geyser {
  rpc Subscribe(stream SubscribeRequest) returns (stream SubscribeUpdate) {}
  rpc Ping(PingRequest) returns (PongResponse) {}
  rpc GetSlot(GetSlotRequest) returns (GetSlotResponse) {}
  // ... more
}


Subscribe → Bi-directional stream for updates.

Ping/GetSlot/GetVersion → Utility methods for status checks.

Subscription Requests

SubscribeRequest lets clients choose what they want:

Accounts (accounts)

Slots (slots)

Transactions & failed txns (transactions, transactions_status)

Blocks & block metadata (blocks, blocks_meta)

Entries (entry)

Example:

{
  "slots": { "my_slot_filter": { "filter_by_commitment": true } },
  "transactions": { "failed_txns": { "failed": true } }
}


Subscription Updates

SubscribeUpdate is the core response, containing one of:

account → Account changes

slot → Slot updates (processed, confirmed, finalized)

transaction → Transaction details (with metadata)

block → Full block data

block_meta → Lightweight block header info

entry → Entry updates

🔹 solana-storage.proto
Purpose

solana-storage.proto defines the canonical Solana blockchain data structures used within updates.
These represent raw ledger objects like blocks, transactions, balances, rewards, etc.

Key Components

ConfirmedBlock

Represents a finalized block on Solana.

Contains transactions, rewards, block_time, and block_height.

ConfirmedTransaction

Wraps a transaction and its execution metadata (meta).

Transaction

Consists of signatures + message (instructions, accounts, recent blockhash).

Message

Contains account keys, instructions, address table lookups, etc.

TransactionStatusMeta

Execution details:

Error (if any)

Fee, balances before/after

Inner instructions, logs

Token balances

Return data

Compute units consumed

Rewards

Rewards distributed for fees, rent, staking, voting, etc.

🔗 Relationship Between Files

geyser.proto imports solana-storage.proto:

import "solana-storage.proto";


Data streamed through SubscribeUpdate (in geyser.proto) includes fields that reuse Solana’s storage types:

message SubscribeUpdateTransactionInfo {
  bytes signature = 1;
  solana.storage.ConfirmedBlock.Transaction transaction = 3;
  solana.storage.ConfirmedBlock.TransactionStatusMeta meta = 4;
}


✅ This means:

Geyser = “How” you subscribe & receive data

Solana Storage = “What” the data actually looks like