import { ponder } from "ponder:registry";
import {
  accessTimeUser as accessTimeUserSchema,
  purchase as purchaseSchema,
  user as userSchema
} from "ponder:schema";
import { encodeAbiParameters, formatUnits, keccak256, parseAbi, parseEther, zeroAddress } from "viem";
import { AccessTimeAbi } from "../../../src/abis/AccessTimeAbi";

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

  const user = context.db.find(userSchema, { id: event.args.user, chainId });

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

  const user = context.db.find(userSchema, { id: event.args.user, chainId });

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
