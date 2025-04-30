import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import express from "express";
import session from "express-session";
import { z } from "zod";
import { insertUserSchema, insertWalletSchema, insertTransactionSchema, insertTransferSchema, insertSupportTicketSchema, insertSupportMessageSchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";
import MemoryStore from "memorystore";
import path from "path";

// Initialize session store
const MemoryStoreSession = MemoryStore(session);

export async function registerRoutes(app: Express): Promise<Server> {
  // Session middleware
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "nexusbank-secret",
      resave: false,
      saveUninitialized: false,
      cookie: { secure: process.env.NODE_ENV === "production", maxAge: 24 * 60 * 60 * 1000 },
      store: new MemoryStoreSession({
        checkPeriod: 86400000, // prune expired entries every 24h
      }),
    })
  );

  // Middleware to check if user is authenticated
  const isAuthenticated = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (req.session && req.session.userId) {
      return next();
    }
    return res.status(401).json({ message: "Unauthorized" });
  };

  // Middleware to check if user is admin
  const isAdmin = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await storage.getUser(req.session.userId);
    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    return next();
  };

  // Helper function to validate request body against zod schema
  function validateRequest<T>(schema: z.ZodType<T>) {
    return (req: express.Request, res: express.Response, next: express.NextFunction) => {
      try {
        req.body = schema.parse(req.body);
        next();
      } catch (error) {
        if (error instanceof z.ZodError) {
          const validationError = fromZodError(error);
          return res.status(400).json({ message: validationError.message });
        }
        return res.status(400).json({ message: "Invalid request data" });
      }
    };
  }

  // Authentication Routes
  app.post("/api/auth/login", async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }

    const user = await storage.getUserByUsername(username);
    if (!user || user.password !== password) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    // Update last login time
    await storage.updateUser(user.id, { lastLogin: new Date() });

    // Set user session
    req.session.userId = user.id;
    req.session.userRole = user.role;

    return res.status(200).json({
      id: user.id,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      language: user.language,
      isRtl: user.isRtl,
      isDarkMode: user.isDarkMode,
    });
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Failed to logout" });
      }
      return res.status(200).json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/user", isAuthenticated, async (req, res) => {
    const userId = req.session.userId!;
    const user = await storage.getUser(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      id: user.id,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      language: user.language,
      isRtl: user.isRtl,
      isDarkMode: user.isDarkMode,
      kycStatus: user.kycStatus,
      rank: user.rank,
      rewardPoints: user.rewardPoints,
    });
  });

  app.post("/api/auth/register", validateRequest(insertUserSchema), async (req, res) => {
    const { username, email } = req.body;

    // Check if username already exists
    const existingUsername = await storage.getUserByUsername(username);
    if (existingUsername) {
      return res.status(400).json({ message: "Username already taken" });
    }

    // Check if email already exists
    const existingEmail = await storage.getUserByEmail(email);
    if (existingEmail) {
      return res.status(400).json({ message: "Email already registered" });
    }

    try {
      const user = await storage.createUser(req.body);
      
      // Create default main wallet for new user
      await storage.createWallet({
        userId: user.id,
        type: "main",
        balance: 0,
        currency: "USD",
        isActive: true,
      });

      // Don't return password in response
      const { password, ...userWithoutPassword } = user;
      return res.status(201).json(userWithoutPassword);
    } catch (error) {
      console.error("Registration error:", error);
      return res.status(500).json({ message: "Error creating user" });
    }
  });

  // User Profile Routes
  app.get("/api/profile", isAuthenticated, async (req, res) => {
    const userId = req.session.userId!;
    const user = await storage.getUser(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Don't return password in response
    const { password, ...userWithoutPassword } = user;
    return res.status(200).json(userWithoutPassword);
  });

  app.patch("/api/profile", isAuthenticated, async (req, res) => {
    const userId = req.session.userId!;
    const allowedFields = ["fullName", "phone", "address", "language", "isRtl", "isDarkMode"];
    
    // Filter out any fields that aren't allowed to be updated
    const updateData: Record<string, any> = {};
    for (const key of allowedFields) {
      if (req.body[key] !== undefined) {
        updateData[key] = req.body[key];
      }
    }

    try {
      const updatedUser = await storage.updateUser(userId, updateData);
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      // Don't return password in response
      const { password, ...userWithoutPassword } = updatedUser;
      return res.status(200).json(userWithoutPassword);
    } catch (error) {
      console.error("Profile update error:", error);
      return res.status(500).json({ message: "Error updating profile" });
    }
  });

  // Wallet Routes
  app.get("/api/wallets", isAuthenticated, async (req, res) => {
    const userId = req.session.userId!;
    try {
      const wallets = await storage.getUserWallets(userId);
      return res.status(200).json(wallets);
    } catch (error) {
      console.error("Get wallets error:", error);
      return res.status(500).json({ message: "Error fetching wallets" });
    }
  });

  app.get("/api/wallets/:id", isAuthenticated, async (req, res) => {
    const walletId = parseInt(req.params.id);
    if (isNaN(walletId)) {
      return res.status(400).json({ message: "Invalid wallet ID" });
    }

    try {
      const wallet = await storage.getWallet(walletId);
      if (!wallet) {
        return res.status(404).json({ message: "Wallet not found" });
      }

      // Check if wallet belongs to logged in user
      if (wallet.userId !== req.session.userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      return res.status(200).json(wallet);
    } catch (error) {
      console.error("Get wallet error:", error);
      return res.status(500).json({ message: "Error fetching wallet" });
    }
  });

  app.post("/api/wallets", isAuthenticated, validateRequest(insertWalletSchema), async (req, res) => {
    const userId = req.session.userId!;
    
    // Force userId to be the logged in user
    req.body.userId = userId;

    try {
      const wallet = await storage.createWallet(req.body);
      return res.status(201).json(wallet);
    } catch (error) {
      console.error("Create wallet error:", error);
      return res.status(500).json({ message: "Error creating wallet" });
    }
  });

  // Transaction Routes
  app.get("/api/transactions", isAuthenticated, async (req, res) => {
    const userId = req.session.userId!;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
    
    try {
      const transactions = await storage.getUserTransactions(userId, limit);
      return res.status(200).json(transactions);
    } catch (error) {
      console.error("Get transactions error:", error);
      return res.status(500).json({ message: "Error fetching transactions" });
    }
  });

  app.get("/api/wallets/:id/transactions", isAuthenticated, async (req, res) => {
    const walletId = parseInt(req.params.id);
    if (isNaN(walletId)) {
      return res.status(400).json({ message: "Invalid wallet ID" });
    }

    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;

    try {
      const wallet = await storage.getWallet(walletId);
      if (!wallet) {
        return res.status(404).json({ message: "Wallet not found" });
      }

      // Check if wallet belongs to logged in user
      if (wallet.userId !== req.session.userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const transactions = await storage.getWalletTransactions(walletId, limit);
      return res.status(200).json(transactions);
    } catch (error) {
      console.error("Get wallet transactions error:", error);
      return res.status(500).json({ message: "Error fetching transactions" });
    }
  });

  app.post("/api/transactions", isAuthenticated, validateRequest(insertTransactionSchema), async (req, res) => {
    const userId = req.session.userId!;
    
    // Force userId to be the logged in user
    req.body.userId = userId;

    // Verify that the wallet belongs to the user
    const wallet = await storage.getWallet(req.body.walletId);
    if (!wallet || wallet.userId !== userId) {
      return res.status(403).json({ message: "Access denied" });
    }

    try {
      const transaction = await storage.createTransaction(req.body);
      return res.status(201).json(transaction);
    } catch (error) {
      console.error("Create transaction error:", error);
      return res.status(500).json({ message: "Error creating transaction" });
    }
  });

  // Transfer Routes
  app.get("/api/transfers", isAuthenticated, async (req, res) => {
    const userId = req.session.userId!;
    
    try {
      const transfers = await storage.getUserTransfers(userId);
      return res.status(200).json(transfers);
    } catch (error) {
      console.error("Get transfers error:", error);
      return res.status(500).json({ message: "Error fetching transfers" });
    }
  });

  app.post("/api/transfers", isAuthenticated, validateRequest(insertTransferSchema), async (req, res) => {
    const userId = req.session.userId!;
    
    // Force senderId to be the logged in user
    req.body.senderId = userId;

    // Verify that the from wallet belongs to the user
    const wallet = await storage.getWallet(req.body.fromWalletId);
    if (!wallet || wallet.userId !== userId) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Check if there's enough balance
    if (wallet.balance < req.body.amount + (req.body.fee || 0)) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    try {
      // Create transfer record
      const transfer = await storage.createTransfer(req.body);

      // Create transaction for the sender (debit)
      await storage.createTransaction({
        userId,
        walletId: req.body.fromWalletId,
        amount: -(req.body.amount + (req.body.fee || 0)),
        type: "transfer",
        status: "completed",
        description: `Transfer ${req.body.type}`,
        reference: `Transfer ID: ${transfer.id}`,
      });

      // If it's an internal transfer, create transaction for recipient
      if (req.body.toWalletId) {
        const toWallet = await storage.getWallet(req.body.toWalletId);
        if (toWallet) {
          await storage.createTransaction({
            userId: toWallet.userId,
            walletId: req.body.toWalletId,
            amount: req.body.amount,
            type: "transfer",
            status: "completed",
            description: "Transfer received",
            reference: `Transfer ID: ${transfer.id}`,
          });

          // Mark transfer as completed
          await storage.updateTransfer(transfer.id, {
            status: "completed",
            completedAt: new Date(),
          });
        }
      }

      return res.status(201).json(transfer);
    } catch (error) {
      console.error("Create transfer error:", error);
      return res.status(500).json({ message: "Error creating transfer" });
    }
  });

  // DPS Routes
  app.get("/api/dps/plans", async (req, res) => {
    try {
      const plans = await storage.getAllDpsPlans();
      return res.status(200).json(plans);
    } catch (error) {
      console.error("Get DPS plans error:", error);
      return res.status(500).json({ message: "Error fetching DPS plans" });
    }
  });

  app.get("/api/dps/accounts", isAuthenticated, async (req, res) => {
    const userId = req.session.userId!;
    
    try {
      const accounts = await storage.getUserDpsAccounts(userId);
      return res.status(200).json(accounts);
    } catch (error) {
      console.error("Get DPS accounts error:", error);
      return res.status(500).json({ message: "Error fetching DPS accounts" });
    }
  });

  // FDR Routes
  app.get("/api/fdr/plans", async (req, res) => {
    try {
      const plans = await storage.getAllFdrPlans();
      return res.status(200).json(plans);
    } catch (error) {
      console.error("Get FDR plans error:", error);
      return res.status(500).json({ message: "Error fetching FDR plans" });
    }
  });

  app.get("/api/fdr/accounts", isAuthenticated, async (req, res) => {
    const userId = req.session.userId!;
    
    try {
      const accounts = await storage.getUserFdrAccounts(userId);
      return res.status(200).json(accounts);
    } catch (error) {
      console.error("Get FDR accounts error:", error);
      return res.status(500).json({ message: "Error fetching FDR accounts" });
    }
  });

  // Loan Routes
  app.get("/api/loans/types", async (req, res) => {
    try {
      const types = await storage.getAllLoanTypes();
      return res.status(200).json(types);
    } catch (error) {
      console.error("Get loan types error:", error);
      return res.status(500).json({ message: "Error fetching loan types" });
    }
  });

  app.get("/api/loans/applications", isAuthenticated, async (req, res) => {
    const userId = req.session.userId!;
    
    try {
      const applications = await storage.getUserLoanApplications(userId);
      return res.status(200).json(applications);
    } catch (error) {
      console.error("Get loan applications error:", error);
      return res.status(500).json({ message: "Error fetching loan applications" });
    }
  });

  app.get("/api/loans", isAuthenticated, async (req, res) => {
    const userId = req.session.userId!;
    
    try {
      const loans = await storage.getUserLoans(userId);
      return res.status(200).json(loans);
    } catch (error) {
      console.error("Get loans error:", error);
      return res.status(500).json({ message: "Error fetching loans" });
    }
  });

  // Bill Payment Routes
  app.get("/api/bills/types", async (req, res) => {
    try {
      const types = await storage.getAllBillTypes();
      return res.status(200).json(types);
    } catch (error) {
      console.error("Get bill types error:", error);
      return res.status(500).json({ message: "Error fetching bill types" });
    }
  });

  app.get("/api/bills/payments", isAuthenticated, async (req, res) => {
    const userId = req.session.userId!;
    
    try {
      const payments = await storage.getUserBillPayments(userId);
      return res.status(200).json(payments);
    } catch (error) {
      console.error("Get bill payments error:", error);
      return res.status(500).json({ message: "Error fetching bill payments" });
    }
  });

  // Support Ticket Routes
  app.get("/api/support/tickets", isAuthenticated, async (req, res) => {
    const userId = req.session.userId!;
    
    try {
      const tickets = await storage.getUserSupportTickets(userId);
      return res.status(200).json(tickets);
    } catch (error) {
      console.error("Get support tickets error:", error);
      return res.status(500).json({ message: "Error fetching support tickets" });
    }
  });

  app.post("/api/support/tickets", isAuthenticated, validateRequest(insertSupportTicketSchema), async (req, res) => {
    const userId = req.session.userId!;
    
    // Force userId to be the logged in user
    req.body.userId = userId;

    try {
      const ticket = await storage.createSupportTicket(req.body);
      return res.status(201).json(ticket);
    } catch (error) {
      console.error("Create support ticket error:", error);
      return res.status(500).json({ message: "Error creating support ticket" });
    }
  });

  app.get("/api/support/tickets/:id/messages", isAuthenticated, async (req, res) => {
    const ticketId = parseInt(req.params.id);
    if (isNaN(ticketId)) {
      return res.status(400).json({ message: "Invalid ticket ID" });
    }

    try {
      const ticket = await storage.getSupportTicket(ticketId);
      if (!ticket) {
        return res.status(404).json({ message: "Ticket not found" });
      }

      // Check if ticket belongs to logged in user or user is admin
      if (ticket.userId !== req.session.userId && req.session.userRole !== "admin") {
        return res.status(403).json({ message: "Access denied" });
      }

      const messages = await storage.getTicketMessages(ticketId);
      return res.status(200).json(messages);
    } catch (error) {
      console.error("Get ticket messages error:", error);
      return res.status(500).json({ message: "Error fetching ticket messages" });
    }
  });

  app.post("/api/support/tickets/:id/messages", isAuthenticated, validateRequest(insertSupportMessageSchema), async (req, res) => {
    const ticketId = parseInt(req.params.id);
    if (isNaN(ticketId)) {
      return res.status(400).json({ message: "Invalid ticket ID" });
    }

    const userId = req.session.userId!;
    
    try {
      const ticket = await storage.getSupportTicket(ticketId);
      if (!ticket) {
        return res.status(404).json({ message: "Ticket not found" });
      }

      // Check if ticket belongs to logged in user or user is admin
      const isUserAdmin = req.session.userRole === "admin";
      if (ticket.userId !== userId && !isUserAdmin) {
        return res.status(403).json({ message: "Access denied" });
      }

      // Set the message properties
      req.body.ticketId = ticketId;
      req.body.senderId = userId;
      req.body.isStaff = isUserAdmin;

      const message = await storage.createSupportMessage(req.body);
      return res.status(201).json(message);
    } catch (error) {
      console.error("Create support message error:", error);
      return res.status(500).json({ message: "Error creating support message" });
    }
  });

  // Notification Routes
  app.get("/api/notifications", isAuthenticated, async (req, res) => {
    const userId = req.session.userId!;
    
    try {
      const notifications = await storage.getUserNotifications(userId);
      return res.status(200).json(notifications);
    } catch (error) {
      console.error("Get notifications error:", error);
      return res.status(500).json({ message: "Error fetching notifications" });
    }
  });

  app.post("/api/notifications/read", isAuthenticated, async (req, res) => {
    const userId = req.session.userId!;
    
    try {
      await storage.markNotificationsAsRead(userId);
      return res.status(200).json({ message: "Notifications marked as read" });
    } catch (error) {
      console.error("Mark notifications as read error:", error);
      return res.status(500).json({ message: "Error marking notifications as read" });
    }
  });

  // Language Routes
  app.get("/api/languages", async (req, res) => {
    try {
      const languages = await storage.getAllLanguages();
      return res.status(200).json(languages);
    } catch (error) {
      console.error("Get languages error:", error);
      return res.status(500).json({ message: "Error fetching languages" });
    }
  });

  app.get("/api/languages/:code/translations", async (req, res) => {
    const { code } = req.params;
    
    try {
      const language = await storage.getLanguageByCode(code);
      if (!language) {
        return res.status(404).json({ message: "Language not found" });
      }

      const translations = await storage.getTranslationsByLanguage(language.id);
      
      // Convert to a more usable format for the frontend
      const translationsMap: Record<string, string> = {};
      for (const translation of translations) {
        translationsMap[translation.key] = translation.value;
      }

      return res.status(200).json(translationsMap);
    } catch (error) {
      console.error("Get translations error:", error);
      return res.status(500).json({ message: "Error fetching translations" });
    }
  });

  // Admin Routes
  app.get("/api/admin/users", isAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      // Don't return passwords in response
      const usersWithoutPasswords = users.map(({ password, ...user }) => user);
      return res.status(200).json(usersWithoutPasswords);
    } catch (error) {
      console.error("Admin get users error:", error);
      return res.status(500).json({ message: "Error fetching users" });
    }
  });

  app.get("/api/admin/settings", isAdmin, async (req, res) => {
    try {
      const settings = await storage.getAllSettings();
      return res.status(200).json(settings);
    } catch (error) {
      console.error("Admin get settings error:", error);
      return res.status(500).json({ message: "Error fetching settings" });
    }
  });

  app.patch("/api/admin/settings/:key", isAdmin, async (req, res) => {
    const { key } = req.params;
    const { value } = req.body;
    
    if (value === undefined) {
      return res.status(400).json({ message: "Value is required" });
    }

    try {
      const setting = await storage.updateSetting(key, String(value));
      if (!setting) {
        return res.status(404).json({ message: "Setting not found" });
      }
      return res.status(200).json(setting);
    } catch (error) {
      console.error("Admin update setting error:", error);
      return res.status(500).json({ message: "Error updating setting" });
    }
  });

  app.patch("/api/admin/users/:id", isAdmin, async (req, res) => {
    const userId = parseInt(req.params.id);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const allowedFields = ["fullName", "email", "phone", "address", "kycStatus", "role", "rank", "rewardPoints"];
    
    // Filter out any fields that aren't allowed to be updated
    const updateData: Record<string, any> = {};
    for (const key of allowedFields) {
      if (req.body[key] !== undefined) {
        updateData[key] = req.body[key];
      }
    }

    try {
      const updatedUser = await storage.updateUser(userId, updateData);
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      // Don't return password in response
      const { password, ...userWithoutPassword } = updatedUser;
      return res.status(200).json(userWithoutPassword);
    } catch (error) {
      console.error("Admin update user error:", error);
      return res.status(500).json({ message: "Error updating user" });
    }
  });

  app.post("/api/admin/login-as", isAdmin, async (req, res) => {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    try {
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Store original admin ID to allow returning
      const adminId = req.session.userId;
      req.session.originalAdminId = adminId;

      // Set user session to impersonate the user
      req.session.userId = user.id;
      req.session.userRole = user.role;

      return res.status(200).json({
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        impersonated: true,
      });
    } catch (error) {
      console.error("Admin login as user error:", error);
      return res.status(500).json({ message: "Error logging in as user" });
    }
  });

  app.post("/api/admin/revert-login", async (req, res) => {
    if (!req.session.originalAdminId) {
      return res.status(400).json({ message: "Not currently impersonating a user" });
    }

    try {
      const adminId = req.session.originalAdminId;
      const admin = await storage.getUser(adminId);
      if (!admin) {
        return res.status(404).json({ message: "Admin user not found" });
      }

      // Reset session to admin
      req.session.userId = adminId;
      req.session.userRole = admin.role;
      req.session.originalAdminId = undefined;

      return res.status(200).json({
        id: admin.id,
        username: admin.username,
        email: admin.email,
        fullName: admin.fullName,
        role: admin.role,
      });
    } catch (error) {
      console.error("Admin revert login error:", error);
      return res.status(500).json({ message: "Error reverting to admin user" });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);

  return httpServer;
}
