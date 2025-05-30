import { index, onchainTable, primaryKey, relations } from "ponder";
import { zeroAddress } from "viem";

export const accessTime = onchainTable("accesstime", (t) => ({
  id: t.hex().notNull(),
  chainId: t.integer().notNull(),
  accessTimeId: t.bigint().notNull(),
  prevOwner: t.hex().default(zeroAddress),
  owner: t.hex().notNull(),
  nextOwner: t.hex().default(zeroAddress),
  paused: t.boolean().default(false),
  paymentMethods: t.hex().array().default([]),
  extraTimes: t.bigint().array().default([]),
  removedExtraTimes: t.bigint().array().default([]),
  packages: t.bigint().array().default([]),
  removedPackages: t.bigint().array().default([]),
  updateTimestamp: t.bigint().notNull(),
  totalVotePoint: t.bigint().default(0n),
  totalVoteParticipantCount: t.integer().default(0)
}), (table) => ({
  accessTimeIdx: index().on(table.accessTimeId),
  pk: primaryKey({
    columns: [table.id, table.chainId]
  }),
}));

export const accessTimeUser = onchainTable("accesstime_user", (t) => ({
  id: t.hex().notNull(),
  chainId: t.integer().notNull(),
  address: t.hex().notNull(),
  endTime: t.bigint().notNull(),
  accessTimeAddress: t.hex().notNull(),
  totalPurchasedTime: t.bigint().notNull(),
  usedPaymentMethods: t.hex().array().notNull()
}), (table) => ({
  pk: primaryKey({
    columns: [table.id, table.chainId]
  }),
}));

export const accessTimeUserRelations = relations(accessTimeUser, ({ one }) => ({
  user: one(user, { fields: [accessTimeUser.address], references: [user.id] })
}));

export const purchase = onchainTable("purchase", (t) => ({
  id: t.hex().notNull(),
  chainId: t.integer().notNull(),
  address: t.hex().notNull(),
  accessTimeAddress: t.hex().notNull(),
  accessTimeUserId: t.hex().notNull(),
  amount: t.bigint().notNull(),
  paymentAmount: t.bigint().notNull(),
  formattedPaymentAmount: t.text().notNull(),
  symbol: t.text().notNull(),
  paymentMethod: t.hex().notNull(),
  packageId: t.bigint().notNull(),
  timestamp: t.bigint().notNull()
}), (table) => ({
  pk: primaryKey({
    columns: [table.id, table.chainId]
  }),
}));

export const purchaseRelations = relations(purchase, ({ one }) => ({
  accessTimeUser: one(accessTimeUser, { fields: [purchase.accessTimeUserId], references: [accessTimeUser.id] }),
  user: one(user, { fields: [purchase.address], references: [user.id] })
}));

export const user = onchainTable("user", (t) => ({
  id: t.hex().notNull(),
  endTime: t.bigint().notNull(),
}), (table) => ({
  pk: primaryKey({
    columns: [table.id]
  }),
}));

export const userRelations = relations(user, ({ many }) => ({
  purchaseHistory: many(purchase),
  accessTimeProfiles: many(accessTimeUser)
}));

export const accessVote = onchainTable("accessvote", (t) => ({
  id: t.hex().notNull(),
  chainId: t.integer().notNull(),
  epochWeek: t.bigint().notNull(),
  accessTimeAddress: t.hex().notNull(),
  accessTimePaymentMethods: t.hex().array().notNull(),
  accessTimeId: t.bigint().notNull(),
  participantCount: t.integer().default(0),
  votePoint: t.bigint().default(0n)
}), (table) => ({
  epochWeekx: index().on(table.epochWeek),
  pk: primaryKey({
    columns: [table.id, table.chainId]
  }),
}));

export const accessVoteRelations = relations(accessVote, ({ one }) => ({
  accessTime: one(accessTime, { fields: [accessVote.accessTimeAddress], references: [accessTime.id] })
}));

export const vote = onchainTable("vote", (t) => ({
  id: t.hex().notNull(),
  chainId: t.integer().notNull(),
  epochWeek: t.bigint().notNull(),
  accessTime: t.hex().notNull(),
  participant: t.hex().notNull(),
  votePoint: t.bigint().notNull()
}), (table) => ({
  pk: primaryKey({
    columns: [table.id, table.chainId]
  }),
}));

export const weeklyVote = onchainTable("weeklyvote", (t) => ({
  id: t.bigint().notNull(),
  chainId: t.integer().notNull(),
  votePoint: t.bigint().default(0n),
  participantCount: t.integer().default(0),
  accessTimes: t.hex().array().default([]),
  accessTimeCount: t.integer().default(0)
}), (table) => ({
  pk: primaryKey({
    columns: [table.id, table.chainId]
  }),
}));

export const statistic = onchainTable("statistic", (t) => ({
  id: t.hex().notNull(),
  chainId: t.integer().notNull(),
  value: t.bigint().notNull(),
  timeIndex: t.bigint().notNull(),
  timeGap: t.bigint().notNull(),
  type: t.integer().notNull(),
  internalType: t.integer().notNull(),
  address: t.hex().notNull()
}), (table) => ({
  pk: primaryKey({
    columns: [table.id, table.chainId]
  }),
}));
