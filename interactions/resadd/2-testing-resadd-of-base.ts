import { ApiPromise, WsProvider, Keyring } from '@polkadot/api';
import { KeyringPair } from "@polkadot/keyring/types";
import { encodeAddress } from "@polkadot/util-crypto";
import { sendAndFinalize } from '../../utils';
import { Collection, NFT, Base } from 'rmrk-tools';
import { IBasePart } from "rmrk-tools/dist/classes/base";

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
        console.log("Alice's address: ", keys[0].address);

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

        const tx = api.tx.system.remark(minted);
        const { block } = await sendAndFinalize(tx, keys[0]);
        console.log("Chunky NFT minted at block: ", block);
        return block;
    } catch (error: any) {
        console.error(error);
    }
}

const fixedParts: IBasePart[] = [
    {
        type: "fixed",
        id: "circle-head",
        src: `https://path/to/fixed_object_1.svg`,
        z: 0,
    },
    {
        type: "fixed",
        id: "triangle-head",
        src: `https://path/to/fixed_object_2.svg`,
        z: 0,
    },
];

const slotParts: IBasePart[] = [
    {
        type: "slot",
        id: "headware",
        equippable: ["headware-collection"],
        z: 1,
    },
    {
        type: "slot",
        id: "footwear",
        equippable: ["footwear-collection"],
        z: 2,
    },
];

const aliceCreatesBase = async () => {
    console.log("Step 3: Alice creates Base");
    try {
        const api = await ApiPromise.create({ provider: wsProvider });
        const keys = getKeys();

        const baseParts = [...fixedParts, ...slotParts];

        const baseEntity = new Base(
            0,
            "alicesBase",
            encodeAddress(keys[0].address, 2),
            "svg",
            baseParts
        );

        const base_remark = baseEntity.base()

        const { block } = await sendAndFinalize(
            api.tx.system.remark(base_remark),
            keys[0]
        );
        console.log("Base created at block: ", block);
        return block;
    } catch (error: any) {
        console.error(error);
    }
};



const aliceAddsBaseResourceToNft = async (base_block_number: number, alice_nft_block_number: number) => {
    console.log("Step 4: Alice RESADDs base resource to NFT");
    try {
        const api = await ApiPromise.create({ provider: wsProvider });
        const keys = getKeys();

        const alices_nft = new NFT({
            block: alice_nft_block_number,
            collection: "ALICES_COLLECTION",
            symbol: `ALICES_NFT`,
            transferable: 1,
            sn: "001",
            owner: encodeAddress(keys[0].address, 2),
            metadata: "https://location.of.nft.metadata",
        });

        const resadd_remark = alices_nft.resadd(
            {
                id: "facial-features",
                base: `base-${base_block_number}-alicesBase`,
                parts: [
                    "circle-head",
                    "footwear-slot"
                ]
            });

        console.log("resadd_remark: ", resadd_remark);

        const tx = api.tx.system.remark(resadd_remark);
        const { block } = await sendAndFinalize(tx, keys[0]);
        console.log("Sent success at block ", block);
        return block;
    } catch (error: any) {
        console.log(error);
    }
}

const run = async () => {
    await aliceCreatesACollection();
    const alices_nft_id = await aliceMintsAnNft();
    const base_block_number = await aliceCreatesBase();
    await aliceAddsBaseResourceToNft(base_block_number, alices_nft_id);
    process.exit(0);
}

run();