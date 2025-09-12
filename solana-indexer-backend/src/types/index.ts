export interface DecodedMessage {
    type: String,
    data: any
}

export interface MessageData {
    topic: string;
    partition: number;
    offset: string,
    value: Buffer | null;
}