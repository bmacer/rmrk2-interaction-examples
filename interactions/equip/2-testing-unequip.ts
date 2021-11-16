import { ApiPromise, WsProvider, Keyring } from '@polkadot/api';
import { KeyringPair } from "@polkadot/keyring/types";
import { encodeAddress } from "@polkadot/util-crypto";
import { sendAndFinalize } from '../../utils';
import { Base, Collection, NFT } from 'rmrk-tools';

const wsProvider = new WsProvider('ws://127.0.0.1:9944');

import { IBasePart } from "rmrk-tools/dist/classes/base";

export const getKeys = (): KeyringPair[] => {

    const k = [];
    const keyring = new Keyring({ type: "sr25519" });
    const alice = keyring.addFromUri("//Alice");
    // const bob = keyring.addFromUri("//Bob");
    k.push(alice);
    // k.push(bob);
    return k;
};

const fixedParts: IBasePart[] = [
    {
        type: "fixed",
        id: "round-face",
        src: `https://path/to/fixed_object_1.svg`,
        z: 0,
    },
    {
        type: "fixed",
        id: "square-face",
        src: `https://path/to/fixed_object_2.svg`,
        z: 0,
    },
];

const slotParts: IBasePart[] = [
    {
        type: "slot",
        id: "on-my-head",
        equippable: ["HEADWARE"],
        z: 1,
    }
];

const aliceCreatesBase = async () => {
    console.log("Step 1: Alice creates Base with face options and headware slot");
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

        const { block } = await sendAndFinalize(
            api.tx.system.remark(baseEntity.base()),
            keys[0]
        );
        console.log("Base created at block: ", block);
        return block;
    } catch (error: any) {
        console.error(error);
    }
};

