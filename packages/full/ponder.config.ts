import { createConfig } from "ponder";
import { Abi } from "viem";

import { AccessTimeAbi } from "../../src/abis/AccessTimeAbi";
import { AccessVoteAbi } from "../../src/abis/AccessVoteAbi";
import { NodeContractConfig } from "../../src/types";
import nodeConfig from "../../node.config";

type ContractWithAbi<A extends Abi> = {
  abi: A;
} & NodeContractConfig<typeof nodeConfig.networks>;

const filterAccessVoteNetworks = (
  accessTimeNetworks: Record<string, any>,
  accessVoteNetworks: Record<string, any>
) => {
  const includedNetworks = Object.keys(accessTimeNetworks);

  return Object.fromEntries(
    Object.entries(accessVoteNetworks).filter(([networkName]) =>
      includedNetworks.includes(networkName)
    )
  );
};

const accessTimeNetworks = nodeConfig.contracts.AccessTime?.network ?? {};
const accessVoteNetworks = nodeConfig.contracts.AccessVote?.network ?? {};

const fullContracts = {
  AccessTime: {
    ...nodeConfig.contracts.AccessTime,
    abi: AccessTimeAbi,
  },
  AccessVote: {
    ...nodeConfig.contracts.AccessVote,
    abi: AccessVoteAbi,
    network: filterAccessVoteNetworks(accessTimeNetworks, accessVoteNetworks),
  },
} satisfies Record<string, ContractWithAbi<Abi>>;

export default createConfig({
  ...nodeConfig,
  contracts: fullContracts,
});
