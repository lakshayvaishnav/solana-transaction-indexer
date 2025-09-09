import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';

const PROTO_PATH = path.join(__dirname, '../proto/geyser.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
});
const protoDescriptor = grpc.loadPackageDefinition(packageDefinition) as any;

const Geyser = protoDescriptor.geyser.Geyser;

const client = new Geyser('127.0.0.1:10000', grpc.credentials.createInsecure());

// Bidirectional streaming
const call = client.Subscribe();

call.write({
    slots: {
      my_slot_filter: { filter_by_commitment: true },
    },
    transactions: {
      failed_txns: { failed: true },
    },
  });


// Listen for updates
call.on('data', (update: any) => {
    if (update.slot) {
        console.log('Slot update:', update.slot);
    } else if (update.transaction) {
        console.log('Transaction update:', update.transaction);
    } else if (update.account) {
        console.log('Account update:', update.account);
    }
});

call.on('error', (err: any) => {
    console.error('Stream error:', err);
});

call.on('end', () => {
    console.log('Stream ended.');
});
