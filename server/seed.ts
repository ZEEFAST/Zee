import { db } from "./db";
import * as bcrypt from "bcryptjs";
import {
  users,
  wallets,
  transactions,
  dpsPlans,
  fdrPlans,
  loanTypes,
  billTypes,
  languages,
  siteSettings
} from "@shared/schema";

export async function seedDatabase() {
  console.log("Seeding database...");
  
  try {
    // Check if we have any users already
    const existingUsers = await db.select().from(users);
    
    if (existingUsers.length > 0) {
      console.log("Database already seeded, skipping...");
      return;
    }
    
    // Create admin users
    const adminPassword = await bcrypt.hash("admin123", 10);
    const skyAdminPassword = await bcrypt.hash("skycent", 10);
    const userPassword = await bcrypt.hash("user123", 10);
    
    // Create system admin user
    const [adminUser] = await db.insert(users).values({
      username: "admin",
      password: adminPassword,
      email: "admin@citibank.com",
      fullName: "Admin User",
      phone: "123-456-7890",
      kycStatus: "approved",
      role: "admin",
      language: "en",
      isRtl: false,
      isDarkMode: false,
      createdAt: new Date(),
      referralCode: "REF0001",
    }).returning();
    
    // Create admin user with provided credentials
    const [skyAdmin] = await db.insert(users).values({
      username: "sky123",
      password: skyAdminPassword,
      email: "sky@citibank.com",
      fullName: "Sky Admin",
      phone: "555-123-4567",
      kycStatus: "approved",
      role: "admin",
      language: "en",
      isRtl: false,
      isDarkMode: false,
      createdAt: new Date(),
      referralCode: "REF0002",
    }).returning();
    
    // Create regular user
    const [regularUser] = await db.insert(users).values({
      username: "user",
      password: userPassword,
      email: "user@example.com",
      fullName: "Demo User",
      phone: "987-654-3210",
      kycStatus: "approved",
      role: "user",
      language: "en",
      isRtl: false,
      isDarkMode: false,
      createdAt: new Date(),
      referralCode: "REF0003",
    }).returning();
    
    // Create wallets for the user
    const [mainWallet] = await db.insert(wallets).values({
      userId: regularUser.id,
      type: "main",
      balance: 24659.25,
      currency: "USD",
      isActive: true,
      createdAt: new Date(),
    }).returning();
    
    await db.insert(wallets).values({
      userId: regularUser.id,
      type: "savings",
      balance: 12580.00,
      currency: "USD",
      isActive: true,
      createdAt: new Date(),
    });
    
    const [cryptoWallet] = await db.insert(wallets).values({
      userId: regularUser.id,
      type: "crypto-btc",
      balance: 5820.18,
      currency: "USD",
      isActive: true,
      createdAt: new Date(),
    }).returning();
    
    // Add some transactions
    await db.insert(transactions).values({
      userId: regularUser.id,
      walletId: mainWallet.id,
      amount: 3200.00,
      type: "deposit",
      status: "completed",
      description: "Salary Deposit",
      reference: "From Acme Inc",
      createdAt: new Date(),
    });
    
    await db.insert(transactions).values({
      userId: regularUser.id,
      walletId: mainWallet.id,
      amount: -250.00,
      type: "transfer",
      status: "completed",
      description: "Online Transfer",
      reference: "To Jane Smith",
      createdAt: new Date(),
    });
    
    await db.insert(transactions).values({
      userId: regularUser.id,
      walletId: cryptoWallet.id,
      amount: -7100.00,
      type: "withdrawal",
      status: "completed",
      description: "Bitcoin Purchase",
      reference: "0.25 BTC @ $28,400",
      createdAt: new Date(),
    });
    
    // Create default DPS plans
    await db.insert(dpsPlans).values({
      name: "Standard DPS",
      description: "Regular monthly deposits with competitive interest",
      term: 36,
      interestRate: 7.5,
      minAmount: 100.00,
      maxAmount: 5000.00,
      isActive: true,
    });
    
    await db.insert(dpsPlans).values({
      name: "Premium DPS",
      description: "Higher interest rate for long-term monthly deposits",
      term: 60,
      interestRate: 8.25,
      minAmount: 500.00,
      maxAmount: 10000.00,
      isActive: true,
    });
    
    // Create default FDR plans
    await db.insert(fdrPlans).values({
      name: "Standard FDR",
      description: "Fixed deposit with competitive interest",
      term: 12,
      interestRate: 6.0,
      minAmount: 1000.00,
      maxAmount: 50000.00,
      compounding: false,
      isActive: true,
    });
    
    await db.insert(fdrPlans).values({
      name: "Premium FDR",
      description: "Higher interest rate for longer-term fixed deposits",
      term: 36,
      interestRate: 7.5,
      minAmount: 5000.00,
      maxAmount: 100000.00,
      compounding: true,
      isActive: true,
    });
    
    // Create loan types
    await db.insert(loanTypes).values({
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
    
    await db.insert(loanTypes).values({
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
    await db.insert(billTypes).values({
      name: "Electricity",
      description: "Pay your electricity bills",
      category: "utility",
      icon: "bolt",
      isActive: true,
    });
    
    await db.insert(billTypes).values({
      name: "Water",
      description: "Pay your water bills",
      category: "utility",
      icon: "droplet",
      isActive: true,
    });
    
    await db.insert(billTypes).values({
      name: "Internet",
      description: "Pay your internet bills",
      category: "telecom",
      icon: "wifi",
      isActive: true,
    });
    
    // Create languages
    await db.insert(languages).values({
      code: "en",
      name: "English",
      isRtl: false,
      isActive: true,
    });
    
    await db.insert(languages).values({
      code: "ar",
      name: "Arabic",
      isRtl: true,
      isActive: true,
    });
    
    await db.insert(languages).values({
      code: "es",
      name: "Spanish",
      isRtl: false,
      isActive: true,
    });
    
    // Create site settings
    await db.insert(siteSettings).values({
      key: "site_name",
      value: "CITI BANK LTD",
      group: "general",
      updatedAt: new Date(),
    });
    
    await db.insert(siteSettings).values({
      key: "site_description",
      value: "Comprehensive Digital Banking Platform",
      group: "general",
      updatedAt: new Date(),
    });
    
    await db.insert(siteSettings).values({
      key: "primary_color",
      value: "#3B82F6",
      group: "theme",
      updatedAt: new Date(),
    });
    
    await db.insert(siteSettings).values({
      key: "secondary_color",
      value: "#8B5CF6",
      group: "theme",
      updatedAt: new Date(),
    });
    
    await db.insert(siteSettings).values({
      key: "maintenance_mode",
      value: "false",
      group: "system",
      updatedAt: new Date(),
    });
    
    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}