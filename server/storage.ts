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
  translations, type Translation, type InsertTranslation
} from "@shared/schema";

// Storage interface for all CRUD operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, data: Partial<User>): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  
  // Wallet operations
  getUserWallets(userId: number): Promise<Wallet[]>;
  getWallet(id: number): Promise<Wallet | undefined>;
  createWallet(wallet: InsertWallet): Promise<Wallet>;
  updateWallet(id: number, data: Partial<Wallet>): Promise<Wallet | undefined>;
  
  // Transaction operations
  getUserTransactions(userId: number, limit?: number): Promise<Transaction[]>;
  getWalletTransactions(walletId: number, limit?: number): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  
  // Transfer operations
  getUserTransfers(userId: number): Promise<Transfer[]>;
  createTransfer(transfer: InsertTransfer): Promise<Transfer>;
  updateTransfer(id: number, data: Partial<Transfer>): Promise<Transfer | undefined>;
  
  // DPS Plan operations
  getAllDpsPlans(): Promise<DpsPlan[]>;
  getDpsPlan(id: number): Promise<DpsPlan | undefined>;
  createDpsPlan(plan: InsertDpsPlan): Promise<DpsPlan>;
  updateDpsPlan(id: number, data: Partial<DpsPlan>): Promise<DpsPlan | undefined>;
  
  // DPS Account operations
  getUserDpsAccounts(userId: number): Promise<DpsAccount[]>;
  getDpsAccount(id: number): Promise<DpsAccount | undefined>;
  createDpsAccount(account: InsertDpsAccount): Promise<DpsAccount>;
  updateDpsAccount(id: number, data: Partial<DpsAccount>): Promise<DpsAccount | undefined>;
  
  // FDR Plan operations
  getAllFdrPlans(): Promise<FdrPlan[]>;
  getFdrPlan(id: number): Promise<FdrPlan | undefined>;
  createFdrPlan(plan: InsertFdrPlan): Promise<FdrPlan>;
  updateFdrPlan(id: number, data: Partial<FdrPlan>): Promise<FdrPlan | undefined>;
  
  // FDR Account operations
  getUserFdrAccounts(userId: number): Promise<FdrAccount[]>;
  getFdrAccount(id: number): Promise<FdrAccount | undefined>;
  createFdrAccount(account: InsertFdrAccount): Promise<FdrAccount>;
  updateFdrAccount(id: number, data: Partial<FdrAccount>): Promise<FdrAccount | undefined>;
  
  // Loan Type operations
  getAllLoanTypes(): Promise<LoanType[]>;
  getLoanType(id: number): Promise<LoanType | undefined>;
  createLoanType(type: InsertLoanType): Promise<LoanType>;
  updateLoanType(id: number, data: Partial<LoanType>): Promise<LoanType | undefined>;
  
  // Loan Application operations
  getUserLoanApplications(userId: number): Promise<LoanApplication[]>;
  getLoanApplication(id: number): Promise<LoanApplication | undefined>;
  createLoanApplication(application: InsertLoanApplication): Promise<LoanApplication>;
  updateLoanApplication(id: number, data: Partial<LoanApplication>): Promise<LoanApplication | undefined>;
  
  // Loan operations
  getUserLoans(userId: number): Promise<Loan[]>;
  getLoan(id: number): Promise<Loan | undefined>;
  createLoan(loan: InsertLoan): Promise<Loan>;
  updateLoan(id: number, data: Partial<Loan>): Promise<Loan | undefined>;
  
  // Bill Type operations
  getAllBillTypes(): Promise<BillType[]>;
  getBillType(id: number): Promise<BillType | undefined>;
  createBillType(type: InsertBillType): Promise<BillType>;
  updateBillType(id: number, data: Partial<BillType>): Promise<BillType | undefined>;
  
  // Bill Payment operations
  getUserBillPayments(userId: number): Promise<BillPayment[]>;
  getBillPayment(id: number): Promise<BillPayment | undefined>;
  createBillPayment(payment: InsertBillPayment): Promise<BillPayment>;
  updateBillPayment(id: number, data: Partial<BillPayment>): Promise<BillPayment | undefined>;
  
  // Support Ticket operations
  getUserSupportTickets(userId: number): Promise<SupportTicket[]>;
  getSupportTicket(id: number): Promise<SupportTicket | undefined>;
  createSupportTicket(ticket: InsertSupportTicket): Promise<SupportTicket>;
  updateSupportTicket(id: number, data: Partial<SupportTicket>): Promise<SupportTicket | undefined>;
  
  // Support Message operations
  getTicketMessages(ticketId: number): Promise<SupportMessage[]>;
  createSupportMessage(message: InsertSupportMessage): Promise<SupportMessage>;
  
  // Notification operations
  getUserNotifications(userId: number): Promise<Notification[]>;
  getNotification(id: number): Promise<Notification | undefined>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  updateNotification(id: number, data: Partial<Notification>): Promise<Notification | undefined>;
  markNotificationsAsRead(userId: number): Promise<void>;
  
  // Site Setting operations
  getAllSettings(): Promise<SiteSetting[]>;
  getSettingsByGroup(group: string): Promise<SiteSetting[]>;
  getSettingByKey(key: string): Promise<SiteSetting | undefined>;
  updateSetting(key: string, value: string): Promise<SiteSetting | undefined>;
  
  // Language operations
  getAllLanguages(): Promise<Language[]>;
  getLanguage(id: number): Promise<Language | undefined>;
  getLanguageByCode(code: string): Promise<Language | undefined>;
  createLanguage(language: InsertLanguage): Promise<Language>;
  updateLanguage(id: number, data: Partial<Language>): Promise<Language | undefined>;
  
  // Translation operations
  getTranslationsByLanguage(languageId: number): Promise<Translation[]>;
  createTranslation(translation: InsertTranslation): Promise<Translation>;
  updateTranslation(id: number, value: string): Promise<Translation | undefined>;
}

