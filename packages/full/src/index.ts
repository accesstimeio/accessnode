import { ponder } from "ponder:registry";
import {
  accessTime as accessTimeSchema,
  accessTimeUser as accessTimeUserSchema,
  purchase as purchaseSchema,
  user as userSchema
} from "ponder:schema";
import { Address, encodeAbiParameters, formatUnits, keccak256, parseAbi, parseEther, zeroAddress } from "viem";
import { AccessTimeAbi } from "../../../src/abis/AccessTimeAbi";
import { Contract, getFactoryAddress } from "@accesstimeio/accesstime-common";

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

  const user = await context.db.find(userSchema, { id: event.args.user, chainId });

  if (user == null) {
    await context.db.insert(userSchema).values({ id: event.args.user, chainId });
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

  const user = await context.db.find(userSchema, { id: event.args.user, chainId });

  if (user == null) {
    await context.db.insert(userSchema).values({ id: event.args.user, chainId });
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
