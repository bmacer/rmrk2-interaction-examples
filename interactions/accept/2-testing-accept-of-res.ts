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
    console.log("Step 1: Alice CREATEs collection");
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

        console.log("CREATE block: ", block);
        return block;
    } catch (error: any) {
        console.error(error);
    }
}

const aliceMintsAnNft = async () => {
    console.log("Step 2: Alice MINTs NFT");
    try {
        const api = await ApiPromise.create({ provider: wsProvider });
        const keys = getKeys();

        const nft = new NFT({
            block: 0,
            collection: "ALICES_COLLECTION",
            symbol: `BOBS_NFT`,
            transferable: 1,
            sn: "001",
            owner: encodeAddress(keys[0].address, 2),
            metadata: "https://location.of.nft.metadata",
        });

        const mint_remark = nft.mint();

        const tx = api.tx.system.remark(mint_remark);
        const { block } = await sendAndFinalize(tx, keys[0]);
        console.log("NFT MINTed: ", block);
        return block;
    } catch (error: any) {
        console.error(error);
    }
}

const aliceSendsNftToBob = async (alices_nft_block_number: number) => {
    console.log("Step 3: Alice SENDs NFT to Bob");
    try {
        const api = await ApiPromise.create({ provider: wsProvider });
        const keys = getKeys();
        const alices_nft = new NFT({
            block: alices_nft_block_number,
            collection: "ALICES_COLLECTION",
            symbol: `BOBS_NFT`,
            transferable: 1,
            sn: "001",
            owner: encodeAddress(keys[0].address, 2),
            metadata: "https://location.of.nft.metadata",
        });

        const send_remark = alices_nft.send(encodeAddress(keys[1].address, 2));

        const tx = api.tx.system.remark(send_remark);
        const { block } = await sendAndFinalize(tx, keys[0]);
        console.log("Sent success at block ", block);
        return block;
    } catch (error: any) {
        console.log(error);
    }
}

const bobAddsResourceToNft = async (bobs_nft_block_number: number) => {
    console.log("Step 4: Bob RESADDs resource to NFT");
    try {
        const api = await ApiPromise.create({ provider: wsProvider });
        const keys = getKeys();

        const bobs_nft = new NFT({
            block: bobs_nft_block_number,
            collection: "ALICES_COLLECTION",
            symbol: `BOBS_NFT`,
            transferable: 1,
            sn: "001",
            owner: encodeAddress(keys[0].address, 2),
            metadata: "https://location.of.nft.metadata",
        });

        const resadd_remark = bobs_nft.resadd({ id: "bobs_resource_id" });

        const tx = api.tx.system.remark(resadd_remark);
        const { block } = await sendAndFinalize(tx, keys[0]);
        console.log("Sent success at block ", block);
        return block;
    } catch (error: any) {
        console.log(error);
    }
}

const bobAcceptsResadd = async (bobs_nft_block_number: number) => {
    console.log("Step 5: Bob ACCEPTs RESADD");
    try {
        const api = await ApiPromise.create({ provider: wsProvider });
        const keys = getKeys();

        const bobs_nft = new NFT({
            block: bobs_nft_block_number,
            collection: "ALICES_COLLECTION",
            symbol: `BOBS_NFT`,
            transferable: 1,
            sn: "001",
            owner: encodeAddress(keys[1].address, 2),
            metadata: "https://location.of.nft.metadata",
        });

        const acceptance_remark = bobs_nft.accept("bobs_resource_id", "RES");

        const tx = api.tx.system.remark(acceptance_remark);
        const { block } = await sendAndFinalize(tx, keys[1]);
        console.log("Sent success at block ", block);
        return block;
    } catch (error: any) {
        console.log(error);
    }
}


const run = async () => {
    await aliceCreatesACollection();
    const bobs_nft_block_number = await aliceMintsAnNft();
    await aliceSendsNftToBob(bobs_nft_block_number);
    await bobAddsResourceToNft(bobs_nft_block_number);
    await bobAcceptsResadd(bobs_nft_block_number);
    process.exit(0);
}

run();