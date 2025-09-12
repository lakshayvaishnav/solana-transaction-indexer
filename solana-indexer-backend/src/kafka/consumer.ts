import { Consumer, EachMessagePayload, Kafka } from "kafkajs";
import { MessageData } from "../types";

const kafka = new Kafka({
    clientId: "kafka-consumer",
    brokers: ["localhost:9092"]
})

export const consumer: Consumer = kafka.consumer({
    groupId: "express-consumer-group"
})

// kafka consumer setup
export const runConsumer = async (
    messageHandler: (message: MessageData) => Promise<void>): Promise<void> => {
    try {
        await consumer.connect();
        console.log("connected to kafka");

        await consumer.subscribe({ topic: "grpc1", fromBeginning: false });
        console.log("Subscribed to topic : grpc1");

        await consumer.run({
            eachMessage: async ({
                topic,
                partition,
                message
            }: EachMessagePayload) => {
                console.log(`Received message from ${topic}[${partition}]@${message.offset}`)

                // process message using the provided handler
                await messageHandler({
                    topic,
                    partition,
                    offset: message.offset.toString(),
                    value: message.value
                })
            }
        })
    } catch (error) {
        console.error("Error setting up kafka consumer : ", error);
    }
}

// function to disconnect kafka consumer
export const disconnectConsumer = async (): Promise<void> => {
    await consumer.disconnect();
    console.log("kafka consumer disconnected");
}