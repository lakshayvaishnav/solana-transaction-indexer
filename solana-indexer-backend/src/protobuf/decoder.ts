import * as protobuf from "protobufjs"
import * as path from "path"
import { solana_program_init } from "@triton-one/yellowstone-grpc/dist/types/encoding/yellowstone_grpc_solana_encoding_wasm";

// Protobuf types
let ConfirmedBlockType: protobuf.Type | null = null;
let ConfirmedTransactionType: protobuf.Type | null = null;
let TransactionType: protobuf.Type | null = null;

// load protobuf schema
export const loadProtobufScema = async (): Promise<void> => {
    try {
        const root = await protobuf.load(
            path.join(__dirname, "../../message.proto")
        );

        ConfirmedBlockType = root.lookupType("solana.storage.ConfirmedBlock.ConfirmedBlock");

        ConfirmedTransactionType = root.lookupType("solana.storage.ConfirmedBlock.ConfirmedTransaction");

        TransactionType = root.lookupType("solana.storage.ConfirmedBlock.Transaction");

        console.log("Solana protobuf schema loaded successfully");

        console.log(
            "Available message types: ConfirmedBlock, ConfirmedTransaction, Transaction"
        );
    } catch (error) {
        console.error("Error loading protobuf schema:", error);
        console.log("Will attempt to decode messages as raw data");
    }
}