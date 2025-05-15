import { createConfig } from "ponder";
import { Abi } from "viem";

import { AccessTimeAbi } from "../../src/abis/AccessTimeAbi";
import { NodeContractConfig } from "../../src/types";
import nodeConfig from "../../node.config";

type ContractWithAbi<A extends Abi> = {
  abi: A;
} & NodeContractConfig<typeof nodeConfig.networks>;

const fullContracts = {
  AccessTime: {
    ...nodeConfig.contracts.AccessTime,
    abi: AccessTimeAbi,
  }
} satisfies Record<string, ContractWithAbi<Abi>>;

export default createConfig({
  ...nodeConfig,
  contracts: fullContracts
});
