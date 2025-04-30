import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate, formatMoney } from "@/lib/utils";
import { useLanguage } from "@/hooks/use-language";
import { Clock, TrendingUp, CreditCard } from "lucide-react";

export function DigitalServices() {
  const { t } = useLanguage();
  
  const { data: dpsAccounts, isLoading: isLoadingDps } = useQuery({
    queryKey: ['/api/dps/accounts'],
  });
  
  const { data: fdrAccounts, isLoading: isLoadingFdr } = useQuery({
    queryKey: ['/api/fdr/accounts'],
  });
  
  const { data: loans, isLoading: isLoadingLoans } = useQuery({
    queryKey: ['/api/loans'],
  });
  
  return (
    <div className="mt-8">
      <h2 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">
        {t('digitalServices')}
      </h2>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {/* DPS Card */}
        <Card className="shadow rounded-lg overflow-hidden">
          <CardContent className="p-5">
            {isLoadingDps ? (
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                </div>
                <div className="pt-3 space-y-2">
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Clock className="h-10 w-10 text-success-500" />
                  </div>
                  <div className="ml-5 flex-1">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      {t('depositPensionScheme')}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      {t('dpsSummary')}
                    </p>
                  </div>
                </div>
                <div className="mt-4">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {t('activePlans')}:
                  </span>
                  <span className="ml-2 text-sm font-semibold text-gray-900 dark:text-white">
                    {dpsAccounts?.length || 0}
                  </span>
                </div>
                <div className="mt-1">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {t('nextPayment')}:
                  </span>
                  <span className="ml-2 text-sm font-semibold text-gray-900 dark:text-white">
                    {dpsAccounts?.length 
                      ? formatDate(dpsAccounts[0].nextPaymentDate) 
                      : t('notApplicable')}
                  </span>
                </div>
              </>
            )}
          </CardContent>
          <div className="bg-gray-50 dark:bg-dark-900 px-5 py-3">
            <div className="text-sm">
              <Link href="/dps-fdr" className="font-medium text-primary-600 dark:text-primary-400 hover:text-primary-500">
                {t('manageDpsAccount')}
              </Link>
            </div>
          </div>
        </Card>
        
        {/* FDR Card */}
        <Card className="shadow rounded-lg overflow-hidden">
          <CardContent className="p-5">
            {isLoadingFdr ? (
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                </div>
                <div className="pt-3 space-y-2">
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <TrendingUp className="h-10 w-10 text-warning-500" />
                  </div>
                  <div className="ml-5 flex-1">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      {t('fixedDepositReceipt')}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      {t('fdrSummary')}
                    </p>
                  </div>
                </div>
                <div className="mt-4">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {t('totalFdrAmount')}:
                  </span>
                  <span className="ml-2 text-sm font-semibold text-gray-900 dark:text-white font-mono">
                    {fdrAccounts?.length 
                      ? formatMoney(fdrAccounts.reduce((sum: number, acc: any) => sum + acc.principalAmount, 0), 'USD') 
                      : formatMoney(0, 'USD')}
                  </span>
                </div>
                <div className="mt-1">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {t('maturityDate')}:
                  </span>
                  <span className="ml-2 text-sm font-semibold text-gray-900 dark:text-white">
                    {fdrAccounts?.length 
                      ? formatDate(fdrAccounts[0].maturityDate)
                      : t('notApplicable')}
                  </span>
                </div>
              </>
            )}
          </CardContent>
          <div className="bg-gray-50 dark:bg-dark-900 px-5 py-3">
            <div className="text-sm">
              <Link href="/dps-fdr" className="font-medium text-primary-600 dark:text-primary-400 hover:text-primary-500">
                {t('manageFdrAccount')}
              </Link>
            </div>
          </div>
        </Card>
        
        {/* Loan Card */}
        <Card className="shadow rounded-lg overflow-hidden">
          <CardContent className="p-5">
            {isLoadingLoans ? (
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                </div>
                <div className="pt-3 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <CreditCard className="h-10 w-10 text-primary-500" />
                  </div>
                  <div className="ml-5 flex-1">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      {t('loanApplications')}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      {t('loanSummary')}
                    </p>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-center">
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                      <div className="bg-primary-600 h-2.5 rounded-full" style={{ width: '70%' }}></div>
                    </div>
                    <span className="ml-2 text-sm font-medium text-gray-900 dark:text-white">70%</span>
                  </div>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{t('loanEligibility')}</p>
                </div>
                <div className="mt-2">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {t('preApprovedAmount')}:
                  </span>
                  <span className="ml-2 text-sm font-semibold text-gray-900 dark:text-white font-mono">
                    {formatMoney(25000, 'USD')}
                  </span>
                </div>
              </>
            )}
          </CardContent>
          <div className="bg-gray-50 dark:bg-dark-900 px-5 py-3">
            <div className="text-sm">
              <Link href="/loans" className="font-medium text-primary-600 dark:text-primary-400 hover:text-primary-500">
                {t('applyForLoan')}
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
