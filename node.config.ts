import { createNodeConfig } from "./src/types";
import { http } from "viem";

export default createNodeConfig({
    networks: {
        "base": {
            chainId: 8453,
            transport: http(process.env.ACCESSNODE_RPC_URL_8453),
            maxRequestsPerSecond: 15,
        },
        "base-sepolia": {
            chainId: 84532,
            transport: http(process.env.ACCESSNODE_RPC_URL_84532),
            maxRequestsPerSecond: 15,
        },
    },
    contracts: {
        AccessTime: {
            network: {
                "base": {
                    address: "0x0000000000000000000000000000000000000000",
                    startBlock: 100000,
                },
                "base-sepolia": {
                    address: "0x0000000000000000000000000000000000000000",
                    startBlock: 100000,
                },
            },
        },
    }
});
