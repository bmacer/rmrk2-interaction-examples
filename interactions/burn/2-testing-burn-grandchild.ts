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

        return block;
    } catch (error: any) {
        console.error(error);
    }
}

const aliceMintsAnNft = async (sn: number) => {
    console.log("Step 2-3: Alice MINTs two NFT");
    try {
        const api = await ApiPromise.create({ provider: wsProvider });
        const keys = getKeys();
        const nft = new NFT({
            block: 0,
            collection: "ALICES_COLLECTION",
            symbol: `ALICES_NFT_${sn}`,
            transferable: 1,
            sn: `${sn}`,
            owner: encodeAddress(keys[0].address, 2),
            metadata: "https://location.of.nft.metadata",
        });
        const mint_remark = nft.mint();

        const tx = api.tx.system.remark(mint_remark);
        const { block } = await sendAndFinalize(tx, keys[0]);
        console.log("Chunky NFT minted at block: ", block);
        return block;
    } catch (error: any) {
        console.error(error);
    }
}

const aliceSendsFirstNftToSecondNft = async (first_nft_number: number, second_nft_number: number) => {
    console.log("Step 4: Alice sends her first NFT to her second NFT (creating a 'grandchild' NFT)");
    try {
        const api = await ApiPromise.create({ provider: wsProvider });
        const keys = getKeys();
        const first_nft = new NFT({
            block: first_nft_number,
            collection: "ALICES_COLLECTION",
            symbol: `ALICES_NFT_1`,
            transferable: 1,
            sn: "1",
            owner: encodeAddress(keys[0].address, 2),
            metadata: "https://location.of.nft.metadata",
        });

        const second_nft = new NFT({
            block: second_nft_number,
            collection: "ALICES_COLLECTION",
            symbol: `ALICES_NFT_2`,
            transferable: 1,
            sn: "2",
            owner: encodeAddress(keys[0].address, 2),
            metadata: "https://location.of.nft.metadata",
        });

        const send_remark = second_nft.send(first_nft.getId());

        const tx = api.tx.system.remark(send_remark);
        const { block } = await sendAndFinalize(tx, keys[0]);
        console.log("Sent success at block ", block);
        return block;
    } catch (error: any) {
        console.log(error);
    }
}

const aliceBurnsGrandchildNft = async (second_nft_number: number) => {
    console.log("Step 5: Alice BURNs grandchild NFT");
    try {
        const api = await ApiPromise.create({ provider: wsProvider });
        const keys = getKeys();

        const grandchild_nft = new NFT({
            block: second_nft_number,
            collection: "ALICES_COLLECTION",
            symbol: `ALICES_NFT_2`,
            transferable: 1,
            sn: "2",
            owner: encodeAddress(keys[0].address, 2),
            metadata: "https://location.of.nft.metadata",
        });

        const burn_remark = grandchild_nft.burn();
        const burn_reason = "reason-for-burning";

        const remarks = [burn_remark, burn_reason];

        const txs = remarks.map((remark) => api.tx.system.remark(remark));
        const tx = api.tx.utility.batchAll(txs);

        const { block } = await sendAndFinalize(tx, keys[0]);
        console.log("Sent success at block ", block);
        return block;
    } catch (error: any) {
        console.log(error);
    }
}

const run = async () => {
    await aliceCreatesACollection();
    const alices_first_nft_id = await aliceMintsAnNft(1);
    const alices_second_nft_id = await aliceMintsAnNft(2);
    await aliceSendsFirstNftToSecondNft(alices_first_nft_id, alices_second_nft_id);
    await aliceBurnsGrandchildNft(alices_second_nft_id);
    process.exit(0);
}

run();