import { ponder } from "ponder:registry";
import {
  accessTime as accessTimeSchema,
  accessTimeUser as accessTimeUserSchema,
  purchase as purchaseSchema,
  user as userSchema,
  accessVote as accessVoteSchema,
  vote as voteSchema,
  weeklyVote as weeklyVoteSchema,
  statistic as statisticSchema
} from "ponder:schema";
import { Address, encodeAbiParameters, formatUnits, Hash, keccak256, parseAbi, parseEther, zeroAddress } from "viem";
import { AccessTimeAbi } from "../../../src/abis/AccessTimeAbi";
import { Contract, getFactoryAddress, StatisticIncomeType, StatisticNewUserType, StatisticSoldAccessTimeType, StatisticTimeGap, StatisticType, StatisticUserType, StatisticVoteType } from "@accesstimeio/accesstime-common";
import { generateMonthlyIncomeStatisticId, generateMonthlyStatisticId, generateWeeklyIncomeStatisticId, generateWeeklyStatisticId, getMonthIndex, getWeekIndex } from "./helpers";
import { and, desc, eq } from "ponder";

ponder.on("AccessTime:OwnershipTransferStarted", async ({ event, context }) => {
  const chainId = context.network.chainId;
  const accessTime = await context.db.find(accessTimeSchema, { id: event.log.address, chainId });

  if (accessTime != null) {
    await context.db
      .update(accessTimeSchema, { id: event.log.address, chainId })
      .set({ nextOwner: event.args.newOwner, updateTimestamp: event.block.timestamp });
  }
});

ponder.on("AccessTime:OwnershipTransferred", async ({ event, context }) => {
  const chainId = context.network.chainId;
  const accessTime = await context.db.find(accessTimeSchema, { id: event.log.address, chainId });

  if (accessTime != null) {
    await context.db
      .update(accessTimeSchema, { id: event.log.address, chainId })
      .set({
        prevOwner: event.args.previousOwner,
        owner: event.args.newOwner,
        nextOwner: zeroAddress,
        updateTimestamp: event.block.timestamp
      });
  } else {
    const deploymentDetails = await context.client.readContract({
      abi: Contract.abis.factory,
      address: getFactoryAddress(chainId),
      functionName: "deploymentDetails",
      args: [event.log.address]
    });

    await context.db.insert(accessTimeSchema).values({
      id: event.log.address,
      chainId,
      accessTimeId: deploymentDetails[1],
      owner: event.args.newOwner,
      updateTimestamp: event.block.timestamp
    });
  }
});

ponder.on("AccessTime:ExtraUpdated", async ({ event, context }) => {
  const chainId = context.network.chainId;
  const accessTime = await context.db.find(accessTimeSchema, { id: event.log.address, chainId });

  if (accessTime != null && accessTime.extraTimes && accessTime.removedExtraTimes) {
    const remove = event.args.percent == 0n;

    const exist = accessTime.extraTimes.find((extraId) => extraId == event.args.extraID);
    const removedExist = accessTime.removedExtraTimes.find((extraId) => extraId == event.args.extraID);

    let newExtraTime: bigint[] = accessTime.extraTimes;
    let newRemovedExtraTime: bigint[] = accessTime.removedExtraTimes;
    if (remove) {
      if (exist != undefined) {
        newExtraTime = accessTime.extraTimes.filter((extraId) => extraId != event.args.extraID);
      }
      if (removedExist == undefined) {
        newRemovedExtraTime = accessTime.removedExtraTimes.concat([event.args.extraID]);
      }
    } else {
      if (exist == undefined) {
        newExtraTime = accessTime.extraTimes.concat([event.args.extraID]);
      }
      if (removedExist != undefined) {
        newRemovedExtraTime = accessTime.removedExtraTimes.filter((extraId) => extraId != event.args.extraID);
      }
    }

    await context.db
      .update(accessTimeSchema, { id: event.log.address, chainId })
      .set({
        extraTimes: newExtraTime,
        removedExtraTimes: newRemovedExtraTime,
        updateTimestamp: event.block.timestamp
      });
  }
});

ponder.on("AccessTime:PackageUpdated", async ({ event, context }) => {
  const chainId = context.network.chainId;
  const accessTime = await context.db.find(accessTimeSchema, { id: event.log.address, chainId });

  if (accessTime != null && accessTime.packages && accessTime.removedPackages) {
    const remove = event.args.time == 0n;

    const exist = accessTime.packages.find((packageId) => packageId == event.args.packageID);
    const removedExist = accessTime.removedPackages.find((packageId) => packageId == event.args.packageID);

    let newPackages: bigint[] = accessTime.packages;
    let newRemovedPackages: bigint[] = accessTime.removedPackages;
    if (remove) {
      if (exist != undefined) {
        newPackages = accessTime.packages.filter((packageId) => packageId != event.args.packageID);
      }
      if (removedExist == undefined) {
        newRemovedPackages = accessTime.removedPackages.concat([event.args.packageID]);
      }
    } else {
      if (exist == undefined) {
        newPackages = accessTime.packages.concat([event.args.packageID]);
      }
      if (removedExist != undefined) {
        newRemovedPackages = accessTime.removedPackages.filter((packageId) => packageId != event.args.packageID);
      }
    }

    await context.db
      .update(accessTimeSchema, { id: event.log.address, chainId })
      .set({
        packages: newPackages,
        removedPackages: newRemovedPackages,
        updateTimestamp: event.block.timestamp
      });
  }
});

ponder.on("AccessTime:RateUpdate", async ({ event, context }) => {
  const chainId = context.network.chainId;
  const accessTime = await context.db.find(accessTimeSchema, { id: event.log.address, chainId });

  if (accessTime != null && accessTime.paymentMethods) {
    const remove = event.args.rate == 0n;

    const exist = accessTime.paymentMethods.find((token) => token.toLowerCase() == event.args.paymentToken.toLowerCase());

    let newPaymentMethods: Address[] = accessTime.paymentMethods;
    if (remove) {
      if (exist) {
        newPaymentMethods = accessTime.paymentMethods.filter((token) => token.toLowerCase() != event.args.paymentToken.toLowerCase());
      }
    } else {
      if (!exist) {
        newPaymentMethods = accessTime.paymentMethods.concat([event.args.paymentToken]);
      }
    }

    await context.db
      .update(accessTimeSchema, { id: event.log.address, chainId })
      .set({
        paymentMethods: newPaymentMethods,
        updateTimestamp: event.block.timestamp
      });
  }
});

