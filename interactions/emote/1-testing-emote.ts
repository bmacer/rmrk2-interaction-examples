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
    const bob = keyring.addFromUri("//Bob");
    k.push(alice);
    k.push(bob);
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

        const { block } = await sendAndFinalize(
            api.tx.system.remark(collection.create()),
            keys[0]
        );

        console.log("COLLECTION CREATION REMARK: ", collection.create());
        console.log("Collection ID: ", collection.id);
        console.log("Chunky collection created at block: ", block);

        return block;
    } catch (error: any) {
        console.error(error);
    }
}

const aliceMintsAnNft = async () => {
    console.log("Step 2: Alice creates NFT");
    try {
        const api = await ApiPromise.create({ provider: wsProvider });
        const keys = getKeys();

        const nft = new NFT({
            block: 0,
            collection: "ALICES_COLLECTION",
            symbol: `ALICES_NFT`,
            transferable: 1,
            sn: "001",
            owner: encodeAddress(keys[0].address, 2),
            metadata: "https://location.of.nft.metadata",
        });

        const minted = nft.mint();
        console.log("nft.mint() ==> ", minted);

        const tx = api.tx.system.remark(nft.mint());
        const { block } = await sendAndFinalize(tx, keys[0]);
        console.log("Chunky NFT minted at block: ", block);
        return block;
    } catch (error: any) {
        console.error(error);
    }
}

const bobEmotesOnAlicesNft = async (alices_nft_block_number: number) => {
    console.log("Step 3: Bob Emotes on Alice's NFT");
    try {
        const api = await ApiPromise.create({ provider: wsProvider });
        const keys = getKeys();
        const nft = new NFT({
            block: alices_nft_block_number | 0,
            collection: "ALICES_COLLECTION",
            symbol: `ALICES_NFT`,
            transferable: 1,
            sn: "001",
            owner: encodeAddress(keys[0].address, 2),
            metadata: "https://location.of.nft.metadata",
        });

        const emote_remark = nft.emote("1F389");

        const tx = api.tx.system.remark(emote_remark);
        const { block } = await sendAndFinalize(tx, keys[1]);
        console.log("Bob emotes on Alice's NFT at block: ", block);
        return block;
    } catch (error: any) {
        console.error(error);
    }
}

const run = async () => {
    await aliceCreatesACollection();
    const alices_nft_block_number = await aliceMintsAnNft();
    await bobEmotesOnAlicesNft(alices_nft_block_number);
    process.exit(0);
}

run();