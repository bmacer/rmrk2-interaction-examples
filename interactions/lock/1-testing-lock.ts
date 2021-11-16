import { ApiPromise, WsProvider, Keyring } from '@polkadot/api';
import { KeyringPair } from "@polkadot/keyring/types";
import { encodeAddress } from "@polkadot/util-crypto";
import { sendAndFinalize } from '../../utils';
import { Collection, NFT } from 'rmrk-tools';

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

const aliceMintsAnNft = async () => {
    console.log("Step 2: Alice MINTs an NFT");
    try {
        const api = await ApiPromise.create({ provider: wsProvider });
        const keys = getKeys();
        const nft = new NFT({
            block: 0,
            collection: "ALICES_COLLECTION",
            symbol: `ALICES_NFT_1`,
            transferable: 1,
            sn: "001",
            owner: encodeAddress(keys[0].address, 2),
            metadata: "https://location.of.nft.metadata",
        });
        const minted = nft.mint();
        console.log("nft.mint() ==> ", minted);

        const tx = api.tx.system.remark(minted);
        const { block } = await sendAndFinalize(tx, keys[0]);
        console.log("Chunky NFT minted at block: ", block);
        return block;
    } catch (error: any) {
        console.error(error);
    }
}

const aliceLocksCollection = async (collection_block_number: number, collection_name: string) => {
    console.log("Step 3: Alice LOCKs collection");
    try {
        const api = await ApiPromise.create({ provider: wsProvider });
        const keys = getKeys();

        const collection = new Collection(
            collection_block_number, // block
            5000, // max
            encodeAddress(keys[0].address, 2), // issuer
            "SYMBOL", // symbol
            "ALICES_COLLECTION", // id
            "https://collection_metadata_cid" // metadata
        );

        const lock_remark = `RMRK::LOCK::2.0.0::${collection_name}`

        const { block } = await sendAndFinalize(
            api.tx.system.remark(lock_remark),
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

const aliceMintsASecondNft = async () => {
    console.log("Step 4: Alice MINTs a second NFT");
    try {
        const api = await ApiPromise.create({ provider: wsProvider });
        const keys = getKeys();
        const nft = new NFT({
            block: 0,
            collection: "ALICES_COLLECTION",
            symbol: `ALICES_NFT_2`,
            transferable: 1,
            sn: "002",
            owner: encodeAddress(keys[0].address, 2),
            metadata: "https://location.of.nft.metadata",
        });
        const minted = nft.mint();
        console.log("nft.mint() ==> ", minted);

        const tx = api.tx.system.remark(minted);
        const { block } = await sendAndFinalize(tx, keys[0]);
        console.log("Chunky NFT minted at block: ", block);
        return block;
    } catch (error: any) {
        console.error(error);
    }
}

const run = async () => {
    await aliceCreatesACollection();
    await aliceMintsAnNft();
    await aliceLocksCollection(111, "ALICES_COLLECTION");
    await aliceMintsASecondNft();
    process.exit(0);
}

run();