import { ApiPromise, WsProvider, Keyring } from '@polkadot/api';
import { KeyringPair } from "@polkadot/keyring/types";
import { encodeAddress } from "@polkadot/util-crypto";
import { sendAndFinalize } from '../../utils';
import { Collection } from 'rmrk-tools';

const wsProvider = new WsProvider('ws://127.0.0.1:9944');

export const getKeys = (): KeyringPair[] => {

    const k = [];
    const keyring = new Keyring({ type: "sr25519" });
    const alice = keyring.addFromUri("//Alice");
    k.push(alice);
    return k;
};

const aliceCreatesACollection = async () => {
    console.log("Step 1: Alice creates collection");
    try {
        const api = await ApiPromise.create({ provider: wsProvider });
        const keys = getKeys();

        const collection = new Collection(
            0, // block
            5000, // max
            encodeAddress(keys[0].address, 2), // issuer
            "SYMBOL", // symbol
            "ALICES_COLLECTION", // id
            "https://collection_metadata_cid" // metadata
        );

        const create_remark = collection.create();

        const { block } = await sendAndFinalize(
            api.tx.system.remark(create_remark),
            keys[0]
        );

        console.log("Create remark: ", collection.create());
        console.log("Collection ID: ", collection.id);
        console.log("Chunky collection created at block: ", block);

        return block;
    } catch (error: any) {
        console.error(error);
    }
}

const run = async () => {
    await aliceCreatesACollection();
    process.exit(0);
}

run();