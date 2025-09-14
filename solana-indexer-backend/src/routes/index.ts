import express, { Request, Response } from "express";
import { isProtobufLoaded } from "../protobuf/decoder";
import { clearBlocksTable, client } from "../db/clickhouse";
import { createSecretKey } from "crypto";

const router = express.Router();

router.get("/", (req: Request, res: Response) => {
    res.json({
        message: "Kafka-clikchouse Indexer",
        topic: "grpc1",
        broker: "localhost:9092",
        clickhouse: "localhost:8123",
        table: "blocks",
        protobufloaded: isProtobufLoaded(),
        langauge: "typescript",
    });
});


// route to get clikchouse blocks stats.
router.get("/stats", async (req: Request, res: Response) => {
    try {
        const totalCount = await client.query({
            query: "SELECT COUNT(*) as count FROM blocks",
            format: "JSONEachRow",
        })

        const protobufCount = await client.query({
            query: "SELECT COUNT(*) as count FROM block WHERE is_protobuf = true",
            format: "JSONEachRow",
        })

        const successCount = await client.query({
            query: "SELECT COUNT(*) as count FROM blocks WHERE decode_success = true",
            format: "JSONEachRow",
        })

        const totalResult = (await totalCount.json()) as Array<{ count: number }>;
        const protobufResult = (await protobufCount.json()) as Array<{ count: number }>;
        const successResult = (await successCount.json()) as Array<{ count: number }>;

        res.json({
            stats: {
                total_blocks: totalResult[0]?.count || 0,
                protobuf_decoded: protobufResult[0]?.count || 0,
                decode_success: successResult[0]?.count || 0
            }
        })
    } catch (error) {
        console.error("error getting stats : ", error);
        res.status(500).json({ error: "error getting database statistics" });
    }
})

// route to get recent blocks from clickhouse
router.get("/blocks", async (req: Request, res: Response) => {
    try {
        const limit = parseInt(req.query.limit as string) || 10;

        const result = await client.query({
            query: `
        SELECT 
          timestamp,
          topic,
          partition,
          offset,
          message_type,
          is_protobuf,
          decode_success,
          decoded_data
        FROM blocks 
        ORDER BY timestamp DESC 
        LIMIT ${limit}
            `,
            format: "JSONEachRow",
        })

        const blocks = await result.json();
        res.json({
            blocks,
            count: blocks.length
        })
    } catch (error) {
        console.error("Error querying ClickHouse blocks:", error);
        res.status(500).json({ error: "Error querying blocks" });
    }
})
router.delete("/blocks", async (req: Request, res: Response) => {
    try {
        await clearBlocksTable();
        res.json({ message: "Blocks table cleared successfully" })
    } catch (error) {
        console.error("Error cleaning table : ", error);
        res.status(500).json({ error: "Error clearing blocks table" })
    }
})
