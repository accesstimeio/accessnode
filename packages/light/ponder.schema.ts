import { onchainTable, primaryKey, relations } from "ponder";

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
