import { AccountCards } from "@/components/dashboard/account-cards";
import { TransactionHistory } from "@/components/dashboard/transaction-history";
import { PortfolioSummary } from "@/components/dashboard/portfolio-summary";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { DigitalServices } from "@/components/dashboard/digital-services";
import { useLanguage } from "@/hooks/use-language";

export default function Dashboard() {
  const { t } = useLanguage();
  
  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white font-heading mb-6">
        {t('dashboard')}
      </h1>
      
      {/* Account Overview Section */}
      <div className="py-4">
        <AccountCards />
      </div>

      {/* Main Dashboard Content */}
      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {/* Transaction History (2 column span on large screens) */}
        <TransactionHistory />
        
        {/* Portfolio & Quick Actions */}
        <div className="space-y-5">
          <PortfolioSummary />
          <QuickActions />
        </div>
      </div>
      
      {/* Digital Services Section */}
      <DigitalServices />
    </div>
  );
}
