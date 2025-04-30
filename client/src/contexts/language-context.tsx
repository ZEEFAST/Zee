import { createContext, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/components/ui/theme-provider";

type Language = {
  id: number;
  code: string;
  name: string;
  isRtl: boolean;
  isActive: boolean;
};

type TranslationsMap = Record<string, string>;

type LanguageContextType = {
  currentLanguage: string;
  isRtl: boolean;
  availableLanguages: Language[];
  translations: TranslationsMap;
  setLanguage: (code: string) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
};

export const LanguageContext = createContext<LanguageContextType>({
  currentLanguage: "en",
  isRtl: false,
  availableLanguages: [],
  translations: {},
  setLanguage: () => {},
  t: (key) => key,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [currentLanguage, setCurrentLanguage] = useState(localStorage.getItem("nexusbank-language") || "en");
  const [isRtl, setIsRtl] = useState(localStorage.getItem("nexusbank-is-rtl") === "true");
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();

  // Fetch available languages
  const { data: languages = [] } = useQuery({
    queryKey: ['/api/languages'],
    onError: (error) => {
      console.error("Failed to load languages:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load language settings. Using English as default.",
      });
    },
  });

  // Fetch translations for current language
  const { data: translations = {} } = useQuery({
    queryKey: ['/api/languages', currentLanguage, 'translations'],
    enabled: !!currentLanguage,
    onError: (error) => {
      console.error(`Failed to load translations for ${currentLanguage}:`, error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to load translations for ${currentLanguage}. Some text may appear in English.`,
      });
    },
  });

  // English fallback translations for critical UI elements
  const fallbackTranslations: TranslationsMap = {
    dashboard: "Dashboard",
    accounts: "Accounts",
    transfers: "Transfers",
    crypto: "Crypto",
    dpsFdr: "DPS / FDR",
    loans: "Loans",
    billPay: "Bill Pay",
    support: "Support",
    settings: "Settings",
    adminPanel: "Admin Panel",
    login: "Login",
    logout: "Logout",
    register: "Register",
    username: "Username",
    password: "Password",
    email: "Email",
    fullName: "Full Name",
    submit: "Submit",
    cancel: "Cancel",
    mainWallet: "Main Wallet",
    savingsAccount: "Savings Account",
    cryptoWallet: "Crypto Wallet",
    rewardPoints: "Reward Points",
    viewDetails: "View details",
    transactionHistory: "Transaction History",
    portfolioSummary: "Portfolio Summary",
    quickActions: "Quick Actions",
    digitalServices: "Digital Services",
    depositPensionScheme: "Deposit Pension Scheme",
    fixedDepositReceipt: "Fixed Deposit Receipt",
    loanApplications: "Loan Applications",
    applyForLoan: "Apply for Loan",
    manageDpsAccount: "Manage DPS Account",
    manageFdrAccount: "Manage FDR Account",
    search: "Search",
    profile: "Profile",
    help: "Help",
    signOut: "Sign Out",
    selectLanguage: "Select Language",
    viewNotifications: "View notifications",
    openUserMenu: "Open user menu",
    openSidebar: "Open sidebar",
    account: "Account",
    noTransactions: "No transactions to display",
    noAssets: "No assets to display",
    assetAllocationChart: "Asset Allocation Chart",
    transfer: "Transfer",
    deposit: "Deposit",
    payBills: "Pay Bills",
    moreServices: "More Services",
    dpsSummary: "Save monthly with attractive interest rates",
    fdrSummary: "Earn high interest with fixed-term deposits",
    loanSummary: "Apply for personal or business loans",
    activePlans: "Active Plans",
    nextPayment: "Next Payment",
    totalFdrAmount: "Total FDR Amount",
    maturityDate: "Maturity Date",
    loanEligibility: "Loan Eligibility",
    preApprovedAmount: "Pre-approved Amount",
    notApplicable: "N/A",
    last7Days: "Last 7 days",
    last30Days: "Last 30 days",
    last3Months: "Last 3 months",
    lastYear: "Last year",
    allTransactions: "All Transactions",
    timePeriod: "Time Period",
    viewAllTransactions: "View All Transactions",
  };

  // Combine fetched translations with fallbacks
  const allTranslations = { ...fallbackTranslations, ...translations };

  // Change language
  const setLanguage = (code: string) => {
    const selectedLang = languages.find((lang) => lang.code === code);
    if (selectedLang) {
      setCurrentLanguage(code);
      setIsRtl(selectedLang.isRtl);
      localStorage.setItem("nexusbank-language", code);
      localStorage.setItem("nexusbank-is-rtl", String(selectedLang.isRtl));
      
      toast({
        title: "Language Changed",
        description: `Language set to ${selectedLang.name}`,
      });
    }
  };

  // Translation function
  const t = (key: string, params?: Record<string, string | number>): string => {
    let text = allTranslations[key] || key;
    
    // Replace parameters if any
    if (params) {
      Object.entries(params).forEach(([param, value]) => {
        text = text.replace(new RegExp(`{${param}}`, 'g'), String(value));
      });
    }
    
    return text;
  };

  // Set document direction if RTL
  useEffect(() => {
    document.documentElement.dir = isRtl ? "rtl" : "ltr";
  }, [isRtl]);

  return (
    <LanguageContext.Provider
      value={{
        currentLanguage,
        isRtl,
        availableLanguages: languages,
        translations: allTranslations,
        setLanguage,
        t,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}