export class MemStorage implements IStorage {
  // Maps to store all entities
  private usersData: Map<number, User>;
  private walletsData: Map<number, Wallet>;
  private transactionsData: Map<number, Transaction>;
  private transfersData: Map<number, Transfer>;
  private dpsPlansData: Map<number, DpsPlan>;
  private dpsAccountsData: Map<number, DpsAccount>;
  private fdrPlansData: Map<number, FdrPlan>;
  private fdrAccountsData: Map<number, FdrAccount>;
  private loanTypesData: Map<number, LoanType>;
  private loanApplicationsData: Map<number, LoanApplication>;
  private loansData: Map<number, Loan>;
  private billTypesData: Map<number, BillType>;
  private billPaymentsData: Map<number, BillPayment>;
  private supportTicketsData: Map<number, SupportTicket>;
  private supportMessagesData: Map<number, SupportMessage>;
  private notificationsData: Map<number, Notification>;
  private siteSettingsData: Map<number, SiteSetting>;
  private languagesData: Map<number, Language>;
  private translationsData: Map<number, Translation>;
  
  // Current ID trackers
  private currentIds: {
    userId: number;
    walletId: number;
    transactionId: number;
    transferId: number;
    dpsPlanId: number;
    dpsAccountId: number;
    fdrPlanId: number;
    fdrAccountId: number;
    loanTypeId: number;
    loanApplicationId: number;
    loanId: number;
    billTypeId: number;
    billPaymentId: number;
    supportTicketId: number;
    supportMessageId: number;
    notificationId: number;
    siteSettingId: number;
    languageId: number;
    translationId: number;
  };

