import { MessageData, DecodedMessage, ClickHouseBlock } from "../types";
import { decodeProtobufMessage } from "../protobuf/decoder";
import { writeBlocksToClickHouse } from "../db/clickhouse";
import { decode } from "punycode";
import { formatDateDifference } from "@grpc/grpc-js/build/src/deadline";
import { formatTimestampForClickHouse } from "../utils/timestamp";

// function to process message and write to clickhouse.
export const processMessage = async (message: MessageData): Promise<void> => {
    const timestamp: string = new Date().toISOString();

    let decodedData: DecodedMessage | null = null;
    let isProtobuf: boolean = false
    let decodeSuccess: boolean = false;

    if (message.value) {
        // log hex bytes, coming from kafka.
        console.log("Raw message hex bytes : ", [...message.value].map((b) => b.toString(16).padStart(2, "0")).join(" "));

        // try to decode as protobuf
        decodedData = decodeProtobufMessage(message.value);

        if (decodedData) {
            isProtobuf = true;
            decodeSuccess = true;
            console.log(`Decoded protobuf message type : ${decodedData.type}`);
        } else {
            // if protobuf decoding fails, try as JSON string.
            try {
                const jsonString: string = message.value.toString("utf-8");
                const jsonData = JSON.parse(jsonString);
                decodedData = { type: "JSON", data: jsonData };
                console.log("decoded as JSON message ");

            } catch (jsonError) {
                // json parse fails, store as raw data.
                decodedData = {
                    type: "Raw",
                    data: {
                        string: message.value.toString("utf-8"),
                        hex: message.value.toString("hex"),
                        base64: message.value.toString("base64")
                    }
                }
                console.log("stored as raw message data");
            }
        }

    }

    else {
        decodedData = { type: "Null", data: null };
        console.log("Received null message");
    }

    // Prepare block data for clickhouse
    const blockData: ClickHouseBlock = {
        timestamp: formatTimestampForClickHouse(timestamp),
        topic: message.topic,
        partition: message.partition,
        offset: message.offset,
        message_type: decodedData?.type || "Unknown",
        decoded_data: JSON.stringify(decodedData?.data || {}),
        is_protobuf: isProtobuf,
        decode_success: decodeSuccess
    }

    await writeBlocksToClickHouse(blockData);

    console.log(
        `Message processed and stored in clickhouse. Type : ${blockData.message_type}, protobuf : ${isProtobuf}`
    )
}