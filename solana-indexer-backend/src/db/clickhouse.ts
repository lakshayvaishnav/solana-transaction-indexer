import { createClient } from "@clickhouse/client";
import { ClickHouseBlock } from "../types";

export const client = createClient({
    url: "http://localhost:8123",
    database: "default",
    username: "default",
    password: ""
})

// initializing clickhouse table for blocks
export const initializeClickhouseTable = async (): Promise<void> => {
    try {
        // creating blocks table
        await client.exec({
            query: `
            CREATE TABLE IF NOT EXISTS blocks (
            timestamp DateTime64(3),
            topic String,
            partition Uint32,
            offset String,
            message_type String,
            decoded_data String,
            is_protobuf Bool,
            decode_success Bool
            )
            ENGINE = MergeTree()
            ORDER BY (timestamp , topic , partition , offset)
            `,
        });

        console.log("clickhouse blocks table initialized successfully")
    } catch (error) {
        console.error("error writing to clickhouse : ", error);
    }
}

export const writeBlocksToClickHouse = async (
    block: ClickHouseBlock
): Promise<void> => {
    try {
        await client.insert({
            table: "blocks",
            values: [block],
            format: 'JSONEachRow'
        })

        console.log("Blocks data written to clikchouse successfully")
    } catch (error) {
        console.error("Error writing to clickhouse : ", error)
    }
}


// function to clear blocks table
export const clearBlocksTable = async (): Promise<void> => {
    try {
        await client.exec({
            query: "TRUNCATE TABLE blocks"
        })
        console.log("Clickhouse blocks table cleared");
    } catch (error) {
        console.error("error clearing clickhouse blocks table : ", error);
    }
}

export const closeClickhouse = async () => {
    await client.close();
    console.log("Clickhosue client closed")
}