ponder.on("AccessTime:Paused", async ({ event, context }) => {
  const chainId = context.network.chainId;
  const accessTime = await context.db.find(accessTimeSchema, { id: event.log.address, chainId });

  if (accessTime != null) {
    await context.db
      .update(accessTimeSchema, { id: event.log.address, chainId })
      .set({ paused: true, updateTimestamp: event.block.timestamp });
  }
});

ponder.on("AccessTime:Unpaused", async ({ event, context }) => {
  const chainId = context.network.chainId;
  const accessTime = await context.db.find(accessTimeSchema, { id: event.log.address, chainId });

  if (accessTime != null) {
    await context.db
      .update(accessTimeSchema, { id: event.log.address, chainId })
      .set({ paused: false, updateTimestamp: event.block.timestamp });
  }
});

ponder.on("AccessTime:Purchased", async ({ event, context }) => {
  const chainId = context.network.chainId;
  const accessTimeUserId = keccak256(encodeAbiParameters(
    [{ type: "address" }, { type: "address" }],
    [event.log.address, event.args.user]
  ));

  const accessTimeUser = await context.db.find(accessTimeUserSchema, { id: accessTimeUserId, chainId });
  const paymentMethodRate = await context.client.readContract({
    abi: AccessTimeAbi,
    address: event.log.address,
    functionName: "tokenRates",
    args: [event.args.paymentToken]
  });
  const paymentAmount = (((event.args.amount * parseEther("1")) / 3600n) * paymentMethodRate) / parseEther("1");

  let paymentMethodDecimal: number = 18;
  let paymentMethodSymbol: string = "ETH";
  if (event.args.paymentToken != zeroAddress) {
    try {
      paymentMethodDecimal = await context.client.readContract({
        abi: parseAbi(["function decimals() view returns (uint8)"]),
        address: event.args.paymentToken,
        functionName: "decimals"
      });

      paymentMethodSymbol = await context.client.readContract({
        abi: parseAbi(["function symbol() view returns (string)"]),
        address: event.args.paymentToken,
        functionName: "symbol"
      });
    } catch (error) {
      console.log("PaymentMethodDetail:read failed", error);
    }
  }

  const formattedPaymentAmount = formatUnits(paymentAmount, paymentMethodDecimal);

  await context.db.insert(purchaseSchema).values({
    id: event.transaction.hash,
    chainId,
    address: event.args.user,
    accessTimeAddress: event.log.address,
    accessTimeUserId,
    amount: event.args.amount,
    paymentAmount,
    formattedPaymentAmount,
    symbol: paymentMethodSymbol,
    paymentMethod: event.args.paymentToken,
    packageId: -1n,
    timestamp: event.block.timestamp
  });

  // sold accesstime statistic, project
  const stSoldAccessTimeValue = event.args.amount;
  const stSoldAccessTimeInternalTypes = [StatisticSoldAccessTimeType.PROJECT];
  const stSoldAccessTimeAddresses = [event.log.address];
  for (let i = 0; i < stSoldAccessTimeInternalTypes.length; i++) {
    const stSoldAccessTimeAddress = stSoldAccessTimeAddresses[i];
    const stSoldAccessTimeInternalType = stSoldAccessTimeInternalTypes[i];

    if (!stSoldAccessTimeInternalType || !stSoldAccessTimeAddress) {
      continue;
    }

    const stSoldAccessTimeWeeklyId = generateWeeklyStatisticId(
      event.block.timestamp,
      BigInt(chainId),
      StatisticType.SOLD_ACCESSTIME,
      stSoldAccessTimeInternalType,
      stSoldAccessTimeAddress
    );
    const stSoldAccessTimeMonthlyId = generateMonthlyStatisticId(
      event.block.timestamp,
      BigInt(chainId),
      StatisticType.SOLD_ACCESSTIME,
      stSoldAccessTimeInternalType,
      stSoldAccessTimeAddress
    );

    const stSoldAccessTimeWeekly = await context.db.find(statisticSchema, { id: stSoldAccessTimeWeeklyId, chainId });
    const stSoldAccessTimeMonthly = await context.db.find(statisticSchema, { id: stSoldAccessTimeMonthlyId, chainId });

    if (stSoldAccessTimeWeekly == null) {
      await context.db.insert(statisticSchema).values({
        id: stSoldAccessTimeWeeklyId,
        chainId,
        value: stSoldAccessTimeValue,
        timeIndex: getWeekIndex(event.block.timestamp),
        timeGap: BigInt(StatisticTimeGap.WEEK),
        type: StatisticType.SOLD_ACCESSTIME,
        internalType: stSoldAccessTimeInternalType,
        address: stSoldAccessTimeAddress
      });
    } else {
      await context.db
        .update(statisticSchema, {
          id: stSoldAccessTimeWeeklyId,
          chainId,
        })
        .set({
          value: stSoldAccessTimeWeekly.value + stSoldAccessTimeValue
        });
    }

    if (stSoldAccessTimeMonthly == null) {
      await context.db.insert(statisticSchema).values({
        id: stSoldAccessTimeMonthlyId,
        chainId,
        value: stSoldAccessTimeValue,
        timeIndex: getMonthIndex(event.block.timestamp),
        timeGap: BigInt(StatisticTimeGap.MONTH),
        type: StatisticType.SOLD_ACCESSTIME,
        internalType: stSoldAccessTimeInternalType,
        address: stSoldAccessTimeAddress
      });
    } else {
      await context.db
        .update(statisticSchema, {
          id: stSoldAccessTimeMonthlyId,
          chainId,
        })
        .set({
          value: stSoldAccessTimeMonthly.value + stSoldAccessTimeValue
        });
    }
  }

  // income statistics, project | cumulative projects
  const stIncomePCInternalTypes = [StatisticIncomeType.CUMULATIVE_PROJECTS, StatisticIncomeType.PROJECT];
  const stIncomePCAddresses = [zeroAddress, event.log.address];
  for (let i = 0; i < stIncomePCInternalTypes.length; i++) {
    const stIncomePCAddress = stIncomePCAddresses[i];
    const stIncomePCInternalType = stIncomePCInternalTypes[i];

    if (!stIncomePCInternalType || !stIncomePCAddress) {
      continue;
    }

    const stIncomePCWeeklyId = generateWeeklyIncomeStatisticId(
      event.block.timestamp,
      BigInt(chainId),
      StatisticType.INCOME,
      stIncomePCInternalType,
      stIncomePCAddress,
      event.args.paymentToken
    );
    const stIncomePCMonthlyId = generateMonthlyIncomeStatisticId(
      event.block.timestamp,
      BigInt(chainId),
      StatisticType.INCOME,
      stIncomePCInternalType,
      stIncomePCAddress,
      event.args.paymentToken
    );

    const stIncomePCWeekly = await context.db.find(statisticSchema, { id: stIncomePCWeeklyId, chainId });
    const stIncomePCMonthly = await context.db.find(statisticSchema, { id: stIncomePCMonthlyId, chainId });

    if (stIncomePCWeekly == null) {
      await context.db.insert(statisticSchema).values({
        id: stIncomePCWeeklyId,
        chainId,
        value: paymentAmount,
        timeIndex: getWeekIndex(event.block.timestamp),
        timeGap: BigInt(StatisticTimeGap.WEEK),
        type: StatisticType.INCOME,
        internalType: stIncomePCInternalType,
        address: stIncomePCAddress
      });
    } else {
      await context.db
        .update(statisticSchema, {
          id: stIncomePCWeeklyId,
          chainId,
        })
        .set({
          value: stIncomePCWeekly.value + paymentAmount
        });
    }

    if (stIncomePCMonthly == null) {
      await context.db.insert(statisticSchema).values({
        id: stIncomePCMonthlyId,
        chainId,
        value: paymentAmount,
        timeIndex: getMonthIndex(event.block.timestamp),
        timeGap: BigInt(StatisticTimeGap.MONTH),
        type: StatisticType.INCOME,
        internalType: stIncomePCInternalType,
        address: stIncomePCAddress
      });
    } else {
      await context.db
        .update(statisticSchema, {
          id: stIncomePCMonthlyId,
          chainId,
        })
        .set({
          value: stIncomePCMonthly.value + paymentAmount
        });
    }
  }

  const user = await context.db.find(userSchema, { id: event.args.user });

  if (user == null) {
    await context.db.insert(userSchema).values({ id: event.args.user, endTime: event.block.timestamp + event.args.amount });

    // new user statistic, cumulative projects
    const stNewUserPCValue = 1n;
    const stNewUserPCInternalTypes = [StatisticNewUserType.CUMULATIVE_PROJECTS];
    const stNewUserPCAddresses = [zeroAddress];
    for (let i = 0; i < stNewUserPCInternalTypes.length; i++) {
      const stNewUserPCAddress = stNewUserPCAddresses[i];
      const stNewUserPCInternalType = stNewUserPCInternalTypes[i];

      if (!stNewUserPCInternalType || !stNewUserPCAddress) {
        continue;
      }

      const stNewUserPCWeeklyId = generateWeeklyStatisticId(
        event.block.timestamp,
        BigInt(chainId),
        StatisticType.NEW_USER,
        stNewUserPCInternalType,
        stNewUserPCAddress
      );
      const stNewUserPCMonthlyId = generateMonthlyStatisticId(
        event.block.timestamp,
        BigInt(chainId),
        StatisticType.NEW_USER,
        stNewUserPCInternalType,
        stNewUserPCAddress
      );

      const stNewUserPCWeekly = await context.db.find(statisticSchema, { id: stNewUserPCWeeklyId, chainId });
      const stNewUserPCMonthly = await context.db.find(statisticSchema, { id: stNewUserPCMonthlyId, chainId });

      if (stNewUserPCWeekly == null) {
        await context.db.insert(statisticSchema).values({
          id: stNewUserPCWeeklyId,
          chainId,
          value: stNewUserPCValue,
          timeIndex: getWeekIndex(event.block.timestamp),
          timeGap: BigInt(StatisticTimeGap.WEEK),
          type: StatisticType.NEW_USER,
          internalType: stNewUserPCInternalType,
          address: stNewUserPCAddress
        });
      } else {
        await context.db
          .update(statisticSchema, {
            id: stNewUserPCWeeklyId,
            chainId,
          })
          .set({
            value: stNewUserPCWeekly.value + stNewUserPCValue
          });
      }

      if (stNewUserPCMonthly == null) {
        await context.db.insert(statisticSchema).values({
          id: stNewUserPCMonthlyId,
          chainId,
          value: stNewUserPCValue,
          timeIndex: getMonthIndex(event.block.timestamp),
          timeGap: BigInt(StatisticTimeGap.MONTH),
          type: StatisticType.NEW_USER,
          internalType: stNewUserPCInternalType,
          address: stNewUserPCAddress
        });
      } else {
        await context.db
          .update(statisticSchema, {
            id: stNewUserPCMonthlyId,
            chainId,
          })
          .set({
            value: stNewUserPCMonthly.value + stNewUserPCValue
          });
      }
    }
  } else {
    let startTime: bigint = event.block.timestamp > user.endTime ? event.block.timestamp : user.endTime;

    await context.db.update(userSchema, { id: event.args.user }).set({
      endTime: startTime + event.args.amount
    });
  }

  if (accessTimeUser == null) {
    await context.db.insert(accessTimeUserSchema).values({
      id: accessTimeUserId,
      chainId,
      address: event.args.user,
      endTime: event.block.timestamp + event.args.amount,
      accessTimeAddress: event.log.address,
      totalPurchasedTime: event.args.amount,
      usedPaymentMethods: [event.args.paymentToken]
    });

    // new user statistic, project
    const stNewUserPCValue = 1n;
    const stNewUserPCInternalTypes = [StatisticNewUserType.PROJECT];
    const stNewUserPCAddresses = [event.log.address];
    for (let i = 0; i < stNewUserPCInternalTypes.length; i++) {
      const stNewUserPCAddress = stNewUserPCAddresses[i];
      const stNewUserPCInternalType = stNewUserPCInternalTypes[i];

      if (!stNewUserPCInternalType || !stNewUserPCAddress) {
        continue;
      }

      const stNewUserPCWeeklyId = generateWeeklyStatisticId(
        event.block.timestamp,
        BigInt(chainId),
        StatisticType.NEW_USER,
        stNewUserPCInternalType,
        stNewUserPCAddress
      );
      const stNewUserPCMonthlyId = generateMonthlyStatisticId(
        event.block.timestamp,
        BigInt(chainId),
        StatisticType.NEW_USER,
        stNewUserPCInternalType,
        stNewUserPCAddress
      );

      const stNewUserPCWeekly = await context.db.find(statisticSchema, { id: stNewUserPCWeeklyId, chainId });
      const stNewUserPCMonthly = await context.db.find(statisticSchema, { id: stNewUserPCMonthlyId, chainId });

      if (stNewUserPCWeekly == null) {
        await context.db.insert(statisticSchema).values({
          id: stNewUserPCWeeklyId,
          chainId,
          value: stNewUserPCValue,
          timeIndex: getWeekIndex(event.block.timestamp),
          timeGap: BigInt(StatisticTimeGap.WEEK),
          type: StatisticType.NEW_USER,
          internalType: stNewUserPCInternalType,
          address: stNewUserPCAddress
        });
      } else {
        await context.db
          .update(statisticSchema, {
            id: stNewUserPCWeeklyId,
            chainId,
          })
          .set({
            value: stNewUserPCWeekly.value + stNewUserPCValue
          });
      }

      if (stNewUserPCMonthly == null) {
        await context.db.insert(statisticSchema).values({
          id: stNewUserPCMonthlyId,
          chainId,
          value: stNewUserPCValue,
          timeIndex: getMonthIndex(event.block.timestamp),
          timeGap: BigInt(StatisticTimeGap.MONTH),
          type: StatisticType.NEW_USER,
          internalType: stNewUserPCInternalType,
          address: stNewUserPCAddress
        });
      } else {
        await context.db
          .update(statisticSchema, {
            id: stNewUserPCMonthlyId,
            chainId,
          })
          .set({
            value: stNewUserPCMonthly.value + stNewUserPCValue
          });
      }
    }
    // total user statistic, project
    const stTotalUserProjectWeeklyId = generateWeeklyStatisticId(
      event.block.timestamp,
      BigInt(chainId),
      StatisticType.USER,
      StatisticUserType.PROJECT,
      event.log.address
    );
    const stTotalUserProjectMonthlyId = generateMonthlyStatisticId(
      event.block.timestamp,
      BigInt(chainId),
      StatisticType.USER,
      StatisticUserType.PROJECT,
      event.log.address
    );

    const stTotalUserProjectWeekly = await context.db.find(statisticSchema, { id: stTotalUserProjectWeeklyId, chainId });
    const stTotalUserProjectMonthly = await context.db.find(statisticSchema, { id: stTotalUserProjectMonthlyId, chainId });

    if (stTotalUserProjectWeekly == null) {
      let startValue: bigint = 1n;
      const stTotalUserProjectLastWeek = await context.db.sql.select().from(statisticSchema)
        .where(and(
          eq(statisticSchema.timeGap, BigInt(StatisticTimeGap.WEEK)),
          eq(statisticSchema.internalType, StatisticUserType.PROJECT),
          eq(statisticSchema.address, event.log.address)
        ))
        .orderBy(desc(statisticSchema.timeIndex))
        .limit(1);

      if (stTotalUserProjectLastWeek != null && stTotalUserProjectLastWeek[0]) {
        startValue = stTotalUserProjectLastWeek[0].value + 1n;
      }

      await context.db.insert(statisticSchema).values({
        id: stTotalUserProjectWeeklyId,
        chainId,
        value: startValue,
        timeIndex: getWeekIndex(event.block.timestamp),
        timeGap: BigInt(StatisticTimeGap.WEEK),
        type: StatisticType.USER,
        internalType: StatisticUserType.PROJECT,
        address: event.log.address
      });
    } else {
      await context.db
        .update(statisticSchema, {
          id: stTotalUserProjectWeeklyId,
          chainId,
        })
        .set({
          value: stTotalUserProjectWeekly.value + 1n
        });
    }

    if (stTotalUserProjectMonthly == null) {
      let startValue: bigint = 1n;
      const stTotalUserProjectLastMonth = await context.db.sql.select().from(statisticSchema)
        .where(and(
          eq(statisticSchema.timeGap, BigInt(StatisticTimeGap.MONTH)),
          eq(statisticSchema.internalType, StatisticUserType.PROJECT),
          eq(statisticSchema.address, event.log.address)
        ))
        .orderBy(desc(statisticSchema.timeIndex))
        .limit(1);

      if (stTotalUserProjectLastMonth != null && stTotalUserProjectLastMonth[0]) {
        startValue = stTotalUserProjectLastMonth[0].value + 1n;
      }

      await context.db.insert(statisticSchema).values({
        id: stTotalUserProjectMonthlyId,
        chainId,
        value: startValue,
        timeIndex: getMonthIndex(event.block.timestamp),
        timeGap: BigInt(StatisticTimeGap.MONTH),
        type: StatisticType.USER,
        internalType: StatisticUserType.PROJECT,
        address: event.log.address
      });
    } else {
      await context.db
        .update(statisticSchema, {
          id: stTotalUserProjectMonthlyId,
          chainId,
        })
        .set({
          value: stTotalUserProjectMonthly.value + 1n
        });
    }
  } else {
    let startTime: bigint = event.block.timestamp > accessTimeUser.endTime ? event.block.timestamp : accessTimeUser.endTime;
    let newUsedPaymentMethods = accessTimeUser.usedPaymentMethods;
    const existPaymentMethod = newUsedPaymentMethods.find(
      (paymentMethod) => paymentMethod.toLowerCase() == event.args.paymentToken.toLowerCase()
    );

    if (!existPaymentMethod) {
      newUsedPaymentMethods.push(event.args.paymentToken);
    }

    await context.db.update(accessTimeUserSchema, { id: accessTimeUserId, chainId }).set({
      endTime: startTime + event.args.amount,
      totalPurchasedTime: accessTimeUser.totalPurchasedTime + event.args.amount,
      usedPaymentMethods: newUsedPaymentMethods
    });
  }
});

