import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDateTime, formatMoney } from "@/lib/utils";
import { useLanguage } from "@/hooks/use-language";
import { ArrowDownIcon, ArrowUpIcon, CreditCard, Bitcoin, DollarSign } from "lucide-react";

type Transaction = {
  id: number;
  amount: number;
  type: string;
  description: string;
  reference: string;
  status: string;
  createdAt: string;
};

export function TransactionHistory() {
  const { t } = useLanguage();

  const { data: transactions, isLoading } = useQuery({
    queryKey: ['/api/transactions'],
  });

  // Default limit to 5 transactions for dashboard display
  const limitedTransactions = transactions?.slice(0, 5) || [];

  const getTransactionIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'deposit':
        return (
          <div className="flex-shrink-0 bg-green-100 dark:bg-green-900 rounded-full p-2">
            <ArrowUpIcon className="h-5 w-5 text-green-500 dark:text-green-300" />
          </div>
        );
      case 'withdrawal':
      case 'transfer':
        return (
          <div className="flex-shrink-0 bg-red-100 dark:bg-red-900 rounded-full p-2">
            <ArrowDownIcon className="h-5 w-5 text-red-500 dark:text-red-300" />
          </div>
        );
      case 'payment':
        return (
          <div className="flex-shrink-0 bg-blue-100 dark:bg-blue-900 rounded-full p-2">
            <CreditCard className="h-5 w-5 text-blue-500 dark:text-blue-300" />
          </div>
        );
      case 'crypto':
        return (
          <div className="flex-shrink-0 bg-purple-100 dark:bg-purple-900 rounded-full p-2">
            <Bitcoin className="h-5 w-5 text-purple-500 dark:text-purple-300" />
          </div>
        );
      case 'interest':
        return (
          <div className="flex-shrink-0 bg-blue-100 dark:bg-blue-900 rounded-full p-2">
            <DollarSign className="h-5 w-5 text-blue-500 dark:text-blue-300" />
          </div>
        );
      default:
        return (
          <div className="flex-shrink-0 bg-gray-100 dark:bg-gray-700 rounded-full p-2">
            <DollarSign className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </div>
        );
    }
  };

  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader className="px-4 sm:px-6 flex-row flex justify-between items-center">
        <CardTitle>{t('transactionHistory')}</CardTitle>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">{t('allTransactions')}</Button>
          <Select defaultValue="7days">
            <SelectTrigger className="h-8 text-xs sm:text-sm">
              <SelectValue placeholder={t('timePeriod')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">{t('last7Days')}</SelectItem>
              <SelectItem value="30days">{t('last30Days')}</SelectItem>
              <SelectItem value="3months">{t('last3Months')}</SelectItem>
              <SelectItem value="year">{t('lastYear')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="px-4 sm:px-6 pb-4">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-4 w-1/3" />
                </div>
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        ) : (
          <div className="flow-root">
            <ul className="-my-4 divide-y divide-gray-200 dark:divide-gray-700">
              {limitedTransactions.length === 0 ? (
                <li className="py-6 text-center text-gray-500 dark:text-gray-400">
                  {t('noTransactions')}
                </li>
              ) : (
                limitedTransactions.map((transaction: Transaction) => (
                  <li key={transaction.id} className="py-4">
                    <div className="flex items-center space-x-4">
                      {getTransactionIcon(transaction.type)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {transaction.description}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                          {transaction.reference}
                        </p>
                      </div>
                      <div>
                        <div className={`text-sm font-medium font-mono ${transaction.amount >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                          {formatMoney(transaction.amount, 'USD')}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 text-right">
                          {formatDateTime(transaction.createdAt)}
                        </div>
                      </div>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>
        )}
        <div className="mt-6">
          <Button variant="outline" className="w-full">
            {t('viewAllTransactions')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
