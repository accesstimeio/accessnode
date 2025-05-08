import { Address } from "ox/Address";

export const shortenAddress = (address: Address) => {
  return `${address?.slice(0, 6)}…${address?.slice(-4)}`;
};
