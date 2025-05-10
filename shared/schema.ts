import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User model - represents users who have connected their wallets
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  address: text("address").notNull().unique(),
  username: text("username"),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  address: true,
  username: true,
  avatarUrl: true,
});

// Team model - represents a group of users that share a wallet
export const teams = pgTable("teams", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  createdBy: text("created_by").notNull().references(() => users.address),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertTeamSchema = createInsertSchema(teams).pick({
  name: true,
  description: true,
  createdBy: true,
});

// TeamMember model - represents users belonging to a team
export const teamMembers = pgTable("team_members", {
  id: serial("id").primaryKey(),
  teamId: integer("team_id").notNull().references(() => teams.id),
  userAddress: text("user_address").notNull().references(() => users.address),
  role: text("role").notNull(), // admin, member, etc.
  addedAt: timestamp("added_at").defaultNow(),
});

export const insertTeamMemberSchema = createInsertSchema(teamMembers).pick({
  teamId: true,
  userAddress: true,
  role: true,
});

// Delegation model - represents a delegation from one user to another
export const delegations = pgTable("delegations", {
  id: serial("id").primaryKey(),
  teamId: integer("team_id").notNull().references(() => teams.id),
  delegatorAddress: text("delegator_address").notNull().references(() => users.address),
  delegateeAddress: text("delegatee_address").notNull(),
  permissionLevel: text("permission_level").notNull(), // admin, department_lead, team_member
  spendingLimit: text("spending_limit"),
  tokenType: text("token_type").default("ETH"),
  duration: text("duration").default("permanent"),
  allowedActions: jsonb("allowed_actions").notNull(),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  expiresAt: timestamp("expires_at"),
});

export const insertDelegationSchema = createInsertSchema(delegations).pick({
  teamId: true,
  delegatorAddress: true,
  delegateeAddress: true,
  permissionLevel: true,
  spendingLimit: true,
  tokenType: true,
  duration: true,
  allowedActions: true,
  expiresAt: true,
});

// PaymentStream model - represents an automated payment stream
export const paymentStreams = pgTable("payment_streams", {
  id: serial("id").primaryKey(),
  teamId: integer("team_id").notNull().references(() => teams.id),
  senderAddress: text("sender_address").notNull().references(() => users.address),
  recipientAddress: text("recipient_address").notNull(),
  tokenType: text("token_type").default("ETH"),
  totalAmount: text("total_amount").notNull(),
  flowRate: text("flow_rate").notNull(), // amount per day
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  note: text("note"),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPaymentStreamSchema = createInsertSchema(paymentStreams).pick({
  teamId: true,
  senderAddress: true,
  recipientAddress: true,
  tokenType: true,
  totalAmount: true,
  flowRate: true,
  startDate: true,
  endDate: true,
  note: true,
});

// Transaction model - represents a transaction made using delegated permissions
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  teamId: integer("team_id").notNull().references(() => teams.id),
  delegationId: integer("delegation_id").references(() => delegations.id),
  fromAddress: text("from_address").notNull(),
  toAddress: text("to_address").notNull(),
  amount: text("amount").notNull(),
  tokenType: text("token_type").default("ETH"),
  transactionHash: text("transaction_hash").notNull(),
  transactionType: text("transaction_type").notNull(), // transfer, contract_interaction, etc.
  timestamp: timestamp("timestamp").defaultNow(),
  status: text("status").notNull(), // pending, completed, failed
});

export const insertTransactionSchema = createInsertSchema(transactions).pick({
  teamId: true,
  delegationId: true,
  fromAddress: true,
  toAddress: true,
  amount: true,
  tokenType: true,
  transactionHash: true,
  transactionType: true,
  status: true,
});

// Subscription model - represents a delegated subscription
export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  teamId: integer("team_id").notNull().references(() => teams.id),
  delegationId: integer("delegation_id").references(() => delegations.id),
  name: text("name").notNull(),
  description: text("description"),
  subscriberAddress: text("subscriber_address").notNull().references(() => users.address),
  providerAddress: text("provider_address").notNull(),
  providerName: text("provider_name"),
  providerUrl: text("provider_url"),
  amount: text("amount").notNull(),
  tokenType: text("token_type").default("ETH"),
  frequency: text("frequency").notNull(), // daily, weekly, monthly
  startDate: timestamp("start_date").defaultNow(),
  endDate: timestamp("end_date"),
  nextPaymentDue: timestamp("next_payment_due"),
  totalPayments: integer("total_payments"),
  completedPayments: integer("completed_payments").default(0),
  spendingLimit: text("spending_limit"),
  usageLimit: integer("usage_limit"),
  renewalType: text("renewal_type").default("manual"), // manual, automatic
  status: text("status").default("active"), // active, paused, cancelled, completed
  categoryId: integer("category_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertSubscriptionSchema = createInsertSchema(subscriptions).pick({
  teamId: true,
  delegationId: true,
  name: true,
  description: true,
  subscriberAddress: true,
  providerAddress: true,
  providerName: true,
  providerUrl: true,
  amount: true,
  tokenType: true,
  frequency: true,
  startDate: true,
  endDate: true,
  nextPaymentDue: true,
  totalPayments: true,
  spendingLimit: true,
  usageLimit: true,
  renewalType: true,
  categoryId: true,
});

// Subscription Category model
export const subscriptionCategories = pgTable("subscription_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  color: text("color"),
  icon: text("icon"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertSubscriptionCategorySchema = createInsertSchema(subscriptionCategories).pick({
  name: true,
  description: true,
  color: true,
  icon: true,
});

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Team = typeof teams.$inferSelect;
export type InsertTeam = z.infer<typeof insertTeamSchema>;

export type TeamMember = typeof teamMembers.$inferSelect;
export type InsertTeamMember = z.infer<typeof insertTeamMemberSchema>;

export type Delegation = typeof delegations.$inferSelect;
export type InsertDelegation = z.infer<typeof insertDelegationSchema>;

export type PaymentStream = typeof paymentStreams.$inferSelect;
export type InsertPaymentStream = z.infer<typeof insertPaymentStreamSchema>;

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;

export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;

export type SubscriptionCategory = typeof subscriptionCategories.$inferSelect;
export type InsertSubscriptionCategory = z.infer<typeof insertSubscriptionCategorySchema>;
