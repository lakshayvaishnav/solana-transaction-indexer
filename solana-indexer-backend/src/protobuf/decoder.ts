import * as protobuf from "protobufjs"
import * as path from "path"
import { solana_program_init } from "@triton-one/yellowstone-grpc/dist/types/encoding/yellowstone_grpc_solana_encoding_wasm";
import { DecodedMessage } from "../types";

// Protobuf types
let ConfirmedBlockType: protobuf.Type | null = null;
let ConfirmedTransactionType: protobuf.Type | null = null;
let TransactionType: protobuf.Type | null = null;

// load protobuf schema
export const loadProtobufShcema = async (): Promise<void> => {
    try {
        const root = await protobuf.load(
            path.join(__dirname, "../../proto/solana-storage.proto")
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

// Function to decode protobuf message
export const decodeProtobufMessage = (buffer: Buffer): DecodedMessage | null => {
    if (!ConfirmedBlockType && !ConfirmedTransactionType && !TransactionType) {
        return null;
    }

    // trying decoding with confirmed block first
    try {
        if (ConfirmedBlockType) {
            const decoded = ConfirmedBlockType?.decode(buffer);
            return {
                type: "ConfirmedBlock",
                data: ConfirmedBlockType.toObject(decoded, {
                    longs: String,
                    enums: String,
                    bytes: String,
                    defaults: true,
                    arrays: true,
                    objects: true,
                }),
            }
        }
    } catch (error) {
        // if confirmed block fails , try confirmed transaction
        try {
            if (ConfirmedTransactionType) {
                const decoded = ConfirmedTransactionType.decode(buffer);
                return {
                    type: "ConfirmedTransaction",
                    data: ConfirmedTransactionType.toObject(decoded, {
                        longs: String,
                        enums: String,
                        bytes: String,
                        defaults: true,
                        arrays: true,
                        objects: true,
                    }),
                }
            }
        } catch (error) {
            // if confirm transaction fails , try transaction
            try {
                if (TransactionType) {
                    const decoded = TransactionType.decode(buffer);
                    return {
                        type: "Transaction",
                        data: TransactionType.toObject(decoded, {
                            longs: String,
                            enums: String,
                            bytes: String,
                            defaults: true,
                            arrays: true,
                            objects: true,
                        })
                    }
                }
            } catch (error) {
                console.log("Failed to decode with all solana message types")
            }
        }

    }

    return null;
}

// chekc if protobuf is loaded
export const isProtobufLoaded = (): Boolean => {
    return (
        ConfirmedBlockType !== null ||
        ConfirmedTransactionType !== null ||
        TransactionType !== null
    )
}