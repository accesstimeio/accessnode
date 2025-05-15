import {
  StatisticIncomeType,
  StatisticNewUserType,
  StatisticSoldAccessTimeType,
  StatisticTimeGap,
  StatisticType,
  StatisticUserType,
  StatisticVoteType
} from "@accesstimeio/accesstime-common";
import { Address, encodeAbiParameters, keccak256 } from "viem";

export const shortenAddress = (address: Address) => {
  return `${address?.slice(0, 6)}…${address?.slice(-4)}`;
};

type GenerateCacheIdDetails =
    | { type: StatisticType.DEPLOY_COUNT }
    | { type: StatisticType.SOLD_ACCESSTIME; internalType: StatisticSoldAccessTimeType }
    | { type: StatisticType.USER; internalType: StatisticUserType }
    | { type: StatisticType.NEW_USER; internalType: StatisticNewUserType }
    | { type: StatisticType.VOTE; internalType: StatisticVoteType }
    | { type: StatisticType.INCOME; internalType: StatisticIncomeType; paymentMethod: Address };

export class Statistic {
    generateStatisticId(
        chainId: number,
        id: number,
        timeGap: StatisticTimeGap,
        details: GenerateCacheIdDetails
    ) {
        if (details.type == StatisticType.DEPLOY_COUNT) {
            return keccak256(
                encodeAbiParameters(
                    [
                        { type: "uint256" }, // chainId
                        { type: "uint256" }, // id
                        { type: "uint256" }, // timeGap
                        { type: "uint8" } // statisticType
                    ],
                    [BigInt(chainId), BigInt(id), BigInt(timeGap), details.type]
                )
            );
        } else if (details.type == StatisticType.INCOME) {
            return keccak256(
                encodeAbiParameters(
                    [
                        { type: "uint256" }, // chainId
                        { type: "uint256" }, // id
                        { type: "uint256" }, // timeGap
                        { type: "uint8" }, // statisticType
                        { type: "uint8" }, // statisticInternalType
                        { type: "address" } // paymentMethod
                    ],
                    [
                        BigInt(chainId),
                        BigInt(id),
                        BigInt(timeGap),
                        details.type,
                        details.internalType,
                        details.paymentMethod.toLowerCase() as Address
                    ]
                )
            );
        } else {
            return keccak256(
                encodeAbiParameters(
                    [
                        { type: "uint256" }, // chainId
                        { type: "uint256" }, // id
                        { type: "uint256" }, // timeGap
                        { type: "uint8" }, // statisticType
                        { type: "uint8" } // statisticInternalType
                    ],
                    [
                        BigInt(chainId),
                        BigInt(id),
                        BigInt(timeGap),
                        details.type,
                        details.internalType
                    ]
                )
            );
        }
    }

    generateIncomePonderStatisticId(
        timeIndex: bigint,
        timeGap: StatisticTimeGap,
        accessTime: Address,
        internalType: StatisticIncomeType,
        paymentMethod: Address
    ) {
        return keccak256(
            encodeAbiParameters(
                [
                    { type: "uint256" },
                    { type: "uint256" },
                    { type: "uint8" },
                    { type: "uint8" },
                    { type: "address" },
                    { type: "address" }
                ],
                [
                    timeIndex,
                    BigInt(timeGap),
                    StatisticType.INCOME,
                    internalType,
                    accessTime,
                    paymentMethod
                ]
            )
        );
    }

    currentTimestamp() {
        return BigInt(Date.now()) / 1000n;
    }

    currentWeekIndex() {
        return this.currentTimestamp() / BigInt(StatisticTimeGap.WEEK);
    }

    currentMonthIndex() {
        return this.currentTimestamp() / BigInt(StatisticTimeGap.MONTH);
    }
}
