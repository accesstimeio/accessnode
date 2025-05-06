import type { ConnectionOptions } from "node:tls";
import type { Narrow, Transport } from "viem";
/**
 * @description Combines members of an intersection into a readable type.
 *
 * @link https://twitter.com/mattpocockuk/status/1622730173446557697?s=20&t=NdpAcmEFXY01xkqU3KO0Mg
 * @example
 * Prettify<{ a: string } | { b: string } | { c: number, d: bigint }>
 * => { a: string, b: string, c: number, d: bigint }
 */
export type Prettify<T> = {
    [K in keyof T]: T[K];
} & {};

// -- Base Types --

type DatabaseConfig =
    | {
        kind: "pglite";
        directory?: string;
    }
    | {
        kind: "postgres";
        connectionString?: string;
        poolConfig?: {
            max?: number;
            ssl?: boolean | Prettify<ConnectionOptions>;
        };
    };

type BlockConfig = {
    startBlock?: number | "latest";
    endBlock?: number | "latest";
};

type TransactionReceiptConfig = {
    includeTransactionReceipts?: boolean;
};

type FunctionCallConfig = {
    includeCallTraces?: boolean;
};

// -- Address --

export type AddressConfig = {
    /** A lowercase `0x`-prefixed Ethereum address. */
    address?: string;
};

// -- Networks --

type NetworkConfig<network> = {
    chainId: network extends { chainId: infer chainId extends number }
    ? chainId | number
    : number;
    transport: Transport;
    pollingInterval?: number;
    maxRequestsPerSecond?: number;
    disableCache?: boolean;
};

type NetworksConfig<networks> = {} extends networks
    ? {}
    : {
        [networkName in keyof networks]: NetworkConfig<networks[networkName]>;
    };

// -- Contracts --

type GetContractNetwork<
    networks,
    allNetworkNames extends string = [keyof networks] extends [never]
    ? string
    : keyof networks & string,
> = {
    network:
    | allNetworkNames
    | {
        [name in allNetworkNames]?: Prettify<
            AddressConfig &
            TransactionReceiptConfig &
            FunctionCallConfig &
            BlockConfig
        >;
    };
};

type NodeContractConfig<networks> = Prettify<
    GetContractNetwork<networks> &
    AddressConfig &
    TransactionReceiptConfig &
    FunctionCallConfig &
    BlockConfig
>;

type ContractNames = "AccessTime";

type NodeContractsConfig<networks, contracts> = {} extends contracts
    ? {}
    : {
        [name in ContractNames]: NodeContractConfig<networks>;
    };

// -- Accounts --

type GetAccountNetwork<
    networks,
    allNetworkNames extends string = [keyof networks] extends [never]
    ? string
    : keyof networks & string,
> = {
    network:
    | allNetworkNames
    | {
        [name in allNetworkNames]?: Prettify<
            AddressConfig & TransactionReceiptConfig & BlockConfig
        >;
    };
};

type AccountConfig<networks> = Prettify<
    GetAccountNetwork<networks> &
    Required<AddressConfig> &
    TransactionReceiptConfig &
    BlockConfig
>;

type AccountsConfig<networks, accounts> = {} extends accounts
    ? {}
    : {
        [name in keyof accounts]: AccountConfig<networks>;
    };

// -- Blocks --

type BlockFilterConfig = {
    startBlock?: number | "latest";
    endBlock?: number | "latest";
    interval?: number;
};

type GetBlockFilter<
    networks,
    allNetworkNames extends string = [keyof networks] extends [never]
    ? string
    : keyof networks & string,
> = BlockFilterConfig & {
    network:
    | allNetworkNames
    | {
        [name in allNetworkNames]?: BlockFilterConfig;
    };
};

type BlockFiltersConfig<networks = unknown, blocks = unknown> = {} extends blocks
    ? {}
    : {
        [name in keyof blocks]: GetBlockFilter<networks>;
    };

// -- createNodeConfig --

export type CreateNodeConfigReturnType<
    Networks,
    Contracts,
    Accounts,
    Blocks
> = {
    database?: DatabaseConfig;
    ordering?: "omnichain" | "multichain";
    networks: Networks;
    contracts: Contracts;
    accounts: Accounts;
    blocks: Blocks;
};

export const createNodeConfig = <
    const Networks,
    const Contracts = {},
    const Accounts = {},
    const Blocks = {},
>(config: {
    database?: DatabaseConfig;
    ordering?: "omnichain" | "multichain";
    networks: NetworksConfig<Narrow<Networks>>;
    contracts?: NodeContractsConfig<Networks, Narrow<Contracts>>;
    accounts?: AccountsConfig<Networks, Narrow<Accounts>>;
    blocks?: BlockFiltersConfig<Networks, Blocks>;
}): CreateNodeConfigReturnType<Networks, Contracts, Accounts, Blocks> =>
    config as Prettify<
        CreateNodeConfigReturnType<Networks, Contracts, Accounts, Blocks>
    >;
