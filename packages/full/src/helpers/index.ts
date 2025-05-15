import { StatisticTimeGap } from "@accesstimeio/accesstime-common";
import { Address, encodeAbiParameters, keccak256 } from "viem";

export const getWeekIndex = (timestamp: bigint) => timestamp / BigInt(StatisticTimeGap.WEEK);
export const getMonthIndex = (timestamp: bigint) => timestamp / BigInt(StatisticTimeGap.MONTH);

export const generateWeeklyStatisticId = (
    blockTimestamp: bigint,
    chainId: bigint,
    type: number,
    internalType: number,
    accessTime: Address
) => keccak256(encodeAbiParameters(
    [
        { type: "uint256" },
        { type: "uint256" },
        { type: "uint256" },
        { type: "uint8" },
        { type: "uint8" },
        { type: "address" }
    ],
    [getWeekIndex(blockTimestamp), chainId, BigInt(StatisticTimeGap.WEEK), type, internalType, accessTime]
));

export const generateMonthlyStatisticId = (
    blockTimestamp: bigint,
    chainId: bigint,
    type: number,
    internalType: number,
    accessTime: Address
) => keccak256(encodeAbiParameters(
    [
        { type: "uint256" },
        { type: "uint256" },
        { type: "uint256" },
        { type: "uint8" },
        { type: "uint8" },
        { type: "address" }
    ],
    [getMonthIndex(blockTimestamp), chainId, BigInt(StatisticTimeGap.MONTH), type, internalType, accessTime]
));

export const generateWeeklyIncomeStatisticId = (
    blockTimestamp: bigint,
    chainId: bigint,
    type: number,
    internalType: number,
    accessTime: Address,
    paymentMethod: Address
) => keccak256(encodeAbiParameters(
    [
        { type: "uint256" },
        { type: "uint256" },
        { type: "uint256" },
        { type: "uint8" },
        { type: "uint8" },
        { type: "address" },
        { type: "address" }
    ],
    [getWeekIndex(blockTimestamp), chainId, BigInt(StatisticTimeGap.WEEK), type, internalType, accessTime, paymentMethod]
));

export const generateMonthlyIncomeStatisticId = (
    blockTimestamp: bigint,
    chainId: bigint,
    type: number,
    internalType: number,
    accessTime: Address,
    paymentMethod: Address
) => keccak256(encodeAbiParameters(
    [
        { type: "uint256" },
        { type: "uint256" },
        { type: "uint256" },
        { type: "uint8" },
        { type: "uint8" },
        { type: "address" },
        { type: "address" }
    ],
    [getMonthIndex(blockTimestamp), chainId, BigInt(StatisticTimeGap.MONTH), type, internalType, accessTime, paymentMethod]
));
