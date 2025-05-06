import { createNodeConfig } from "./src/types";
import { http } from "viem";

export default createNodeConfig({
    networks: {
        mainnet: {
            chainId: 1,
            transport: http("https://mainnet.example.com"),
        },
    },
    contracts: {
        myContract: {
            network: "mainnet",
            address: "0x1234567890abcdef1234567890abcdef12345678",
            startBlock: 1000000,
        },
    },
});
