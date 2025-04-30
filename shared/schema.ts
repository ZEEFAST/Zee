import { pgTable, text, serial, integer, boolean, jsonb, timestamp, doublePrecision, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  fullName: text("full_name").notNull(),
  phone: text("phone"),
  address: text("address"),
  kycStatus: text("kyc_status").default("pending").notNull(),
  kycData: jsonb("kyc_data"),
  role: text("role").default("user").notNull(),
  referralCode: text("referral_code").unique(),
  referredBy: integer("referred_by").references(() => users.id),
  rank: text("rank").default("bronze").notNull(),
  rewardPoints: integer("reward_points").default(0).notNull(),
  language: text("language").default("en").notNull(),
  isRtl: boolean("is_rtl").default(false).notNull(),
  isDarkMode: boolean("is_dark_mode").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastLogin: timestamp("last_login"),
});

// Wallets
export const wallets = pgTable("wallets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  type: text("type").notNull(), // main, savings, crypto-btc, crypto-eth, etc.
  balance: doublePrecision("balance").default(0).notNull(),
  currency: text("currency").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Transactions
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  walletId: integer("wallet_id").notNull().references(() => wallets.id),
  amount: doublePrecision("amount").notNull(),
  type: text("type").notNull(), // deposit, withdrawal, transfer, payment, interest
  status: text("status").default("pending").notNull(),
  description: text("description"),
  reference: text("reference"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at"),
});

// Transfers
export const transfers = pgTable("transfers", {
  id: serial("id").primaryKey(),
  senderId: integer("sender_id").notNull().references(() => users.id),
  fromWalletId: integer("from_wallet_id").notNull().references(() => wallets.id),
  toWalletId: integer("to_wallet_id").references(() => wallets.id),
  recipientInfo: jsonb("recipient_info"), // For external transfers
  amount: doublePrecision("amount").notNull(),
  currency: text("currency").notNull(),
  fee: doublePrecision("fee").default(0).notNull(),
  type: text("type").notNull(), // internal, bank, wire, swift
  status: text("status").default("pending").notNull(),
  reference: text("reference"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});

// DPS Plans
export const dpsPlans = pgTable("dps_plans", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  term: integer("term").notNull(), // In months
  interestRate: doublePrecision("interest_rate").notNull(),
  minAmount: doublePrecision("min_amount").notNull(),
  maxAmount: doublePrecision("max_amount"),
  isActive: boolean("is_active").default(true).notNull(),
});

// DPS Accounts
export const dpsAccounts = pgTable("dps_accounts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  planId: integer("plan_id").notNull().references(() => dpsPlans.id),
  accountNumber: text("account_number").notNull().unique(),
  monthlyAmount: doublePrecision("monthly_amount").notNull(),
  term: integer("term").notNull(), // In months
  interestRate: doublePrecision("interest_rate").notNull(),
  startDate: timestamp("start_date").notNull(),
  nextPaymentDate: timestamp("next_payment_date").notNull(),
  maturityDate: timestamp("maturity_date").notNull(),
  status: text("status").default("active").notNull(),
  totalDeposited: doublePrecision("total_deposited").default(0).notNull(),
  interestEarned: doublePrecision("interest_earned").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// FDR Plans
export const fdrPlans = pgTable("fdr_plans", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  term: integer("term").notNull(), // In months
  interestRate: doublePrecision("interest_rate").notNull(),
  minAmount: doublePrecision("min_amount").notNull(),
  maxAmount: doublePrecision("max_amount"),
  compounding: boolean("compounding").default(false).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
});

// FDR Accounts
export const fdrAccounts = pgTable("fdr_accounts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  planId: integer("plan_id").notNull().references(() => fdrPlans.id),
  accountNumber: text("account_number").notNull().unique(),
  principalAmount: doublePrecision("principal_amount").notNull(),
  term: integer("term").notNull(), // In months
  interestRate: doublePrecision("interest_rate").notNull(),
  compounding: boolean("compounding").default(false).notNull(),
  startDate: timestamp("start_date").notNull(),
  maturityDate: timestamp("maturity_date").notNull(),
  status: text("status").default("active").notNull(),
  interestEarned: doublePrecision("interest_earned").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Loan Types
export const loanTypes = pgTable("loan_types", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  interestRate: doublePrecision("interest_rate").notNull(),
  termMin: integer("term_min").notNull(), // In months
  termMax: integer("term_max").notNull(), // In months
  minAmount: doublePrecision("min_amount").notNull(),
  maxAmount: doublePrecision("max_amount").notNull(),
  processingFeePercent: doublePrecision("processing_fee_percent").default(0).notNull(),
  lateFeePercent: doublePrecision("late_fee_percent").default(0).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
});