  constructor() {
    this.usersData = new Map<number, User>();
    this.walletsData = new Map<number, Wallet>();
    this.transactionsData = new Map<number, Transaction>();
    this.transfersData = new Map<number, Transfer>();
    this.dpsPlansData = new Map<number, DpsPlan>();
    this.dpsAccountsData = new Map<number, DpsAccount>();
    this.fdrPlansData = new Map<number, FdrPlan>();
    this.fdrAccountsData = new Map<number, FdrAccount>();
    this.loanTypesData = new Map<number, LoanType>();
    this.loanApplicationsData = new Map<number, LoanApplication>();
    this.loansData = new Map<number, Loan>();
    this.billTypesData = new Map<number, BillType>();
    this.billPaymentsData = new Map<number, BillPayment>();
    this.supportTicketsData = new Map<number, SupportTicket>();
    this.supportMessagesData = new Map<number, SupportMessage>();
    this.notificationsData = new Map<number, Notification>();
    this.siteSettingsData = new Map<number, SiteSetting>();
    this.languagesData = new Map<number, Language>();
    this.translationsData = new Map<number, Translation>();
    
    this.currentIds = {
      userId: 1,
      walletId: 1,
      transactionId: 1,
      transferId: 1,
      dpsPlanId: 1,
      dpsAccountId: 1,
      fdrPlanId: 1,
      fdrAccountId: 1,
      loanTypeId: 1,
      loanApplicationId: 1,
      loanId: 1,
      billTypeId: 1,
      billPaymentId: 1,
      supportTicketId: 1,
      supportMessageId: 1,
      notificationId: 1,
      siteSettingId: 1,
      languageId: 1,
      translationId: 1
    };

    // Initialize with demo data
    this.initializeData();
  }