ponder.on("AccessTime:PurchasedPackage", async ({ event, context }) => {
  const chainId = context.network.chainId;
  const accessTimeUserId = keccak256(encodeAbiParameters(
    [{ type: "address" }, { type: "address" }],
    [event.log.address, event.args.user]
  ));

  const accessTimeUser = await context.db.find(accessTimeUserSchema, { id: accessTimeUserId, chainId });
  const paymentMethodRate = await context.client.readContract({
    abi: AccessTimeAbi,
    address: event.log.address,
    functionName: "tokenRates",
    args: [event.args.paymentToken]
  });
  const paymentAmount = (((event.args.amount * parseEther("1")) / 3600n) * paymentMethodRate) / parseEther("1");

  let paymentMethodDecimal: number = 18;
  let paymentMethodSymbol: string = "ETH";
  if (event.args.paymentToken != zeroAddress) {
    try {
      paymentMethodDecimal = await context.client.readContract({
        abi: parseAbi(["function decimals() view returns (uint8)"]),
        address: event.args.paymentToken,
        functionName: "decimals"
      });

      paymentMethodSymbol = await context.client.readContract({
        abi: parseAbi(["function symbol() view returns (string)"]),
        address: event.args.paymentToken,
        functionName: "symbol"
      });
    } catch (error) {
      console.log("PaymentMethodDetail:read failed", error);
    }
  }

  const formattedPaymentAmount = formatUnits(paymentAmount, paymentMethodDecimal);

  await context.db.insert(purchaseSchema).values({
    id: event.transaction.hash,
    chainId,
    address: event.args.user,
    accessTimeAddress: event.log.address,
    accessTimeUserId,
    amount: event.args.amount,
    paymentAmount,
    formattedPaymentAmount,
    symbol: paymentMethodSymbol,
    paymentMethod: event.args.paymentToken,
    packageId: event.args.packageID,
    timestamp: event.block.timestamp
  });

  // sold accesstime statistic, project
  const stSoldAccessTimeValue = event.args.amount;
  const stSoldAccessTimeInternalTypes = [StatisticSoldAccessTimeType.PROJECT];
  const stSoldAccessTimeAddresses = [event.log.address];
  for (let i = 0; i < stSoldAccessTimeInternalTypes.length; i++) {
    const stSoldAccessTimeAddress = stSoldAccessTimeAddresses[i];
    const stSoldAccessTimeInternalType = stSoldAccessTimeInternalTypes[i];

    if (!stSoldAccessTimeInternalType || !stSoldAccessTimeAddress) {
      continue;
    }

    const stSoldAccessTimeWeeklyId = generateWeeklyStatisticId(
      event.block.timestamp,
      BigInt(chainId),
      StatisticType.SOLD_ACCESSTIME,
      stSoldAccessTimeInternalType,
      stSoldAccessTimeAddress
    );
    const stSoldAccessTimeMonthlyId = generateMonthlyStatisticId(
      event.block.timestamp,
      BigInt(chainId),
      StatisticType.SOLD_ACCESSTIME,
      stSoldAccessTimeInternalType,
      stSoldAccessTimeAddress
    );

    const stSoldAccessTimeWeekly = await context.db.find(statisticSchema, { id: stSoldAccessTimeWeeklyId, chainId });
    const stSoldAccessTimeMonthly = await context.db.find(statisticSchema, { id: stSoldAccessTimeMonthlyId, chainId });

    if (stSoldAccessTimeWeekly == null) {
      await context.db.insert(statisticSchema).values({
        id: stSoldAccessTimeWeeklyId,
        chainId,
        value: stSoldAccessTimeValue,
        timeIndex: getWeekIndex(event.block.timestamp),
        timeGap: BigInt(StatisticTimeGap.WEEK),
        type: StatisticType.SOLD_ACCESSTIME,
        internalType: stSoldAccessTimeInternalType,
        address: stSoldAccessTimeAddress
      });
    } else {
      await context.db
        .update(statisticSchema, {
          id: stSoldAccessTimeWeeklyId, chainId
        })
        .set({
          value: stSoldAccessTimeWeekly.value + stSoldAccessTimeValue
        });
    }

    if (stSoldAccessTimeMonthly == null) {
      await context.db.insert(statisticSchema).values({
        id: stSoldAccessTimeMonthlyId,
        chainId,
        value: stSoldAccessTimeValue,
        timeIndex: getMonthIndex(event.block.timestamp),
        timeGap: BigInt(StatisticTimeGap.MONTH),
        type: StatisticType.SOLD_ACCESSTIME,
        internalType: stSoldAccessTimeInternalType,
        address: stSoldAccessTimeAddress
      });
    } else {
      await context.db
        .update(statisticSchema, {
          id: stSoldAccessTimeMonthlyId,
          chainId,
        })
        .set({
          value: stSoldAccessTimeMonthly.value + stSoldAccessTimeValue
        });
    }
  }

  // income statistics, project | cumulative projects
  const stIncomePCInternalTypes = [StatisticIncomeType.CUMULATIVE_PROJECTS, StatisticIncomeType.PROJECT];
  const stIncomePCAddresses = [zeroAddress, event.log.address];
  for (let i = 0; i < stIncomePCInternalTypes.length; i++) {
    const stIncomePCAddress = stIncomePCAddresses[i];
    const stIncomePCInternalType = stIncomePCInternalTypes[i];

    if (!stIncomePCInternalType || !stIncomePCAddress) {
      continue;
    }

    const stIncomePCWeeklyId = generateWeeklyIncomeStatisticId(
      event.block.timestamp,
      BigInt(chainId),
      StatisticType.INCOME,
      stIncomePCInternalType,
      stIncomePCAddress,
      event.args.paymentToken
    );
    const stIncomePCMonthlyId = generateMonthlyIncomeStatisticId(
      event.block.timestamp,
      BigInt(chainId),
      StatisticType.INCOME,
      stIncomePCInternalType,
      stIncomePCAddress,
      event.args.paymentToken
    );

    const stIncomePCWeekly = await context.db.find(statisticSchema, { id: stIncomePCWeeklyId, chainId });
    const stIncomePCMonthly = await context.db.find(statisticSchema, { id: stIncomePCMonthlyId, chainId });

    if (stIncomePCWeekly == null) {
      await context.db.insert(statisticSchema).values({
        id: stIncomePCWeeklyId,
        chainId,
        value: paymentAmount,
        timeIndex: getWeekIndex(event.block.timestamp),
        timeGap: BigInt(StatisticTimeGap.WEEK),
        type: StatisticType.INCOME,
        internalType: stIncomePCInternalType,
        address: stIncomePCAddress
      });
    } else {
      await context.db
        .update(statisticSchema, {
          id: stIncomePCWeeklyId,
          chainId,
        })
        .set({
          value: stIncomePCWeekly.value + paymentAmount
        });
    }

    if (stIncomePCMonthly == null) {
      await context.db.insert(statisticSchema).values({
        id: stIncomePCMonthlyId,
        chainId,
        value: paymentAmount,
        timeIndex: getMonthIndex(event.block.timestamp),
        timeGap: BigInt(StatisticTimeGap.MONTH),
        type: StatisticType.INCOME,
        internalType: stIncomePCInternalType,
        address: stIncomePCAddress
      });
    } else {
      await context.db
        .update(statisticSchema, {
          id: stIncomePCMonthlyId,
          chainId,
        })
        .set({
          value: stIncomePCMonthly.value + paymentAmount
        });
    }
  }

  const user = await context.db.find(userSchema, { id: event.args.user });

  if (user == null) {
    await context.db.insert(userSchema).values({ id: event.args.user, endTime: event.block.timestamp + event.args.amount });

    // new user statistic, cumulative projects
    const stNewUserPCValue = 1n;
    const stNewUserPCInternalTypes = [StatisticNewUserType.CUMULATIVE_PROJECTS];
    const stNewUserPCAddresses = [zeroAddress];
    for (let i = 0; i < stNewUserPCInternalTypes.length; i++) {
      const stNewUserPCAddress = stNewUserPCAddresses[i];
      const stNewUserPCInternalType = stNewUserPCInternalTypes[i];

      if (!stNewUserPCInternalType || !stNewUserPCAddress) {
        continue;
      }

      const stNewUserPCWeeklyId = generateWeeklyStatisticId(
        event.block.timestamp,
        BigInt(chainId),
        StatisticType.NEW_USER,
        stNewUserPCInternalType,
        stNewUserPCAddress
      );
      const stNewUserPCMonthlyId = generateMonthlyStatisticId(
        event.block.timestamp,
        BigInt(chainId),
        StatisticType.NEW_USER,
        stNewUserPCInternalType,
        stNewUserPCAddress
      );

      const stNewUserPCWeekly = await context.db.find(statisticSchema, { id: stNewUserPCWeeklyId, chainId });
      const stNewUserPCMonthly = await context.db.find(statisticSchema, { id: stNewUserPCMonthlyId, chainId });

      if (stNewUserPCWeekly == null) {
        await context.db.insert(statisticSchema).values({
          id: stNewUserPCWeeklyId,
          chainId,
          value: stNewUserPCValue,
          timeIndex: getWeekIndex(event.block.timestamp),
          timeGap: BigInt(StatisticTimeGap.WEEK),
          type: StatisticType.NEW_USER,
          internalType: stNewUserPCInternalType,
          address: stNewUserPCAddress
        });
      } else {
        await context.db
          .update(statisticSchema, {
            id: stNewUserPCWeeklyId,
            chainId,
          })
          .set({
            value: stNewUserPCWeekly.value + stNewUserPCValue
          });
      }

      if (stNewUserPCMonthly == null) {
        await context.db.insert(statisticSchema).values({
          id: stNewUserPCMonthlyId,
          chainId,
          value: stNewUserPCValue,
          timeIndex: getMonthIndex(event.block.timestamp),
          timeGap: BigInt(StatisticTimeGap.MONTH),
          type: StatisticType.NEW_USER,
          internalType: stNewUserPCInternalType,
          address: stNewUserPCAddress
        });
      } else {
        await context.db
          .update(statisticSchema, {
            id: stNewUserPCMonthlyId,
            chainId,
          })
          .set({
            value: stNewUserPCMonthly.value + stNewUserPCValue
          });
      }
    }
  } else {
    let startTime: bigint = event.block.timestamp > user.endTime ? event.block.timestamp : user.endTime;

    await context.db.update(userSchema, { id: event.args.user }).set({
      endTime: startTime + event.args.amount
    });
  }

  if (accessTimeUser == null) {
    await context.db.insert(accessTimeUserSchema).values({
      id: accessTimeUserId,
      chainId,
      address: event.args.user,
      endTime: event.block.timestamp + event.args.amount,
      accessTimeAddress: event.log.address,
      totalPurchasedTime: event.args.amount,
      usedPaymentMethods: [event.args.paymentToken]
    });

    // new user statistic, project
    const stNewUserPCValue = 1n;
    const stNewUserPCInternalTypes = [StatisticNewUserType.PROJECT];
    const stNewUserPCAddresses = [event.log.address];
    for (let i = 0; i < stNewUserPCInternalTypes.length; i++) {
      const stNewUserPCAddress = stNewUserPCAddresses[i];
      const stNewUserPCInternalType = stNewUserPCInternalTypes[i];

      if (!stNewUserPCInternalType || !stNewUserPCAddress) {
        continue;
      }

      const stNewUserPCWeeklyId = generateWeeklyStatisticId(
        event.block.timestamp,
        BigInt(chainId),
        StatisticType.NEW_USER,
        stNewUserPCInternalType,
        stNewUserPCAddress
      );
      const stNewUserPCMonthlyId = generateMonthlyStatisticId(
        event.block.timestamp,
        BigInt(chainId),
        StatisticType.NEW_USER,
        stNewUserPCInternalType,
        stNewUserPCAddress
      );

      const stNewUserPCWeekly = await context.db.find(statisticSchema, { id: stNewUserPCWeeklyId, chainId });
      const stNewUserPCMonthly = await context.db.find(statisticSchema, { id: stNewUserPCMonthlyId, chainId });

      if (stNewUserPCWeekly == null) {
        await context.db.insert(statisticSchema).values({
          id: stNewUserPCWeeklyId,
          chainId,
          value: stNewUserPCValue,
          timeIndex: getWeekIndex(event.block.timestamp),
          timeGap: BigInt(StatisticTimeGap.WEEK),
          type: StatisticType.NEW_USER,
          internalType: stNewUserPCInternalType,
          address: stNewUserPCAddress
        });
      } else {
        await context.db
          .update(statisticSchema, {
            id: stNewUserPCWeeklyId,
            chainId,
          })
          .set({
            value: stNewUserPCWeekly.value + stNewUserPCValue
          });
      }

      if (stNewUserPCMonthly == null) {
        await context.db.insert(statisticSchema).values({
          id: stNewUserPCMonthlyId,
          chainId,
          value: stNewUserPCValue,
          timeIndex: getMonthIndex(event.block.timestamp),
          timeGap: BigInt(StatisticTimeGap.MONTH),
          type: StatisticType.NEW_USER,
          internalType: stNewUserPCInternalType,
          address: stNewUserPCAddress
        });
      } else {
        await context.db
          .update(statisticSchema, {
            id: stNewUserPCMonthlyId,
            chainId,
          })
          .set({
            value: stNewUserPCMonthly.value + stNewUserPCValue
          });
      }
    }
    // total user statistic, project
    const stTotalUserProjectWeeklyId = generateWeeklyStatisticId(
      event.block.timestamp,
      BigInt(chainId),
      StatisticType.USER,
      StatisticUserType.PROJECT,
      event.log.address
    );
    const stTotalUserProjectMonthlyId = generateMonthlyStatisticId(
      event.block.timestamp,
      BigInt(chainId),
      StatisticType.USER,
      StatisticUserType.PROJECT,
      event.log.address
    );

    const stTotalUserProjectWeekly = await context.db.find(statisticSchema, { id: stTotalUserProjectWeeklyId, chainId });
    const stTotalUserProjectMonthly = await context.db.find(statisticSchema, { id: stTotalUserProjectMonthlyId, chainId });

    if (stTotalUserProjectWeekly == null) {
      let startValue: bigint = 1n;
      const stTotalUserProjectLastWeek = await context.db.sql.select().from(statisticSchema)
        .where(and(
          eq(statisticSchema.timeGap, BigInt(StatisticTimeGap.WEEK)),
          eq(statisticSchema.internalType, StatisticUserType.PROJECT),
          eq(statisticSchema.address, event.log.address)
        ))
        .orderBy(desc(statisticSchema.timeIndex))
        .limit(1);

      if (stTotalUserProjectLastWeek != null && stTotalUserProjectLastWeek[0]) {
        startValue = stTotalUserProjectLastWeek[0].value + 1n;
      }

      await context.db.insert(statisticSchema).values({
        id: stTotalUserProjectWeeklyId,
        chainId,
        value: startValue,
        timeIndex: getWeekIndex(event.block.timestamp),
        timeGap: BigInt(StatisticTimeGap.WEEK),
        type: StatisticType.USER,
        internalType: StatisticUserType.PROJECT,
        address: event.log.address
      });
    } else {
      await context.db
        .update(statisticSchema, {
          id: stTotalUserProjectWeeklyId,
          chainId,
        })
        .set({
          value: stTotalUserProjectWeekly.value + 1n
        });
    }

    if (stTotalUserProjectMonthly == null) {
      let startValue: bigint = 1n;
      const stTotalUserProjectLastMonth = await context.db.sql.select().from(statisticSchema)
        .where(and(
          eq(statisticSchema.timeGap, BigInt(StatisticTimeGap.MONTH)),
          eq(statisticSchema.internalType, StatisticUserType.PROJECT),
          eq(statisticSchema.address, event.log.address)
        ))
        .orderBy(desc(statisticSchema.timeIndex))
        .limit(1);

      if (stTotalUserProjectLastMonth != null && stTotalUserProjectLastMonth[0]) {
        startValue = stTotalUserProjectLastMonth[0].value + 1n;
      }

      await context.db.insert(statisticSchema).values({
        id: stTotalUserProjectMonthlyId,
        chainId,
        value: startValue,
        timeIndex: getMonthIndex(event.block.timestamp),
        timeGap: BigInt(StatisticTimeGap.MONTH),
        type: StatisticType.USER,
        internalType: StatisticUserType.PROJECT,
        address: event.log.address
      });
    } else {
      await context.db
        .update(statisticSchema, {
          id: stTotalUserProjectMonthlyId,
          chainId,
        })
        .set({
          value: stTotalUserProjectMonthly.value + 1n
        });
    }
  } else {
    let startTime: bigint = event.block.timestamp > accessTimeUser.endTime ? event.block.timestamp : accessTimeUser.endTime;
    let newUsedPaymentMethods = accessTimeUser.usedPaymentMethods;
    const existPaymentMethod = newUsedPaymentMethods.find(
      (paymentMethod) => paymentMethod.toLowerCase() == event.args.paymentToken.toLowerCase()
    );

    if (!existPaymentMethod) {
      newUsedPaymentMethods.push(event.args.paymentToken);
    }

    await context.db.update(accessTimeUserSchema, { id: accessTimeUserId, chainId }).set({
      endTime: startTime + event.args.amount,
      totalPurchasedTime: accessTimeUser.totalPurchasedTime + event.args.amount,
      usedPaymentMethods: newUsedPaymentMethods
    });
  }
});