// Loan Applications
export const loanApplications = pgTable("loan_applications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  loanTypeId: integer("loan_type_id").notNull().references(() => loanTypes.id),
  amount: doublePrecision("amount").notNull(),
  term: integer("term").notNull(), // In months
  interestRate: doublePrecision("interest_rate").notNull(),
  purpose: text("purpose"),
  status: text("status").default("pending").notNull(), // pending, approved, rejected, disbursed
  applicationDate: timestamp("application_date").defaultNow().notNull(),
  approvedDate: timestamp("approved_date"),
  rejectionReason: text("rejection_reason"),
  disbursedDate: timestamp("disbursed_date"),
  documents: jsonb("documents"),
});

// Loans
export const loans = pgTable("loans", {
  id: serial("id").primaryKey(),
  applicationId: integer("application_id").references(() => loanApplications.id),
  userId: integer("user_id").notNull().references(() => users.id),
  accountNumber: text("account_number").notNull().unique(),
  principalAmount: doublePrecision("principal_amount").notNull(),
  term: integer("term").notNull(), // In months
  interestRate: doublePrecision("interest_rate").notNull(),
  processingFee: doublePrecision("processing_fee").default(0).notNull(),
  monthlyPayment: doublePrecision("monthly_payment").notNull(),
  startDate: timestamp("start_date").notNull(),
  nextPaymentDate: timestamp("next_payment_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  status: text("status").default("active").notNull(),
  remainingAmount: doublePrecision("remaining_amount").notNull(),
  totalPaid: doublePrecision("total_paid").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Bill Types
export const billTypes = pgTable("bill_types", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category").notNull(), // utility, telecom, internet, etc.
  icon: text("icon"),
  isActive: boolean("is_active").default(true).notNull(),
});

// Bill Payments
export const billPayments = pgTable("bill_payments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  walletId: integer("wallet_id").notNull().references(() => wallets.id),
  billTypeId: integer("bill_type_id").notNull().references(() => billTypes.id),
  amount: doublePrecision("amount").notNull(),
  accountNumber: text("account_number").notNull(),
  status: text("status").default("pending").notNull(),
  reference: text("reference"),
  billDate: timestamp("bill_date").notNull(),
  paymentDate: timestamp("payment_date").defaultNow().notNull(),
});

// Support Tickets
export const supportTickets = pgTable("support_tickets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  subject: text("subject").notNull(),
  description: text("description").notNull(),
  status: text("status").default("open").notNull(), // open, in-progress, closed
  priority: text("priority").default("medium").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at"),
  closedAt: timestamp("closed_at"),
});

