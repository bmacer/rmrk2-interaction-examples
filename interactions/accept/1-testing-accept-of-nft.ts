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
            symbol: `ALICES_NFT`,
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
    console.log("Step 3: Alice sends NFT to Bob");
    try {
        const api = await ApiPromise.create({ provider: wsProvider });
        const keys = getKeys();
        const alices_nft = new NFT({
            block: alices_nft_block_number,
            collection: "ALICES_COLLECTION",
            symbol: `ALICES_NFT`,
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

const aliceMintsAnotherNft = async () => {
    console.log("Step 4: Alice MINTs second NFT");
    try {
        const api = await ApiPromise.create({ provider: wsProvider });
        const keys = getKeys();

        const nft = new NFT({
            block: 0,
            collection: "ALICES_COLLECTION",
            symbol: `ALICES_SECOND_NFT`,
            transferable: 1,
            sn: "002",
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

const aliceSendsNftToBobsNft = async (alices_first_nft_block: number, alices_second_nft_block: number) => {
    console.log("Step 5: Alice sends her NFT to Bob's NFT");
    try {
        const api = await ApiPromise.create({ provider: wsProvider });
        const keys = getKeys();
        const alices_first_nft = new NFT({
            block: alices_first_nft_block,
            collection: "ALICES_COLLECTION",
            symbol: `ALICES_NFT`,
            transferable: 1,
            sn: "001",
            owner: encodeAddress(keys[1].address, 2),
            metadata: "https://location.of.nft.metadata",
        });

        const alices_second_nft = new NFT({
            block: alices_second_nft_block,
            collection: "ALICES_COLLECTION",
            symbol: `ALICES_SECOND_NFT`,
            transferable: 1,
            sn: "002",
            owner: encodeAddress(keys[0].address, 2),
            metadata: "https://location.of.nft.metadata",
        });

        const send_remark = alices_second_nft.send(alices_first_nft.getId());

        const tx = api.tx.system.remark(send_remark);
        const { block } = await sendAndFinalize(tx, keys[0]);
        console.log("SEND success at block ", block);
        return block;
    } catch (error: any) {
        console.log(error);
    }
}

const bobAcceptsAlicesNft = async (alices_first_nft_block: number, alices_second_nft_block: number) => {
    console.log("Step 6: Bob ACCEPTs Alice's NFT");
    try {
        const api = await ApiPromise.create({ provider: wsProvider });
        const keys = getKeys();

        const alices_first_nft = new NFT({
            block: alices_first_nft_block,
            collection: "ALICES_COLLECTION",
            symbol: `ALICES_NFT`,
            transferable: 1,
            sn: "001",
            owner: encodeAddress(keys[1].address, 2),
            metadata: "https://location.of.nft.metadata",
        });

        const alices_second_nft = new NFT({
            block: alices_second_nft_block,
            collection: "ALICES_COLLECTION",
            symbol: `ALICES_SECOND_NFT`,
            transferable: 1,
            sn: "002",
            owner: encodeAddress(keys[1].address, 2),
            metadata: "https://location.of.nft.metadata",
        });

        const acceptance_remark = alices_first_nft.accept(alices_second_nft.getId(), "NFT");

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
    const alices_first_nft = await aliceMintsAnNft();
    await aliceSendsNftToBob(alices_first_nft);
    const alices_second_nft = await aliceMintsAnotherNft();
    await aliceSendsNftToBobsNft(alices_first_nft, alices_second_nft);
    await bobAcceptsAlicesNft(alices_first_nft, alices_second_nft);
    process.exit(0);
}

run();