const aliceCreatesACollectionPeople = async () => {
    console.log("Step 2: Alice creates collection 'people'");
    try {
        const api = await ApiPromise.create({ provider: wsProvider });
        const keys = getKeys();

        const collection = new Collection(
            0, // block
            5000, // max
            encodeAddress(keys[0].address, 2), // issuer
            "SYMBOL", // symbol
            "PEOPLE", // id
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

const aliceCreatesACollectionHeadware = async () => {
    console.log("Step 2: Alice creates collection 'HEADWARE'");
    try {
        const api = await ApiPromise.create({ provider: wsProvider });
        const keys = getKeys();

        const collection = new Collection(
            0, // block
            5000, // max
            encodeAddress(keys[0].address, 2), // issuer
            "SYMBOL", // symbol
            "HEADWARE", // id
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

const aliceMintsAnNftLittleAlice = async () => {
    console.log("Step 3: Alice mints NFT little Alice");
    try {
        const api = await ApiPromise.create({ provider: wsProvider });
        const keys = getKeys();

        const nft = new NFT({
            block: 0,
            collection: "PEOPLE",
            symbol: `LITTLE_ALICE`,
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

//Alice RESADD base with circle head to LITTLE_ALICE.
const aliceResAddsBaseResourceWithCircleHead = async (alices_base_block_number: number, little_alice_block_number: number) => {
    console.log("Step x: Alice RESADDs a slot resource purple-hat for slot on-my-head");
    try {
        const api = await ApiPromise.create({ provider: wsProvider });
        const keys = getKeys();

        const little_alice_nft = new NFT({
            block: little_alice_block_number,
            collection: "PEOPLE",
            symbol: `LITTLE_ALICE`,
            transferable: 1,
            sn: "001",
            owner: encodeAddress(keys[0].address, 2),
            metadata: "https://location.of.nft.metadata",
        });

        const resadd_remark = little_alice_nft.resadd(
            {
                id: "facial-features",
                base: `base-${alices_base_block_number}-alicesBase`,
                parts: [
                    "round-face"
                ]
            });

        const tx = api.tx.system.remark(resadd_remark);
        const { block } = await sendAndFinalize(tx, keys[0]);
        console.log("Sent success at block ", block);
        return block;
    } catch (error: any) {
        console.log(error);
    }
}

const aliceMintsABeanie = async () => {
    console.log("Step 3: Alice mints a beanie");
    try {
        const api = await ApiPromise.create({ provider: wsProvider });
        const keys = getKeys();

        const nft = new NFT({
            block: 0,
            collection: "HEADWARE",
            symbol: `BEANIE`,
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

/*
{
  "id": "nanoid-of-resource",
  "base?": "base-uri",
  "src?": "media-uri",
  "metadata?": "metadata-uri",
  "slot?": "baseslot",
  "license?": "url-or-identifier",
  "thumb?": "uri-of-thumbnail"
}
*/

const aliceResAddsPurpleHat = async (alices_base_block_number: number, beanie_block_number: number) => {
    console.log("Step x: Alice RESADDs a slot resource purple-hat for slot on-my-head");
    try {
        const api = await ApiPromise.create({ provider: wsProvider });
        const keys = getKeys();

        const beanie_nft = new NFT({
            block: beanie_block_number,
            collection: "HEADWARE",
            symbol: `BEANIE`,
            transferable: 1,
            sn: "001",
            owner: encodeAddress(keys[0].address, 2),
            metadata: "https://location.of.nft.metadata",
        });

        const resadd_remark = beanie_nft.resadd({ id: "purple-hat", slot: `base-${alices_base_block_number}-alicesBase.on-my-head` });

        const tx = api.tx.system.remark(resadd_remark);
        const { block } = await sendAndFinalize(tx, keys[0]);
        console.log("Sent success at block ", block);
        return block;
    } catch (error: any) {
        console.log(error);
    }
}

const aliceSendsBeanieToLittleAlice = async (beanie_block_number: number, little_alice_block_number: number) => {
    console.log("Step 4: Alice sends her beanie to little alice");
    try {
        const api = await ApiPromise.create({ provider: wsProvider });
        const keys = getKeys();
        const beanie_nft = new NFT({
            block: beanie_block_number,
            collection: "HEADWARE",
            symbol: `BEANIE`,
            transferable: 1,
            sn: "001",
            owner: encodeAddress(keys[0].address, 2),
            metadata: "https://location.of.nft.metadata",
        });

        const little_alice_nft = new NFT({
            block: little_alice_block_number,
            collection: "PEOPLE",
            symbol: `LITTLE_ALICE`,
            transferable: 1,
            sn: "001",
            owner: encodeAddress(keys[0].address, 2),
            metadata: "https://location.of.nft.metadata",
        });

        const send_remark = beanie_nft.send(little_alice_nft.getId());
        console.log("send_remark: ", send_remark);

        const tx = api.tx.system.remark(send_remark);
        const { block } = await sendAndFinalize(tx, keys[0]);
        console.log("Sent success at block ", block);
        return block;
    } catch (error: any) {
        console.log(error);
    }
}

const aliceEquipsLittleAliceWithBeanie = async (alices_base_block_number: number, beanie_block_number: number) => {
    console.log("Step 4: Alice sends her beanie to little alice");
    try {
        const api = await ApiPromise.create({ provider: wsProvider });
        const keys = getKeys();
        const beanie_nft = new NFT({
            block: beanie_block_number,
            collection: "HEADWARE",
            symbol: `BEANIE`,
            transferable: 1,
            sn: "001",
            owner: encodeAddress(keys[0].address, 2),
            metadata: "https://location.of.nft.metadata",
        });

        const equip_remark = beanie_nft.equip(`base-${alices_base_block_number}-alicesBase.on-my-head`);

        console.log("send_remark: ", equip_remark);

        const tx = api.tx.system.remark(equip_remark);
        const { block } = await sendAndFinalize(tx, keys[0]);
        console.log("Sent success at block ", block);
        return block;
    } catch (error: any) {
        console.log(error);
    }
}

const aliceUnequipsLittleAliceWithBeanie = async (alices_base_block_number: number, beanie_block_number: number) => {
    console.log("Step 4: Alice sends her beanie to little alice");
    try {
        const api = await ApiPromise.create({ provider: wsProvider });
        const keys = getKeys();
        const beanie_nft = new NFT({
            block: beanie_block_number,
            collection: "HEADWARE",
            symbol: `BEANIE`,
            transferable: 1,
            sn: "001",
            owner: encodeAddress(keys[0].address, 2),
            metadata: "https://location.of.nft.metadata",
        });

        const equip_remark = beanie_nft.equip(`base-${alices_base_block_number}-alicesBase.on-my-head`);

        console.log("send_remark: ", equip_remark);

        const tx = api.tx.system.remark(equip_remark);
        const { block } = await sendAndFinalize(tx, keys[0]);
        console.log("Sent success at block ", block);
        return block;
    } catch (error: any) {
        console.log(error);
    }
}

const run = async () => {
    const alices_base_block_number = await aliceCreatesBase();

    await aliceCreatesACollectionPeople();
    await aliceCreatesACollectionHeadware();

    const little_alice_block_number = await aliceMintsAnNftLittleAlice();
    await aliceResAddsBaseResourceWithCircleHead(alices_base_block_number, little_alice_block_number);

    const beanie_block_number = await aliceMintsABeanie();

    await aliceResAddsPurpleHat(alices_base_block_number, beanie_block_number);
    await aliceSendsBeanieToLittleAlice(beanie_block_number, little_alice_block_number);
    await aliceEquipsLittleAliceWithBeanie(alices_base_block_number, beanie_block_number);
    await aliceUnequipsLittleAliceWithBeanie(alices_base_block_number, beanie_block_number);
    process.exit(0);
}

run();