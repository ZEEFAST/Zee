import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatMoney } from "@/lib/utils";
import { Link } from "wouter";
import { 
  Wallet, 
  BarChart4, 
  CreditCard, 
  TrendingUp 
} from "lucide-react";
import { useLanguage } from "@/hooks/use-language";

type Wallet = {
  id: number;
  type: string;
  balance: number;
  currency: string;
  isActive: boolean;
};

export function AccountCards() {
  const { t } = useLanguage();
  
  const { data: wallets, isLoading } = useQuery({
    queryKey: ['/api/wallets'],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <Skeleton className="h-[156px]" />
          </Card>
        ))}
      </div>
    );
  }

  const mainWallet = wallets?.find((w: Wallet) => w.type === 'main');
  const savingsWallet = wallets?.find((w: Wallet) => w.type === 'savings');
  const cryptoWallet = wallets?.find((w: Wallet) => w.type.includes('crypto'));

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* Main Wallet Card */}
      <Card className="bg-gradient-to-r from-primary-600 to-primary-800 overflow-hidden shadow rounded-lg">
        <CardContent className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-white bg-opacity-30 rounded-md p-3">
              <Wallet className="h-6 w-6 text-white" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-white text-opacity-70 truncate">
                  {t('mainWallet')}
                </dt>
                <dd>
                  <div className="text-lg font-semibold text-white font-mono">
                    {mainWallet ? formatMoney(mainWallet.balance, mainWallet.currency) : '—'}
                  </div>
                </dd>
              </dl>
            </div>
          </div>
        </CardContent>
        <div className="bg-white bg-opacity-10 px-5 py-3">
          <div className="text-sm">
            <Link href="/accounts" className="font-medium text-white hover:text-white">
              {t('viewDetails')}
            </Link>
          </div>
        </div>
      </Card>

      {/* Savings Account Card */}
      <Card className="overflow-hidden shadow rounded-lg">
        <CardContent className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-success-500 bg-opacity-10 dark:bg-opacity-20 rounded-md p-3">
              <CreditCard className="h-6 w-6 text-success-500" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                  {t('savingsAccount')}
                </dt>
                <dd>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white font-mono">
                    {savingsWallet ? formatMoney(savingsWallet.balance, savingsWallet.currency) : '—'}
                  </div>
                </dd>
              </dl>
            </div>
          </div>
        </CardContent>
        <div className="bg-gray-50 dark:bg-dark-900 px-5 py-3">
          <div className="text-sm">
            <Link href="/accounts" className="font-medium text-primary-600 dark:text-primary-400 hover:text-primary-500">
              {t('viewDetails')}
            </Link>
          </div>
        </div>
      </Card>

      {/* Crypto Wallet Card */}
      <Card className="overflow-hidden shadow rounded-lg">
        <CardContent className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-secondary-500 bg-opacity-10 dark:bg-opacity-20 rounded-md p-3">
              <TrendingUp className="h-6 w-6 text-secondary-500" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                  {t('cryptoWallet')}
                </dt>
                <dd>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white font-mono">
                    {cryptoWallet ? formatMoney(cryptoWallet.balance, cryptoWallet.currency) : '—'}
                  </div>
                </dd>
              </dl>
            </div>
          </div>
        </CardContent>
        <div className="bg-gray-50 dark:bg-dark-900 px-5 py-3">
          <div className="text-sm">
            <Link href="/crypto" className="font-medium text-primary-600 dark:text-primary-400 hover:text-primary-500">
              {t('viewDetails')}
            </Link>
          </div>
        </div>
      </Card>

      {/* Rewards Card */}
      <Card className="overflow-hidden shadow rounded-lg">
        <CardContent className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-warning-500 bg-opacity-10 dark:bg-opacity-20 rounded-md p-3">
              <BarChart4 className="h-6 w-6 text-warning-500" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                  {t('rewardPoints')}
                </dt>
                <dd>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white font-mono">
                    {/* This would come from the user profile */}
                    4,280
                  </div>
                </dd>
              </dl>
            </div>
          </div>
        </CardContent>
        <div className="bg-gray-50 dark:bg-dark-900 px-5 py-3">
          <div className="text-sm">
            <Link href="/rewards" className="font-medium text-primary-600 dark:text-primary-400 hover:text-primary-500">
              {t('viewDetails')}
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}
