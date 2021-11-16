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

        const remark_collection = collection.create();

        const { block } = await sendAndFinalize(
            api.tx.system.remark(remark_collection),
            keys[0]
        );
        console.log("CREATE block: ", block);

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
        console.log("MINT block: ", block);
        return block;
    } catch (error: any) {
        console.error(error);
    }
}

const aliceListsNft = async (alices_nft_block_number: number) => {
    console.log("Step 3: Alice LISTs NFT for 1KSM");
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

        const one_ksm = 1_000_000_000_000;
        const list_remark = alices_nft.list(one_ksm);

        const tx = api.tx.system.remark(list_remark);

        const { block } = await sendAndFinalize(tx, keys[0]);
        console.log("LIST block: ", block);
        return block;
    } catch (error: any) {
        console.log(error);
    }
}

const bobBuysAlicesNft = async (alices_nft_block_number: number) => {
    console.log("Step 4: Bob BUYs Alice's NFT");
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

        const buy_remark = alices_nft.buy(encodeAddress(keys[1].address, 2));

        const one_ksm = 1_000_000_000_000;
        const balance_transfer = api.tx.balances.transfer(encodeAddress(keys[0].address, 2), one_ksm);

        const tx = api.tx.utility.batchAll([
            api.tx.system.remark(buy_remark),
            balance_transfer
        ]);

        const { block } = await sendAndFinalize(tx, keys[1]);
        console.log("Sent success at block ", block);
        return block;
    } catch (error: any) {
        console.log(error);
    }
}

const run = async () => {
    await aliceCreatesACollection();
    const alices_nft_id = await aliceMintsAnNft();
    await aliceListsNft(alices_nft_id);
    await bobBuysAlicesNft(alices_nft_id);
    process.exit(0);
}

run();