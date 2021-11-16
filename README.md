There are 17 interactions in the RMRK2.0 standard: https://github.com/rmrk-team/rmrk-spec/tree/master/standards/rmrk2.0.0/interactions

The documentation is good.  The goal here is to provide some barebones examples in Typescript (using rmrk-tools) for each of these interactions.

Start a Polkadot tmp node in one terminal window.  `./polkadot --dev --tmp` or `./target/release/polkadot --dev --tmp` depending where you installed the Polkadot node.

Clone the repository and run `yarn start` then `yarn install`.  Then run `npx ts-node interactions/accept/1-testing-accept-of-nft.ts`.  Run as many as you'd like.

Alice's KSM address is: HNZata7iMYWmk5RvZRTiAsSDhV8366zq2YGb3tLH5Upf74F
Bob's KSM address is:   5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty