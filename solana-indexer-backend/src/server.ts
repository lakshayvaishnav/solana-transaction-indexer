import express from "express";
import {
    initializeClickhouseTable, closeClickhouse
} from "./db/clickhouse"
import { loadProtobufShcema } from "./protobuf/decoder";
import { disconnectConsumer, runConsumer } from "./kafka/consumer";
import { processMessage } from "./services/processor";

const app = express();
const PORT: number = parseInt(process.env.PORT || "3000");

// middleware
app.use(express.json())


const gracefulShutdown = async (): Promise<void> => {
    console.log("shutting down gracefully...");
    try {
        await disconnectConsumer();
        await closeClickhouse();
        process.exit(0);
    } catch (error) {
        console.error("Error during shutdown : ", error);
        process.exit(1);
    }
};

process.on("SIGINT", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);


// start server and kafka consumer
app.listen(PORT, async () => {

    await initializeClickhouseTable();
    await loadProtobufShcema();
    await runConsumer(processMessage);
})