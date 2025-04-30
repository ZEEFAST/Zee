import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { calculatePortfolioAllocation } from "@/lib/utils";
import { useLanguage } from "@/hooks/use-language";

type Wallet = {
  id: number;
  type: string;
  balance: number;
  currency: string;
};

export function PortfolioSummary() {
  const { t } = useLanguage();

  const { data: wallets, isLoading } = useQuery({
    queryKey: ['/api/wallets'],
  });

  const getChartColorClass = (index: number) => {
    const colors = [
      'bg-primary-500',
      'bg-secondary-500',
      'bg-success-500',
      'bg-warning-500',
      'bg-danger-500',
    ];
    return colors[index % colors.length];
  };

  // Calculate portfolio allocation if wallets are loaded
  const portfolioAllocation = wallets 
    ? calculatePortfolioAllocation(wallets)
    : [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('portfolioSummary')}</CardTitle>
      </CardHeader>
      <CardContent className="px-4 py-0 pb-4">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-[200px] w-full" />
            <div className="space-y-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex justify-between items-center">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-4 w-10" />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
            <div className="chart-container">
              <div className="chart-placeholder"></div>
              <div className="absolute inset-0 flex items-center justify-center text-gray-400 dark:text-gray-500">
                <p className="text-sm font-medium">{t('assetAllocationChart')}</p>
              </div>
            </div>
            
            <div className="mt-3 space-y-2">
              {portfolioAllocation.length === 0 ? (
                <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                  {t('noAssets')}
                </p>
              ) : (
                portfolioAllocation.map((item, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <div className="flex items-center">
                      <span className={`w-3 h-3 ${getChartColorClass(index)} rounded-full mr-2`}></span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">{t(item.type.toLowerCase())}</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{item.percentage}%</span>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
