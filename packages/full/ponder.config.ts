import { createConfig } from "ponder";
import nodeConfig from "../../node.config";
import { AccessTimeAbi } from "../../src/abis/AccessTimeAbi";

const fullContracts = Object.fromEntries(
  Object.entries(nodeConfig.contracts).map(([name, contract]) => {
    return [name, { ...contract, abi: AccessTimeAbi }];
  })
);

export default createConfig({
  ...nodeConfig,
  contracts: fullContracts
});
