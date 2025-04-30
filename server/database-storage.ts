import { 
  users, type User, type InsertUser,
  wallets, type Wallet, type InsertWallet,
  transactions, type Transaction, type InsertTransaction,
  transfers, type Transfer, type InsertTransfer,
  dpsPlans, type DpsPlan, type InsertDpsPlan,
  dpsAccounts, type DpsAccount, type InsertDpsAccount,
  fdrPlans, type FdrPlan, type InsertFdrPlan,
  fdrAccounts, type FdrAccount, type InsertFdrAccount,
  loanTypes, type LoanType, type InsertLoanType,
  loanApplications, type LoanApplication, type InsertLoanApplication,
  loans, type Loan, type InsertLoan,
  billTypes, type BillType, type InsertBillType,
  billPayments, type BillPayment, type InsertBillPayment,
  supportTickets, type SupportTicket, type InsertSupportTicket,
  supportMessages, type SupportMessage, type InsertSupportMessage,
  notifications, type Notification, type InsertNotification,
  siteSettings, type SiteSetting, type InsertSiteSetting,
  languages, type Language, type InsertLanguage,
  translations, type Translation, type InsertTranslation,
  cryptocurrencies, type Cryptocurrency, type InsertCryptocurrency,
  cryptoHoldings, type CryptoHolding, type InsertCryptoHolding
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql, like } from "drizzle-orm";
import { IStorage } from "./storage";
import * as bcrypt from "bcryptjs";

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(userData: InsertUser): Promise<User> {
    // Hash password if it's not already hashed
    if (userData.password && !userData.password.startsWith('$2')) {
      userData.password = await bcrypt.hash(userData.password, 10);
    }
    
    const now = new Date();
    const [user] = await db.insert(users).values({
      ...userData,
      createdAt: now,
      kycStatus: userData.kycStatus || "pending",
      kycData: userData.kycData || null,
      role: userData.role || "user",
      referralCode: userData.referralCode || `REF${Math.floor(Math.random() * 10000)}`,
      referredBy: userData.referredBy || null,
      rank: userData.rank || "bronze",
      rewardPoints: userData.rewardPoints || 0,
      language: userData.language || "en",
      isRtl: userData.isRtl || false,
      isDarkMode: userData.isDarkMode || false,
      lastLogin: null,
    }).returning();
    
    return user;
  }

  async updateUser(id: number, data: Partial<User>): Promise<User | undefined> {
    // Hash password if it's being updated and not already hashed
    if (data.password && !data.password.startsWith('$2')) {
      data.password = await bcrypt.hash(data.password, 10);
    }
    
    const [user] = await db.update(users)
      .set(data)
      .where(eq(users.id, id))
      .returning();
    
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return db.select().from(users);
  }

  // Wallet operations
  async getUserWallets(userId: number): Promise<Wallet[]> {
    return db.select()
      .from(wallets)
      .where(eq(wallets.userId, userId));
  }

  async getWallet(id: number): Promise<Wallet | undefined> {
    const [wallet] = await db.select().from(wallets).where(eq(wallets.id, id));
    return wallet;
  }

  async createWallet(walletData: InsertWallet): Promise<Wallet> {
    const now = new Date();
    const [wallet] = await db.insert(wallets).values({
      ...walletData,
      balance: walletData.balance || 0,
      isActive: walletData.isActive !== undefined ? walletData.isActive : true,
      createdAt: now,
    }).returning();
    
    return wallet;
  }

  async updateWallet(id: number, data: Partial<Wallet>): Promise<Wallet | undefined> {
    const [wallet] = await db.update(wallets)
      .set(data)
      .where(eq(wallets.id, id))
      .returning();
    
    return wallet;
  }

  // Transaction operations
  async getUserTransactions(userId: number, limit?: number): Promise<Transaction[]> {
    let query = db.select()
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.createdAt));
    
    if (limit) {
      query = query.limit(limit);
    }
    
    return query;
  }

  async getWalletTransactions(walletId: number, limit?: number): Promise<Transaction[]> {
    let query = db.select()
      .from(transactions)
      .where(eq(transactions.walletId, walletId))
      .orderBy(desc(transactions.createdAt));
    
    if (limit) {
      query = query.limit(limit);
    }
    
    return query;
  }

  async createTransaction(transactionData: InsertTransaction): Promise<Transaction> {
    const now = new Date();
    const [transaction] = await db.insert(transactions).values({
      ...transactionData,
      createdAt: now,
      updatedAt: now,
      status: transactionData.status || "completed",
      description: transactionData.description || null,
      reference: transactionData.reference || null,
    }).returning();
    
    // Update wallet balance
    if (transaction) {
      await db.update(wallets)
        .set({ 
          balance: sql`${wallets.balance} + ${transaction.amount}` 
        })
        .where(eq(wallets.id, transaction.walletId));
    }
    
    return transaction;
  }

  // Transfer operations
  async getUserTransfers(userId: number): Promise<Transfer[]> {
    return db.select()
      .from(transfers)
      .where(eq(transfers.senderId, userId))
      .orderBy(desc(transfers.createdAt));
  }

  async createTransfer(transferData: InsertTransfer): Promise<Transfer> {
    const now = new Date();
    const [transfer] = await db.insert(transfers).values({
      ...transferData,
      createdAt: now,
      completedAt: null,
      status: transferData.status || "pending",
      reference: transferData.reference || null,
      toWalletId: transferData.toWalletId || null,
      recipientInfo: transferData.recipientInfo || null,
      fee: transferData.fee || 0,
    }).returning();
    
    return transfer;
  }

  async updateTransfer(id: number, data: Partial<Transfer>): Promise<Transfer | undefined> {
    const [transfer] = await db.update(transfers)
      .set(data)
      .where(eq(transfers.id, id))
      .returning();
    
    return transfer;
  }

  // DPS Plan operations
  async getAllDpsPlans(): Promise<DpsPlan[]> {
    return db.select()
      .from(dpsPlans)
      .where(eq(dpsPlans.isActive, true));
  }

  async getDpsPlan(id: number): Promise<DpsPlan | undefined> {
    const [plan] = await db.select().from(dpsPlans).where(eq(dpsPlans.id, id));
    return plan;
  }

  async createDpsPlan(planData: InsertDpsPlan): Promise<DpsPlan> {
    const [plan] = await db.insert(dpsPlans).values({
      ...planData,
      isActive: planData.isActive !== undefined ? planData.isActive : true,
      description: planData.description || null,
      maxAmount: planData.maxAmount || null,
    }).returning();
    
    return plan;
  }

  async updateDpsPlan(id: number, data: Partial<DpsPlan>): Promise<DpsPlan | undefined> {
    const [plan] = await db.update(dpsPlans)
      .set(data)
      .where(eq(dpsPlans.id, id))
      .returning();
    
    return plan;
  }

  // DPS Account operations
  async getUserDpsAccounts(userId: number): Promise<DpsAccount[]> {
    return db.select()
      .from(dpsAccounts)
      .where(eq(dpsAccounts.userId, userId))
      .orderBy(desc(dpsAccounts.createdAt));
  }

  async getDpsAccount(id: number): Promise<DpsAccount | undefined> {
    const [account] = await db.select().from(dpsAccounts).where(eq(dpsAccounts.id, id));
    return account;
  }

  async createDpsAccount(accountData: InsertDpsAccount): Promise<DpsAccount> {
    const now = new Date();
    const [account] = await db.insert(dpsAccounts).values({
      ...accountData,
      createdAt: now,
    }).returning();
    
    return account;
  }

  async updateDpsAccount(id: number, data: Partial<DpsAccount>): Promise<DpsAccount | undefined> {
    const [account] = await db.update(dpsAccounts)
      .set(data)
      .where(eq(dpsAccounts.id, id))
      .returning();
    
    return account;
  }

  // FDR Plan operations
  async getAllFdrPlans(): Promise<FdrPlan[]> {
    return db.select()
      .from(fdrPlans)
      .where(eq(fdrPlans.isActive, true));
  }

  async getFdrPlan(id: number): Promise<FdrPlan | undefined> {
    const [plan] = await db.select().from(fdrPlans).where(eq(fdrPlans.id, id));
    return plan;
  }

  async createFdrPlan(planData: InsertFdrPlan): Promise<FdrPlan> {
    const [plan] = await db.insert(fdrPlans).values({
      ...planData,
      isActive: planData.isActive !== undefined ? planData.isActive : true,
      description: planData.description || null,
      maxAmount: planData.maxAmount || null,
    }).returning();
    
    return plan;
  }

  async updateFdrPlan(id: number, data: Partial<FdrPlan>): Promise<FdrPlan | undefined> {
    const [plan] = await db.update(fdrPlans)
      .set(data)
      .where(eq(fdrPlans.id, id))
      .returning();
    
    return plan;
  }

  // FDR Account operations
  async getUserFdrAccounts(userId: number): Promise<FdrAccount[]> {
    return db.select()
      .from(fdrAccounts)
      .where(eq(fdrAccounts.userId, userId))
      .orderBy(desc(fdrAccounts.createdAt));
  }

  async getFdrAccount(id: number): Promise<FdrAccount | undefined> {
    const [account] = await db.select().from(fdrAccounts).where(eq(fdrAccounts.id, id));
    return account;
  }

  async createFdrAccount(accountData: InsertFdrAccount): Promise<FdrAccount> {
    const now = new Date();
    const [account] = await db.insert(fdrAccounts).values({
      ...accountData,
      createdAt: now,
    }).returning();
    
    return account;
  }

  async updateFdrAccount(id: number, data: Partial<FdrAccount>): Promise<FdrAccount | undefined> {
    const [account] = await db.update(fdrAccounts)
      .set(data)
      .where(eq(fdrAccounts.id, id))
      .returning();
    
    return account;
  }

  // Loan Type operations
  async getAllLoanTypes(): Promise<LoanType[]> {
    return db.select()
      .from(loanTypes)
      .where(eq(loanTypes.isActive, true));
  }

  async getLoanType(id: number): Promise<LoanType | undefined> {
    const [type] = await db.select().from(loanTypes).where(eq(loanTypes.id, id));
    return type;
  }

  async createLoanType(typeData: InsertLoanType): Promise<LoanType> {
    const [type] = await db.insert(loanTypes).values({
      ...typeData,
      isActive: typeData.isActive !== undefined ? typeData.isActive : true,
      description: typeData.description || null,
    }).returning();
    
    return type;
  }

  async updateLoanType(id: number, data: Partial<LoanType>): Promise<LoanType | undefined> {
    const [type] = await db.update(loanTypes)
      .set(data)
      .where(eq(loanTypes.id, id))
      .returning();
    
    return type;
  }

  // Loan Application operations
  async getUserLoanApplications(userId: number): Promise<LoanApplication[]> {
    return db.select()
      .from(loanApplications)
      .where(eq(loanApplications.userId, userId))
      .orderBy(desc(loanApplications.applicationDate));
  }

  async getLoanApplication(id: number): Promise<LoanApplication | undefined> {
    const [application] = await db.select().from(loanApplications).where(eq(loanApplications.id, id));
    return application;
  }

  async createLoanApplication(applicationData: InsertLoanApplication): Promise<LoanApplication> {
    const now = new Date();
    const [application] = await db.insert(loanApplications).values({
      ...applicationData,
      applicationDate: now,
      approvedDate: null,
      disbursedDate: null,
    }).returning();
    
    return application;
  }

  async updateLoanApplication(id: number, data: Partial<LoanApplication>): Promise<LoanApplication | undefined> {
    const [application] = await db.update(loanApplications)
      .set(data)
      .where(eq(loanApplications.id, id))
      .returning();
    
    return application;
  }

  // Loan operations
  async getUserLoans(userId: number): Promise<Loan[]> {
    return db.select()
      .from(loans)
      .where(eq(loans.userId, userId))
      .orderBy(desc(loans.startDate));
  }

  async getLoan(id: number): Promise<Loan | undefined> {
    const [loan] = await db.select().from(loans).where(eq(loans.id, id));
    return loan;
  }

  async createLoan(loanData: InsertLoan): Promise<Loan> {
    const [loan] = await db.insert(loans).values({
      ...loanData,
    }).returning();
    
    return loan;
  }

  async updateLoan(id: number, data: Partial<Loan>): Promise<Loan | undefined> {
    const [loan] = await db.update(loans)
      .set(data)
      .where(eq(loans.id, id))
      .returning();
    
    return loan;
  }

  // Bill Type operations
  async getAllBillTypes(): Promise<BillType[]> {
    return db.select()
      .from(billTypes)
      .where(eq(billTypes.isActive, true));
  }

  async getBillType(id: number): Promise<BillType | undefined> {
    const [type] = await db.select().from(billTypes).where(eq(billTypes.id, id));
    return type;
  }

  async createBillType(typeData: InsertBillType): Promise<BillType> {
    const [type] = await db.insert(billTypes).values({
      ...typeData,
      isActive: typeData.isActive !== undefined ? typeData.isActive : true,
      description: typeData.description || null,
      icon: typeData.icon || null,
    }).returning();
    
    return type;
  }

  async updateBillType(id: number, data: Partial<BillType>): Promise<BillType | undefined> {
    const [type] = await db.update(billTypes)
      .set(data)
      .where(eq(billTypes.id, id))
      .returning();
    
    return type;
  }

  // Bill Payment operations
  async getUserBillPayments(userId: number): Promise<BillPayment[]> {
    return db.select()
      .from(billPayments)
      .where(eq(billPayments.userId, userId))
      .orderBy(desc(billPayments.paymentDate));
  }

  async getBillPayment(id: number): Promise<BillPayment | undefined> {
    const [payment] = await db.select().from(billPayments).where(eq(billPayments.id, id));
    return payment;
  }

  async createBillPayment(paymentData: InsertBillPayment): Promise<BillPayment> {
    const [payment] = await db.insert(billPayments).values({
      ...paymentData,
      status: paymentData.status || "completed",
      reference: paymentData.reference || null,
    }).returning();
    
    return payment;
  }

  async updateBillPayment(id: number, data: Partial<BillPayment>): Promise<BillPayment | undefined> {
    const [payment] = await db.update(billPayments)
      .set(data)
      .where(eq(billPayments.id, id))
      .returning();
    
    return payment;
  }

  // Support Ticket operations
  async getUserSupportTickets(userId: number): Promise<SupportTicket[]> {
    return db.select()
      .from(supportTickets)
      .where(eq(supportTickets.userId, userId))
      .orderBy(desc(supportTickets.createdAt));
  }

  async getSupportTicket(id: number): Promise<SupportTicket | undefined> {
    const [ticket] = await db.select().from(supportTickets).where(eq(supportTickets.id, id));
    return ticket;
  }

  async createSupportTicket(ticketData: InsertSupportTicket): Promise<SupportTicket> {
    const now = new Date();
    const [ticket] = await db.insert(supportTickets).values({
      ...ticketData,
      createdAt: now,
      updatedAt: now,
      closedAt: null,
      status: ticketData.status || "open",
      priority: ticketData.priority || "medium",
    }).returning();
    
    return ticket;
  }

  async updateSupportTicket(id: number, data: Partial<SupportTicket>): Promise<SupportTicket | undefined> {
    const now = new Date();
    data.updatedAt = now;
    
    const [ticket] = await db.update(supportTickets)
      .set(data)
      .where(eq(supportTickets.id, id))
      .returning();
    
    return ticket;
  }

  // Support Message operations
  async getTicketMessages(ticketId: number): Promise<SupportMessage[]> {
    return db.select()
      .from(supportMessages)
      .where(eq(supportMessages.ticketId, ticketId))
      .orderBy(supportMessages.createdAt);
  }

  async createSupportMessage(messageData: InsertSupportMessage): Promise<SupportMessage> {
    const now = new Date();
    const [message] = await db.insert(supportMessages).values({
      ...messageData,
      createdAt: now,
      isStaff: messageData.isStaff || false,
    }).returning();
    
    // Update the support ticket's updatedAt
    await db.update(supportTickets)
      .set({ updatedAt: now })
      .where(eq(supportTickets.id, messageData.ticketId));
    
    return message;
  }

  // Notification operations
  async getUserNotifications(userId: number): Promise<Notification[]> {
    return db.select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));
  }

  async getNotification(id: number): Promise<Notification | undefined> {
    const [notification] = await db.select().from(notifications).where(eq(notifications.id, id));
    return notification;
  }

  async createNotification(notificationData: InsertNotification): Promise<Notification> {
    const now = new Date();
    const [notification] = await db.insert(notifications).values({
      ...notificationData,
      createdAt: now,
      link: notificationData.link || null,
      isRead: notificationData.isRead || false,
    }).returning();
    
    return notification;
  }

  async updateNotification(id: number, data: Partial<Notification>): Promise<Notification | undefined> {
    const [notification] = await db.update(notifications)
      .set(data)
      .where(eq(notifications.id, id))
      .returning();
    
    return notification;
  }

  async markNotificationsAsRead(userId: number): Promise<void> {
    await db.update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.userId, userId));
  }

  // Site Setting operations
  async getAllSettings(): Promise<SiteSetting[]> {
    return db.select().from(siteSettings);
  }

  async getSettingsByGroup(group: string): Promise<SiteSetting[]> {
    return db.select()
      .from(siteSettings)
      .where(eq(siteSettings.group, group));
  }

  async getSettingByKey(key: string): Promise<SiteSetting | undefined> {
    const [setting] = await db.select()
      .from(siteSettings)
      .where(eq(siteSettings.key, key));
    
    return setting;
  }

  async updateSetting(key: string, value: string): Promise<SiteSetting | undefined> {
    const now = new Date();
    const setting = await this.getSettingByKey(key);
    
    if (setting) {
      const [updatedSetting] = await db.update(siteSettings)
        .set({ 
          value: value,
          updatedAt: now
        })
        .where(eq(siteSettings.key, key))
        .returning();
      
      return updatedSetting;
    } else {
      // Key doesn't exist, create it (assume it's a general setting)
      const [newSetting] = await db.insert(siteSettings).values({
        key,
        value,
        group: 'general',
        updatedAt: now,
      }).returning();
      
      return newSetting;
    }
  }

  // Language operations
  async getAllLanguages(): Promise<Language[]> {
    return db.select().from(languages);
  }

  async getLanguage(id: number): Promise<Language | undefined> {
    const [language] = await db.select().from(languages).where(eq(languages.id, id));
    return language;
  }

  async getLanguageByCode(code: string): Promise<Language | undefined> {
    const [language] = await db.select()
      .from(languages)
      .where(eq(languages.code, code));
    
    return language;
  }

  async createLanguage(languageData: InsertLanguage): Promise<Language> {
    const [language] = await db.insert(languages).values({
      ...languageData,
      isRtl: languageData.isRtl || false,
      isActive: languageData.isActive || true,
    }).returning();
    
    return language;
  }

  async updateLanguage(id: number, data: Partial<Language>): Promise<Language | undefined> {
    const [language] = await db.update(languages)
      .set(data)
      .where(eq(languages.id, id))
      .returning();
    
    return language;
  }

  // Translation operations
  async getTranslationsByLanguage(languageId: number): Promise<Translation[]> {
    return db.select()
      .from(translations)
      .where(eq(translations.languageId, languageId));
  }

  async createTranslation(translationData: InsertTranslation): Promise<Translation> {
    const [translation] = await db.insert(translations).values(translationData).returning();
    return translation;
  }

  async updateTranslation(id: number, value: string): Promise<Translation | undefined> {
    const [translation] = await db.update(translations)
      .set({ value })
      .where(eq(translations.id, id))
      .returning();
    
    return translation;
  }

  // Cryptocurrency operations
  async getAllCryptocurrencies(): Promise<Cryptocurrency[]> {
    return db.select().from(cryptocurrencies).orderBy(cryptocurrencies.name);
  }

  async getCryptocurrency(id: number): Promise<Cryptocurrency | undefined> {
    const [crypto] = await db.select().from(cryptocurrencies).where(eq(cryptocurrencies.id, id));
    return crypto;
  }

  async getCryptocurrencyBySymbol(symbol: string): Promise<Cryptocurrency | undefined> {
    const [crypto] = await db.select().from(cryptocurrencies)
      .where(eq(cryptocurrencies.symbol, symbol));
    return crypto;
  }

  async createCryptocurrency(cryptoData: InsertCryptocurrency): Promise<Cryptocurrency> {
    const now = new Date();
    const [crypto] = await db.insert(cryptocurrencies).values({
      ...cryptoData,
      lastUpdated: now
    }).returning();
    
    return crypto;
  }

  async updateCryptocurrency(id: number, data: Partial<Cryptocurrency>): Promise<Cryptocurrency | undefined> {
    const now = new Date();
    const [crypto] = await db.update(cryptocurrencies)
      .set({
        ...data,
        lastUpdated: now
      })
      .where(eq(cryptocurrencies.id, id))
      .returning();
    
    return crypto;
  }
  
  // Crypto Holdings operations
  async getUserCryptoHoldings(userId: number): Promise<CryptoHolding[]> {
    return db.select()
      .from(cryptoHoldings)
      .where(eq(cryptoHoldings.userId, userId))
      .orderBy(desc(cryptoHoldings.createdAt));
  }

  async getCryptoHolding(id: number): Promise<CryptoHolding | undefined> {
    const [holding] = await db.select().from(cryptoHoldings).where(eq(cryptoHoldings.id, id));
    return holding;
  }

  async createCryptoHolding(holdingData: InsertCryptoHolding): Promise<CryptoHolding> {
    const now = new Date();
    const [holding] = await db.insert(cryptoHoldings).values({
      ...holdingData,
      createdAt: now,
      updatedAt: now
    }).returning();
    
    return holding;
  }

  async updateCryptoHolding(id: number, data: Partial<CryptoHolding>): Promise<CryptoHolding | undefined> {
    const now = new Date();
    const [holding] = await db.update(cryptoHoldings)
      .set({
        ...data,
        updatedAt: now
      })
      .where(eq(cryptoHoldings.id, id))
      .returning();
    
    return holding;
  }
}