  private initializeData() {
    // Create admin user
    this.createUser({
      username: "admin",
      password: "admin123", // In a real application, this would be hashed
      email: "admin@nexusbank.com",
      fullName: "Admin User",
      phone: "123-456-7890",
      role: "admin",
    });

    // Create regular user
    const user = this.createUser({
      username: "user",
      password: "user123", // In a real application, this would be hashed
      email: "user@example.com",
      fullName: "Demo User",
      phone: "987-654-3210",
      role: "user",
    });

    // Create wallets for the user
    this.createWallet({
      userId: user.id,
      type: "main",
      balance: 24659.25,
      currency: "USD",
      isActive: true,
    });

    this.createWallet({
      userId: user.id,
      type: "savings",
      balance: 12580.00,
      currency: "USD",
      isActive: true,
    });

    this.createWallet({
      userId: user.id,
      type: "crypto-btc",
      balance: 5820.18,
      currency: "USD",
      isActive: true,
    });

    // Add some transactions
    this.createTransaction({
      userId: user.id,
      walletId: 1,
      amount: 3200.00,
      type: "deposit",
      status: "completed",
      description: "Salary Deposit",
      reference: "From Acme Inc",
    });

    this.createTransaction({
      userId: user.id,
      walletId: 1,
      amount: -250.00,
      type: "transfer",
      status: "completed",
      description: "Online Transfer",
      reference: "To Jane Smith",
    });

    this.createTransaction({
      userId: user.id,
      walletId: 3,
      amount: -7100.00,
      type: "withdrawal",
      status: "completed",
      description: "Bitcoin Purchase",
      reference: "0.25 BTC @ $28,400",
    });

    // Create default DPS plans
    this.createDpsPlan({
      name: "Standard DPS",
      description: "Regular monthly deposits with competitive interest",
      term: 36,
      interestRate: 7.5,
      minAmount: 100.00,
      maxAmount: 5000.00,
      isActive: true,
    });

    this.createDpsPlan({
      name: "Premium DPS",
      description: "Higher interest rate for long-term monthly deposits",
      term: 60,
      interestRate: 8.25,
      minAmount: 500.00,
      maxAmount: 10000.00,
      isActive: true,
    });

    // Create default FDR plans
    this.createFdrPlan({
      name: "Standard FDR",
      description: "Fixed deposit with competitive interest",
      term: 12,
      interestRate: 6.0,
      minAmount: 1000.00,
      maxAmount: 50000.00,
      compounding: false,
      isActive: true,
    });

    this.createFdrPlan({
      name: "Premium FDR",
      description: "Higher interest rate for longer-term fixed deposits",
      term: 36,
      interestRate: 7.5,
      minAmount: 5000.00,
      maxAmount: 100000.00,
      compounding: true,
      isActive: true,
    });

    // Create some FDR accounts
    const startDate = new Date();
    const maturityDate = new Date(startDate);
    maturityDate.setMonth(maturityDate.getMonth() + 12);

    this.createFdrAccount({
      userId: user.id,
      planId: 1,
      accountNumber: "FDR10001",
      principalAmount: 10000.00,
      term: 12,
      interestRate: 6.0,
      compounding: false,
      startDate,
      maturityDate,
      status: "active",
      interestEarned: 300.00,
    });

    // Create loan types
    this.createLoanType({
      name: "Personal Loan",
      description: "Quick personal loans for any purpose",
      interestRate: 12.5,
      termMin: 6,
      termMax: 60,
      minAmount: 1000.00,
      maxAmount: 50000.00,
      processingFeePercent: 1.0,
      lateFeePercent: 2.0,
      isActive: true,
    });

    this.createLoanType({
      name: "Home Loan",
      description: "Affordable home loans with competitive rates",
      interestRate: 7.5,
      termMin: 60,
      termMax: 360,
      minAmount: 20000.00,
      maxAmount: 1000000.00,
      processingFeePercent: 0.5,
      lateFeePercent: 1.5,
      isActive: true,
    });

    // Create bill types
    this.createBillType({
      name: "Electricity",
      description: "Pay your electricity bills",
      category: "utility",
      icon: "bolt",
      isActive: true,
    });

    this.createBillType({
      name: "Water",
      description: "Pay your water bills",
      category: "utility",
      icon: "droplet",
      isActive: true,
    });

    this.createBillType({
      name: "Internet",
      description: "Pay your internet bills",
      category: "telecom",
      icon: "wifi",
      isActive: true,
    });

    // Create languages
    this.createLanguage({
      code: "en",
      name: "English",
      isRtl: false,
      isActive: true,
    });

    this.createLanguage({
      code: "ar",
      name: "Arabic",
      isRtl: true,
      isActive: true,
    });

    this.createLanguage({
      code: "es",
      name: "Spanish",
      isRtl: false,
      isActive: true,
    });

    // Create site settings
    this.createSiteSetting({
      key: "site_name",
      value: "NexusBank",
      group: "general",
    });

    this.createSiteSetting({
      key: "site_description",
      value: "Comprehensive Digital Banking Platform",
      group: "general",
    });

    this.createSiteSetting({
      key: "primary_color",
      value: "#3B82F6",
      group: "theme",
    });

    this.createSiteSetting({
      key: "secondary_color",
      value: "#8B5CF6",
      group: "theme",
    });

    this.createSiteSetting({
      key: "maintenance_mode",
      value: "false",
      group: "system",
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.usersData.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.usersData.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase()
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.usersData.values()).find(
      (user) => user.email.toLowerCase() === email.toLowerCase()
    );
  }

  async createUser(userData: InsertUser): Promise<User> {
    const id = this.currentIds.userId++;
    const now = new Date();
    const user: User = {
      ...userData,
      id,
      createdAt: now,
      kycStatus: userData.kycStatus || "pending",
      kycData: userData.kycData || null,
      role: userData.role || "user",
      referralCode: userData.referralCode || `REF${id}${Math.floor(Math.random() * 1000)}`,
      referredBy: userData.referredBy || null,
      rank: userData.rank || "bronze",
      rewardPoints: userData.rewardPoints || 0,
      language: userData.language || "en",
      isRtl: userData.isRtl || false,
      isDarkMode: userData.isDarkMode || false,
      lastLogin: null,
    };
    this.usersData.set(id, user);
    return user;
  }

  async updateUser(id: number, data: Partial<User>): Promise<User | undefined> {
    const user = this.usersData.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...data };
    this.usersData.set(id, updatedUser);
    return updatedUser;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.usersData.values());
  }

  // Wallet operations
  async getUserWallets(userId: number): Promise<Wallet[]> {
    return Array.from(this.walletsData.values()).filter(
      (wallet) => wallet.userId === userId
    );
  }

  async getWallet(id: number): Promise<Wallet | undefined> {
    return this.walletsData.get(id);
  }

  async createWallet(walletData: InsertWallet): Promise<Wallet> {
    const id = this.currentIds.walletId++;
    const now = new Date();
    const wallet: Wallet = {
      ...walletData,
      id,
      balance: walletData.balance || 0,
      isActive: walletData.isActive !== undefined ? walletData.isActive : true,
      createdAt: now,
    };
    this.walletsData.set(id, wallet);
    return wallet;
  }

  async updateWallet(id: number, data: Partial<Wallet>): Promise<Wallet | undefined> {
    const wallet = this.walletsData.get(id);
    if (!wallet) return undefined;
    
    const updatedWallet = { ...wallet, ...data };
    this.walletsData.set(id, updatedWallet);
    return updatedWallet;
  }

  // Transaction operations
  async getUserTransactions(userId: number, limit?: number): Promise<Transaction[]> {
    const transactions = Array.from(this.transactionsData.values())
      .filter((transaction) => transaction.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    return limit ? transactions.slice(0, limit) : transactions;
  }

  async getWalletTransactions(walletId: number, limit?: number): Promise<Transaction[]> {
    const transactions = Array.from(this.transactionsData.values())
      .filter((transaction) => transaction.walletId === walletId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    return limit ? transactions.slice(0, limit) : transactions;
  }

  async createTransaction(transactionData: InsertTransaction): Promise<Transaction> {
    const id = this.currentIds.transactionId++;
    const now = new Date();
    const transaction: Transaction = {
      ...transactionData,
      id,
      createdAt: now,
      updatedAt: now,
    };
    this.transactionsData.set(id, transaction);
    
    // Update wallet balance
    const wallet = this.walletsData.get(transactionData.walletId);
    if (wallet) {
      wallet.balance += transactionData.amount;
      this.walletsData.set(wallet.id, wallet);
    }
    
    return transaction;
  }

  // Transfer operations
  async getUserTransfers(userId: number): Promise<Transfer[]> {
    return Array.from(this.transfersData.values())
      .filter((transfer) => transfer.senderId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createTransfer(transferData: InsertTransfer): Promise<Transfer> {
    const id = this.currentIds.transferId++;
    const now = new Date();
    const transfer: Transfer = {
      ...transferData,
      id,
      createdAt: now,
      completedAt: null,
    };
    this.transfersData.set(id, transfer);
    return transfer;
  }

  async updateTransfer(id: number, data: Partial<Transfer>): Promise<Transfer | undefined> {
    const transfer = this.transfersData.get(id);
    if (!transfer) return undefined;
    
    const updatedTransfer = { ...transfer, ...data };
    this.transfersData.set(id, updatedTransfer);
    return updatedTransfer;
  }

  // DPS Plan operations
  async getAllDpsPlans(): Promise<DpsPlan[]> {
    return Array.from(this.dpsPlansData.values()).filter(plan => plan.isActive);
  }

  async getDpsPlan(id: number): Promise<DpsPlan | undefined> {
    return this.dpsPlansData.get(id);
  }

  async createDpsPlan(planData: InsertDpsPlan): Promise<DpsPlan> {
    const id = this.currentIds.dpsPlanId++;
    const plan: DpsPlan = {
      ...planData,
      id,
    };
    this.dpsPlansData.set(id, plan);
    return plan;
  }

  async updateDpsPlan(id: number, data: Partial<DpsPlan>): Promise<DpsPlan | undefined> {
    const plan = this.dpsPlansData.get(id);
    if (!plan) return undefined;
    
    const updatedPlan = { ...plan, ...data };
    this.dpsPlansData.set(id, updatedPlan);
    return updatedPlan;
  }

  // DPS Account operations
  async getUserDpsAccounts(userId: number): Promise<DpsAccount[]> {
    return Array.from(this.dpsAccountsData.values())
      .filter((account) => account.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getDpsAccount(id: number): Promise<DpsAccount | undefined> {
    return this.dpsAccountsData.get(id);
  }

  async createDpsAccount(accountData: InsertDpsAccount): Promise<DpsAccount> {
    const id = this.currentIds.dpsAccountId++;
    const now = new Date();
    const account: DpsAccount = {
      ...accountData,
      id,
      createdAt: now,
    };
    this.dpsAccountsData.set(id, account);
    return account;
  }

  async updateDpsAccount(id: number, data: Partial<DpsAccount>): Promise<DpsAccount | undefined> {
    const account = this.dpsAccountsData.get(id);
    if (!account) return undefined;
    
    const updatedAccount = { ...account, ...data };
    this.dpsAccountsData.set(id, updatedAccount);
    return updatedAccount;
  }

  // FDR Plan operations
  async getAllFdrPlans(): Promise<FdrPlan[]> {
    return Array.from(this.fdrPlansData.values()).filter(plan => plan.isActive);
  }

  async getFdrPlan(id: number): Promise<FdrPlan | undefined> {
    return this.fdrPlansData.get(id);
  }

  async createFdrPlan(planData: InsertFdrPlan): Promise<FdrPlan> {
    const id = this.currentIds.fdrPlanId++;
    const plan: FdrPlan = {
      ...planData,
      id,
    };
    this.fdrPlansData.set(id, plan);
    return plan;
  }

  async updateFdrPlan(id: number, data: Partial<FdrPlan>): Promise<FdrPlan | undefined> {
    const plan = this.fdrPlansData.get(id);
    if (!plan) return undefined;
    
    const updatedPlan = { ...plan, ...data };
    this.fdrPlansData.set(id, updatedPlan);
    return updatedPlan;
  }

  // FDR Account operations
  async getUserFdrAccounts(userId: number): Promise<FdrAccount[]> {
    return Array.from(this.fdrAccountsData.values())
      .filter((account) => account.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getFdrAccount(id: number): Promise<FdrAccount | undefined> {
    return this.fdrAccountsData.get(id);
  }

  async createFdrAccount(accountData: InsertFdrAccount): Promise<FdrAccount> {
    const id = this.currentIds.fdrAccountId++;
    const now = new Date();
    const account: FdrAccount = {
      ...accountData,
      id,
      createdAt: now,
    };
    this.fdrAccountsData.set(id, account);
    return account;
  }

  async updateFdrAccount(id: number, data: Partial<FdrAccount>): Promise<FdrAccount | undefined> {
    const account = this.fdrAccountsData.get(id);
    if (!account) return undefined;
    
    const updatedAccount = { ...account, ...data };
    this.fdrAccountsData.set(id, updatedAccount);
    return updatedAccount;
  }

  // Loan Type operations
  async getAllLoanTypes(): Promise<LoanType[]> {
    return Array.from(this.loanTypesData.values()).filter(type => type.isActive);
  }

  async getLoanType(id: number): Promise<LoanType | undefined> {
    return this.loanTypesData.get(id);
  }

  async createLoanType(typeData: InsertLoanType): Promise<LoanType> {
    const id = this.currentIds.loanTypeId++;
    const type: LoanType = {
      ...typeData,
      id,
    };
    this.loanTypesData.set(id, type);
    return type;
  }

  async updateLoanType(id: number, data: Partial<LoanType>): Promise<LoanType | undefined> {
    const type = this.loanTypesData.get(id);
    if (!type) return undefined;
    
    const updatedType = { ...type, ...data };
    this.loanTypesData.set(id, updatedType);
    return updatedType;
  }

  // Loan Application operations
  async getUserLoanApplications(userId: number): Promise<LoanApplication[]> {
    return Array.from(this.loanApplicationsData.values())
      .filter((application) => application.userId === userId)
      .sort((a, b) => b.applicationDate.getTime() - a.applicationDate.getTime());
  }

  async getLoanApplication(id: number): Promise<LoanApplication | undefined> {
    return this.loanApplicationsData.get(id);
  }

  async createLoanApplication(applicationData: InsertLoanApplication): Promise<LoanApplication> {
    const id = this.currentIds.loanApplicationId++;
    const now = new Date();
    const application: LoanApplication = {
      ...applicationData,
      id,
      applicationDate: now,
      approvedDate: null,
      disbursedDate: null,
    };
    this.loanApplicationsData.set(id, application);
    return application;
  }

  async updateLoanApplication(id: number, data: Partial<LoanApplication>): Promise<LoanApplication | undefined> {
    const application = this.loanApplicationsData.get(id);
    if (!application) return undefined;
    
    const updatedApplication = { ...application, ...data };
    this.loanApplicationsData.set(id, updatedApplication);
    return updatedApplication;
  }

  // Loan operations
  async getUserLoans(userId: number): Promise<Loan[]> {
    return Array.from(this.loansData.values())
      .filter((loan) => loan.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getLoan(id: number): Promise<Loan | undefined> {
    return this.loansData.get(id);
  }

  async createLoan(loanData: InsertLoan): Promise<Loan> {
    const id = this.currentIds.loanId++;
    const now = new Date();
    const loan: Loan = {
      ...loanData,
      id,
      createdAt: now,
    };
    this.loansData.set(id, loan);
    return loan;
  }

  async updateLoan(id: number, data: Partial<Loan>): Promise<Loan | undefined> {
    const loan = this.loansData.get(id);
    if (!loan) return undefined;
    
    const updatedLoan = { ...loan, ...data };
    this.loansData.set(id, updatedLoan);
    return updatedLoan;
  }

  // Bill Type operations
  async getAllBillTypes(): Promise<BillType[]> {
    return Array.from(this.billTypesData.values()).filter(type => type.isActive);
  }

  async getBillType(id: number): Promise<BillType | undefined> {
    return this.billTypesData.get(id);
  }

  async createBillType(typeData: InsertBillType): Promise<BillType> {
    const id = this.currentIds.billTypeId++;
    const type: BillType = {
      ...typeData,
      id,
    };
    this.billTypesData.set(id, type);
    return type;
  }

  async updateBillType(id: number, data: Partial<BillType>): Promise<BillType | undefined> {
    const type = this.billTypesData.get(id);
    if (!type) return undefined;
    
    const updatedType = { ...type, ...data };
    this.billTypesData.set(id, updatedType);
    return updatedType;
  }

  // Bill Payment operations
  async getUserBillPayments(userId: number): Promise<BillPayment[]> {
    return Array.from(this.billPaymentsData.values())
      .filter((payment) => payment.userId === userId)
      .sort((a, b) => b.paymentDate.getTime() - a.paymentDate.getTime());
  }

  async getBillPayment(id: number): Promise<BillPayment | undefined> {
    return this.billPaymentsData.get(id);
  }

  async createBillPayment(paymentData: InsertBillPayment): Promise<BillPayment> {
    const id = this.currentIds.billPaymentId++;
    const now = new Date();
    const payment: BillPayment = {
      ...paymentData,
      id,
      paymentDate: now,
    };
    this.billPaymentsData.set(id, payment);
    return payment;
  }

  async updateBillPayment(id: number, data: Partial<BillPayment>): Promise<BillPayment | undefined> {
    const payment = this.billPaymentsData.get(id);
    if (!payment) return undefined;
    
    const updatedPayment = { ...payment, ...data };
    this.billPaymentsData.set(id, updatedPayment);
    return updatedPayment;
  }

  // Support Ticket operations
  async getUserSupportTickets(userId: number): Promise<SupportTicket[]> {
    return Array.from(this.supportTicketsData.values())
      .filter((ticket) => ticket.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getSupportTicket(id: number): Promise<SupportTicket | undefined> {
    return this.supportTicketsData.get(id);
  }

  async createSupportTicket(ticketData: InsertSupportTicket): Promise<SupportTicket> {
    const id = this.currentIds.supportTicketId++;
    const now = new Date();
    const ticket: SupportTicket = {
      ...ticketData,
      id,
      createdAt: now,
      updatedAt: now,
      closedAt: null,
    };
    this.supportTicketsData.set(id, ticket);
    return ticket;
  }

  async updateSupportTicket(id: number, data: Partial<SupportTicket>): Promise<SupportTicket | undefined> {
    const ticket = this.supportTicketsData.get(id);
    if (!ticket) return undefined;
    
    const updatedTicket = { ...ticket, ...data, updatedAt: new Date() };
    this.supportTicketsData.set(id, updatedTicket);
    return updatedTicket;
  }

  // Support Message operations
  async getTicketMessages(ticketId: number): Promise<SupportMessage[]> {
    return Array.from(this.supportMessagesData.values())
      .filter((message) => message.ticketId === ticketId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  async createSupportMessage(messageData: InsertSupportMessage): Promise<SupportMessage> {
    const id = this.currentIds.supportMessageId++;
    const now = new Date();
    const message: SupportMessage = {
      ...messageData,
      id,
      createdAt: now,
    };
    this.supportMessagesData.set(id, message);
    
    // Update the ticket's updatedAt time
    const ticket = this.supportTicketsData.get(messageData.ticketId);
    if (ticket) {
      ticket.updatedAt = now;
      this.supportTicketsData.set(ticket.id, ticket);
    }
    
    return message;
  }

  // Notification operations
  async getUserNotifications(userId: number): Promise<Notification[]> {
    return Array.from(this.notificationsData.values())
      .filter((notification) => notification.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getNotification(id: number): Promise<Notification | undefined> {
    return this.notificationsData.get(id);
  }

  async createNotification(notificationData: InsertNotification): Promise<Notification> {
    const id = this.currentIds.notificationId++;
    const now = new Date();
    const notification: Notification = {
      ...notificationData,
      id,
      createdAt: now,
    };
    this.notificationsData.set(id, notification);
    return notification;
  }

  async updateNotification(id: number, data: Partial<Notification>): Promise<Notification | undefined> {
    const notification = this.notificationsData.get(id);
    if (!notification) return undefined;
    
    const updatedNotification = { ...notification, ...data };
    this.notificationsData.set(id, updatedNotification);
    return updatedNotification;
  }

  async markNotificationsAsRead(userId: number): Promise<void> {
    const notifications = Array.from(this.notificationsData.values())
      .filter(notification => notification.userId === userId && !notification.isRead);
    
    for (const notification of notifications) {
      notification.isRead = true;
      this.notificationsData.set(notification.id, notification);
    }
  }

  // Site Setting operations
  async getAllSettings(): Promise<SiteSetting[]> {
    return Array.from(this.siteSettingsData.values());
  }

  async getSettingsByGroup(group: string): Promise<SiteSetting[]> {
    return Array.from(this.siteSettingsData.values())
      .filter(setting => setting.group === group);
  }

  async getSettingByKey(key: string): Promise<SiteSetting | undefined> {
    return Array.from(this.siteSettingsData.values())
      .find(setting => setting.key === key);
  }

  private async createSiteSetting(settingData: InsertSiteSetting): Promise<SiteSetting> {
    const id = this.currentIds.siteSettingId++;
    const now = new Date();
    const setting: SiteSetting = {
      ...settingData,
      id,
      updatedAt: now,
    };
    this.siteSettingsData.set(id, setting);
    return setting;
  }

  async updateSetting(key: string, value: string): Promise<SiteSetting | undefined> {
    const setting = Array.from(this.siteSettingsData.values())
      .find(s => s.key === key);
    
    if (!setting) return undefined;
    
    const updatedSetting = { ...setting, value, updatedAt: new Date() };
    this.siteSettingsData.set(setting.id, updatedSetting);
    return updatedSetting;
  }

  // Language operations
  async getAllLanguages(): Promise<Language[]> {
    return Array.from(this.languagesData.values());
  }

  async getLanguage(id: number): Promise<Language | undefined> {
    return this.languagesData.get(id);
  }

  async getLanguageByCode(code: string): Promise<Language | undefined> {
    return Array.from(this.languagesData.values())
      .find(language => language.code === code);
  }

  async createLanguage(languageData: InsertLanguage): Promise<Language> {
    const id = this.currentIds.languageId++;
    const language: Language = {
      ...languageData,
      id,
    };
    this.languagesData.set(id, language);
    return language;
  }

  async updateLanguage(id: number, data: Partial<Language>): Promise<Language | undefined> {
    const language = this.languagesData.get(id);
    if (!language) return undefined;
    
    const updatedLanguage = { ...language, ...data };
    this.languagesData.set(id, updatedLanguage);
    return updatedLanguage;
  }

  // Translation operations
  async getTranslationsByLanguage(languageId: number): Promise<Translation[]> {
    return Array.from(this.translationsData.values())
      .filter(translation => translation.languageId === languageId);
  }

  async createTranslation(translationData: InsertTranslation): Promise<Translation> {
    const id = this.currentIds.translationId++;
    const translation: Translation = {
      ...translationData,
      id,
    };
    this.translationsData.set(id, translation);
    return translation;
  }

  async updateTranslation(id: number, value: string): Promise<Translation | undefined> {
    const translation = this.translationsData.get(id);
    if (!translation) return undefined;
    
    const updatedTranslation = { ...translation, value };
    this.translationsData.set(id, updatedTranslation);
    return updatedTranslation;
  }
}

export const storage = new MemStorage();