// Support Messages
export const supportMessages = pgTable("support_messages", {
  id: serial("id").primaryKey(),
  ticketId: integer("ticket_id").notNull().references(() => supportTickets.id),
  senderId: integer("sender_id").notNull().references(() => users.id),
  message: text("message").notNull(),
  isStaff: boolean("is_staff").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Notifications
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull(), // transaction, system, security, promotion
  isRead: boolean("is_read").default(false).notNull(),
  link: text("link"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Site Settings
export const siteSettings = pgTable("site_settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value"),
  group: text("group").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Languages
export const languages = pgTable("languages", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  isRtl: boolean("is_rtl").default(false).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
});

// Translations
export const translations = pgTable("translations", {
  id: serial("id").primaryKey(),
  languageId: integer("language_id").notNull().references(() => languages.id),
  key: text("key").notNull(),
  value: text("value").notNull(),
});

// Create insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true, lastLogin: true });
export const insertWalletSchema = createInsertSchema(wallets).omit({ id: true, createdAt: true });
export const insertTransactionSchema = createInsertSchema(transactions).omit({ id: true, createdAt: true, updatedAt: true });
export const insertTransferSchema = createInsertSchema(transfers).omit({ id: true, createdAt: true, completedAt: true });
export const insertDpsPlanSchema = createInsertSchema(dpsPlans).omit({ id: true });
export const insertDpsAccountSchema = createInsertSchema(dpsAccounts).omit({ id: true, createdAt: true });
export const insertFdrPlanSchema = createInsertSchema(fdrPlans).omit({ id: true });
export const insertFdrAccountSchema = createInsertSchema(fdrAccounts).omit({ id: true, createdAt: true });
export const insertLoanTypeSchema = createInsertSchema(loanTypes).omit({ id: true });
export const insertLoanApplicationSchema = createInsertSchema(loanApplications).omit({ id: true, applicationDate: true, approvedDate: true, disbursedDate: true });
export const insertLoanSchema = createInsertSchema(loans).omit({ id: true, createdAt: true });
export const insertBillTypeSchema = createInsertSchema(billTypes).omit({ id: true });
export const insertBillPaymentSchema = createInsertSchema(billPayments).omit({ id: true, paymentDate: true });
export const insertSupportTicketSchema = createInsertSchema(supportTickets).omit({ id: true, createdAt: true, updatedAt: true, closedAt: true });
export const insertSupportMessageSchema = createInsertSchema(supportMessages).omit({ id: true, createdAt: true });
export const insertNotificationSchema = createInsertSchema(notifications).omit({ id: true, createdAt: true });
export const insertSiteSettingSchema = createInsertSchema(siteSettings).omit({ id: true, updatedAt: true });
export const insertLanguageSchema = createInsertSchema(languages).omit({ id: true });
export const insertTranslationSchema = createInsertSchema(translations).omit({ id: true });

// Define types for inserts
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertWallet = z.infer<typeof insertWalletSchema>;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type InsertTransfer = z.infer<typeof insertTransferSchema>;
export type InsertDpsPlan = z.infer<typeof insertDpsPlanSchema>;
export type InsertDpsAccount = z.infer<typeof insertDpsAccountSchema>;
export type InsertFdrPlan = z.infer<typeof insertFdrPlanSchema>;
export type InsertFdrAccount = z.infer<typeof insertFdrAccountSchema>;
export type InsertLoanType = z.infer<typeof insertLoanTypeSchema>;
export type InsertLoanApplication = z.infer<typeof insertLoanApplicationSchema>;
export type InsertLoan = z.infer<typeof insertLoanSchema>;
export type InsertBillType = z.infer<typeof insertBillTypeSchema>;
export type InsertBillPayment = z.infer<typeof insertBillPaymentSchema>;
export type InsertSupportTicket = z.infer<typeof insertSupportTicketSchema>;
export type InsertSupportMessage = z.infer<typeof insertSupportMessageSchema>;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type InsertSiteSetting = z.infer<typeof insertSiteSettingSchema>;
export type InsertLanguage = z.infer<typeof insertLanguageSchema>;
export type InsertTranslation = z.infer<typeof insertTranslationSchema>;

// Define types for select
export type User = typeof users.$inferSelect;
export type Wallet = typeof wallets.$inferSelect;
export type Transaction = typeof transactions.$inferSelect;
export type Transfer = typeof transfers.$inferSelect;
export type DpsPlan = typeof dpsPlans.$inferSelect;
export type DpsAccount = typeof dpsAccounts.$inferSelect;
export type FdrPlan = typeof fdrPlans.$inferSelect;
export type FdrAccount = typeof fdrAccounts.$inferSelect;
export type LoanType = typeof loanTypes.$inferSelect;
export type LoanApplication = typeof loanApplications.$inferSelect;
export type Loan = typeof loans.$inferSelect;
export type BillType = typeof billTypes.$inferSelect;
export type BillPayment = typeof billPayments.$inferSelect;
export type SupportTicket = typeof supportTickets.$inferSelect;
export type SupportMessage = typeof supportMessages.$inferSelect;
export type Notification = typeof notifications.$inferSelect;
export type SiteSetting = typeof siteSettings.$inferSelect;
export type Language = typeof languages.$inferSelect;
export type Translation = typeof translations.$inferSelect;