ponder.on("AccessVote:Voted", async ({ event, context }) => {
  const chainId = context.network.chainId;
  const accessTime = await context.db.find(accessTimeSchema, { id: event.args.accessTime, chainId });

  if (accessTime != null && accessTime.paymentMethods != null) {
    const accessTimeTotalVotePoint: bigint = accessTime.totalVotePoint!;
    const accessTimeTotalVoteParticipantCount: number = accessTime.totalVoteParticipantCount!;

    const accessVoteId: Hash = keccak256(encodeAbiParameters(
      [{ type: "address" }, { type: "uint256" }],
      [event.args.accessTime, event.args.epochWeek])
    );
    const voteId: Hash = keccak256(encodeAbiParameters(
      [{ type: "address" }, { type: "address" }, { type: "uint256" }],
      [event.args.accessTime, event.args.participant, event.args.epochWeek])
    );

    const weeklyVote = await context.db.find(weeklyVoteSchema, { id: event.args.epochWeek, chainId });
    const accessVote = await context.db.find(accessVoteSchema, { id: accessVoteId, chainId });
    const vote = await context.db.find(voteSchema, { id: voteId, chainId });

    let weeklyVoteVotePoint: bigint = 0n;
    let weeklyVoteParticipantCount: number = 0;
    let weeklyVoteAccessTimes: Address[] = [];
    let weeklyVoteAccessTimeCount: number = 0;
    if (weeklyVote == null) {
      await context.db.insert(weeklyVoteSchema).values({
        id: event.args.epochWeek,
        chainId,
      });
    } else {
      weeklyVoteVotePoint = weeklyVote.votePoint!;
      weeklyVoteParticipantCount = weeklyVote.participantCount!;
      weeklyVoteAccessTimes = weeklyVote.accessTimes!;
      weeklyVoteAccessTimeCount = weeklyVote.accessTimeCount!;
    }

    let accessVoteVotePoint: bigint = 0n;
    let accessVoteParticipantCount: number = 0;
    if (accessVote == null) {
      await context.db.insert(accessVoteSchema).values({
        id: accessVoteId,
        chainId,
        accessTimeAddress: event.args.accessTime,
        accessTimePaymentMethods: accessTime.paymentMethods,
        accessTimeId: accessTime.accessTimeId,
        epochWeek: event.args.epochWeek
      });
    } else {
      accessVoteVotePoint = accessVote.votePoint!;
      accessVoteParticipantCount = accessVote.participantCount!;
    }

    if (vote == null) {
      await context.db.insert(voteSchema).values({
        id: voteId,
        chainId,
        epochWeek: event.args.epochWeek,
        accessTime: event.args.accessTime,
        participant: event.args.participant,
        votePoint: event.args.star
      });

      await context.db
        .update(accessVoteSchema, { id: accessVoteId, chainId })
        .set({
          votePoint: accessVoteVotePoint + event.args.star,
          participantCount: accessVoteParticipantCount + 1
        });

      await context.db
        .update(accessTimeSchema, { id: event.args.accessTime, chainId })
        .set({
          totalVotePoint: accessTimeTotalVotePoint + event.args.star,
          totalVoteParticipantCount: accessTimeTotalVoteParticipantCount + 1
        });

      let weeklyVoteAccessTimeExist = weeklyVoteAccessTimes
        .find((address) => address.toLowerCase() == event.args.accessTime.toLowerCase());

      if (!weeklyVoteAccessTimeExist) {
        weeklyVoteAccessTimes.push(event.args.accessTime);

        await context.db
          .update(weeklyVoteSchema, { id: event.args.epochWeek, chainId })
          .set({
            accessTimes: weeklyVoteAccessTimes,
            accessTimeCount: weeklyVoteAccessTimeCount + 1
          });
      }

      await context.db
        .update(weeklyVoteSchema, { id: event.args.epochWeek, chainId })
        .set({
          votePoint: weeklyVoteVotePoint + event.args.star,
          participantCount: weeklyVoteParticipantCount + 1
        });

      const statisticValue = 1n;
      const statisticInternalTypes = [StatisticVoteType.COMPANY, StatisticVoteType.PROJECT];
      const statisticAddresses = [zeroAddress, event.args.accessTime];
      for (let i = 0; i < statisticInternalTypes.length; i++) {
        const statisticInternalType = statisticInternalTypes[i];
        const statisticAddress = statisticAddresses[i];

        if (!statisticInternalType || !statisticAddress) {
          continue;
        }

        const statisticWeeklyId = generateWeeklyStatisticId(
          event.block.timestamp,
          BigInt(chainId),
          StatisticType.VOTE,
          statisticInternalType,
          statisticAddress
        );
        const statisticMonthlyId = generateMonthlyStatisticId(
          event.block.timestamp,
          BigInt(chainId),
          StatisticType.VOTE,
          statisticInternalType,
          statisticAddress
        );

        const statisticWeekly = await context.db.find(statisticSchema, { id: statisticWeeklyId, chainId });
        const statisticMonthly = await context.db.find(statisticSchema, { id: statisticMonthlyId, chainId });

        if (statisticWeekly == null) {
          await context.db.insert(statisticSchema).values({
            id: statisticWeeklyId,
            chainId,
            value: statisticValue,
            timeIndex: getWeekIndex(event.block.timestamp),
            timeGap: BigInt(StatisticTimeGap.WEEK),
            type: StatisticType.VOTE,
            internalType: statisticInternalType,
            address: statisticAddress
          });
        } else {
          await context.db.update(statisticSchema, { id: statisticWeeklyId, chainId }).set({ value: statisticWeekly.value + statisticValue });
        }

        if (statisticMonthly == null) {
          await context.db.insert(statisticSchema).values({
            id: statisticMonthlyId,
            chainId,
            value: statisticValue,
            timeIndex: getMonthIndex(event.block.timestamp),
            timeGap: BigInt(StatisticTimeGap.MONTH),
            type: StatisticType.VOTE,
            internalType: statisticInternalType,
            address: statisticAddress
          });
        } else {
          await context.db.update(statisticSchema, { id: statisticMonthlyId, chainId }).set({ value: statisticMonthly.value + statisticValue });
        }
      }
    }
  }
});
