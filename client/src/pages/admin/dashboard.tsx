import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/hooks/use-language";
import { formatMoney } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Users, 
  CreditCard, 
  Activity, 
  AlertCircle,
  DollarSign, 
  PieChart,
  BarChart3,
  Percent
} from "lucide-react";

export default function AdminDashboard() {
  const { t } = useLanguage();

  // Fetch system stats
  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['/api/admin/stats'],
  });

  // Fetch recent activity
  const { data: recentActivity, isLoading: isLoadingActivity } = useQuery({
    queryKey: ['/api/admin/activity'],
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white font-heading">
          {t('adminDashboard')}
        </h1>
      </div>

      {/* Dashboard overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Users card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">
              {t('totalUsers')}
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingStats ? (
              <Skeleton className="h-7 w-20" />
            ) : (
              <div className="text-2xl font-bold">
                {stats?.users || 0}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              {stats?.newUsers || 0} {t('newThisMonth')}
            </p>
          </CardContent>
        </Card>

        {/* Wallets card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">
              {t('totalWallets')}
            </CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingStats ? (
              <Skeleton className="h-7 w-20" />
            ) : (
              <div className="text-2xl font-bold">
                {stats?.wallets || 0}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              {stats?.activeWallets || 0} {t('active')}
            </p>
          </CardContent>
        </Card>

        {/* Total balance card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">
              {t('totalBalance')}
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingStats ? (
              <Skeleton className="h-7 w-24" />
            ) : (
              <div className="text-2xl font-bold">
                {formatMoney(stats?.totalBalance || 0, "USD")}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              <span className={stats?.balanceChange > 0 ? "text-green-500" : "text-red-500"}>
                {stats?.balanceChange > 0 ? "+" : ""}{stats?.balanceChange || 0}%
              </span> {t('fromLastMonth')}
            </p>
          </CardContent>
        </Card>

        {/* Support tickets card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">
              {t('openTickets')}
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingStats ? (
              <Skeleton className="h-7 w-16" />
            ) : (
              <div className="text-2xl font-bold">
                {stats?.openTickets || 0}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              {stats?.unresolvedTickets || 0} {t('unresolvedOver24h')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Activity and analytics tabs */}
      <Tabs defaultValue="activity">
        <TabsList>
          <TabsTrigger value="activity">
            <Activity className="h-4 w-4 mr-2" />
            {t('recentActivity')}
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <PieChart className="h-4 w-4 mr-2" />
            {t('analytics')}
          </TabsTrigger>
        </TabsList>
        
        {/* Activity tab content */}
        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('recentActivity')}</CardTitle>
              <CardDescription>{t('lastActivityDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingActivity ? (
                <>
                  <Skeleton className="h-14 w-full mb-2" />
                  <Skeleton className="h-14 w-full mb-2" />
                  <Skeleton className="h-14 w-full mb-2" />
                  <Skeleton className="h-14 w-full" />
                </>
              ) : (
                <div className="space-y-4">
                  {recentActivity?.length > 0 ? (
                    recentActivity.map((activity: any, index: number) => (
                      <div key={index} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                        <div className="flex items-start space-x-4">
                          <div className="p-2 rounded-full bg-muted">
                            <Activity className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">{activity.title}</p>
                            <p className="text-xs text-muted-foreground">{activity.description}</p>
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground">{activity.time}</div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      {t('noRecentActivity')}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Analytics tab content */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>{t('userGrowth')}</CardTitle>
                <CardDescription>{t('userGrowthDescription')}</CardDescription>
              </CardHeader>
              <CardContent className="px-2">
                <div className="h-80 flex items-center justify-center">
                  <div className="text-center space-y-2">
                    <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground" />
                    <p className="text-muted-foreground">{t('analyticsDataComingSoon')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>{t('conversionRates')}</CardTitle>
                <CardDescription>{t('conversionRatesDescription')}</CardDescription>
              </CardHeader>
              <CardContent className="px-2">
                <div className="h-80 flex items-center justify-center">
                  <div className="text-center space-y-2">
                    <Percent className="h-12 w-12 mx-auto text-muted-foreground" />
                    <p className="text-muted-foreground">{t('analyticsDataComingSoon')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}