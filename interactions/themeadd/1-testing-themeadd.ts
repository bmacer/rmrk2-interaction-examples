import { ApiPromise, WsProvider, Keyring } from '@polkadot/api';
import { KeyringPair } from "@polkadot/keyring/types";
import { encodeAddress } from "@polkadot/util-crypto";
import { sendAndFinalize } from '../../utils';
import { Base } from 'rmrk-tools';

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
        id: "fixed_object_1",
        src: `https://path/to/fixed_object_1.svg`,
        z: 0,
    },
    {
        type: "fixed",
        id: "fixed_object-2",
        src: `https://path/to/fixed_object_2.svg`,
        z: 0,
    },
];

const slotParts: IBasePart[] = [
    {
        type: "slot",
        id: "slot_object_1",
        equippable: ["collection_1", "collection_2"],
        z: 1,
    },
    {
        type: "slot",
        id: "slot_object_2",
        equippable: ["collection_3"],
        z: 2,
    },
];

const aliceCreatesBase = async () => {
    console.log("Step 1: Alice creates Base");
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

const aliceAddsTheme = async (base_block_number: number) => {
    console.log("Step 1: Alice creates Base");
    try {
        const api = await ApiPromise.create({ provider: wsProvider });
        const keys = getKeys();

        const baseParts = [...fixedParts, ...slotParts];

        const baseEntity = new Base(
            base_block_number,
            "alicesBase",
            encodeAddress(keys[0].address, 2),
            "svg",
            baseParts
        );

        const theme_remark = baseEntity.themeadd({
            themeId: "alices-new-theme",
            theme: {
                "good": "abc",
                "bad": "def",
            }
        });

        const { block } = await sendAndFinalize(
            api.tx.system.remark(theme_remark),
            keys[0]
        );
        console.log("Base created at block: ", block);
        return block;
    } catch (error: any) {
        console.error(error);
    }
};

const run = async () => {
    const base_block_number = await aliceCreatesBase();
    await aliceAddsTheme(base_block_number);
    process.exit(0);
}

run();