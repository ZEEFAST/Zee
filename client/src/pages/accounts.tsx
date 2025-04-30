import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { formatMoney, formatDateTime } from "@/lib/utils";
import { useLanguage } from "@/hooks/use-language";
import { Plus, Wallet, CreditCard, TrendingUp, ArrowLeftRight } from "lucide-react";

export default function Accounts() {
  const { t } = useLanguage();
  const [selectedWalletId, setSelectedWalletId] = useState<number | null>(null);
  
  // Fetch user's wallets
  const { data: wallets, isLoading: isLoadingWallets } = useQuery({
    queryKey: ['/api/wallets'],
  });
  
  // Fetch transactions for selected wallet
  const { data: transactions, isLoading: isLoadingTransactions } = useQuery({
    queryKey: ['/api/wallets', selectedWalletId, 'transactions'],
    enabled: !!selectedWalletId,
  });
  
  // Handle wallet selection
  const handleSelectWallet = (id: number) => {
    setSelectedWalletId(id);
  };
  
  // Get wallet icon based on type
  const getWalletIcon = (type: string) => {
    switch (type) {
      case 'main':
        return <Wallet className="h-6 w-6" />;
      case 'savings':
        return <CreditCard className="h-6 w-6" />;
      default:
        return type.includes('crypto') 
          ? <TrendingUp className="h-6 w-6" />
          : <Wallet className="h-6 w-6" />;
    }
  };
  
  // Transactions table columns
  const transactionColumns = [
    {
      key: "date",
      header: t('date'),
      cell: (transaction: any) => formatDateTime(transaction.createdAt),
      sortable: true,
    },
    {
      key: "description",
      header: t('description'),
      cell: (transaction: any) => transaction.description,
      sortable: false,
    },
    {
      key: "reference",
      header: t('reference'),
      cell: (transaction: any) => transaction.reference || "-",
      sortable: false,
    },
    {
      key: "amount",
      header: t('amount'),
      cell: (transaction: any) => (
        <span className={transaction.amount >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}>
          {formatMoney(transaction.amount, "USD")}
        </span>
      ),
      sortable: true,
    },
    {
      key: "status",
      header: t('status'),
      cell: (transaction: any) => (
        <span className={
          transaction.status === "completed" 
            ? "text-green-600 dark:text-green-400" 
            : transaction.status === "pending" 
              ? "text-yellow-600 dark:text-yellow-400" 
              : "text-red-600 dark:text-red-400"
        }>
          {transaction.status}
        </span>
      ),
      sortable: true,
    },
  ];
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white font-heading">
          {t('accounts')}
        </h1>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              {t('newAccount')}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('createNewAccount')}</DialogTitle>
              <DialogDescription>
                {t('createAccountDescription')}
              </DialogDescription>
            </DialogHeader>
            
            {/* Account creation form would go here */}
            <DialogFooter>
              <Button variant="outline">{t('cancel')}</Button>
              <Button>{t('create')}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Wallets cards */}
        <div className="md:col-span-1 space-y-4">
          <h2 className="text-lg font-medium">{t('myWallets')}</h2>
          
          {isLoadingWallets ? (
            <>
              <Skeleton className="h-32 w-full rounded-md" />
              <Skeleton className="h-32 w-full rounded-md" />
              <Skeleton className="h-32 w-full rounded-md" />
            </>
          ) : (
            wallets?.map((wallet: any) => (
              <Card 
                key={wallet.id} 
                className={`cursor-pointer transition-colors ${selectedWalletId === wallet.id 
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' 
                  : ''}`}
                onClick={() => handleSelectWallet(wallet.id)}
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-full ${wallet.type === 'main' 
                        ? 'bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400' 
                        : wallet.type === 'savings' 
                          ? 'bg-success-100 dark:bg-success-900 text-success-600 dark:text-success-400' 
                          : 'bg-secondary-100 dark:bg-secondary-900 text-secondary-600 dark:text-secondary-400'}`}>
                        {getWalletIcon(wallet.type)}
                      </div>
                      <div>
                        <h3 className="font-medium">
                          {wallet.type === 'main' 
                            ? t('mainWallet') 
                            : wallet.type === 'savings' 
                              ? t('savingsAccount') 
                              : t('cryptoWallet')}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {wallet.type.charAt(0).toUpperCase() + wallet.type.slice(1)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold font-mono">
                        {formatMoney(wallet.balance, wallet.currency)}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {wallet.currency}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
          
          <Button variant="outline" className="w-full justify-center">
            <Plus className="mr-2 h-4 w-4" />
            {t('addWallet')}
          </Button>
        </div>
        
        {/* Account details and transactions */}
        <div className="md:col-span-2">
          {selectedWalletId ? (
            <Card>
              <CardHeader>
                <CardTitle>{t('accountDetails')}</CardTitle>
                <CardDescription>
                  {t('accountTransactionsDescription')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="transactions">
                  <TabsList className="mb-4">
                    <TabsTrigger value="transactions">{t('transactions')}</TabsTrigger>
                    <TabsTrigger value="details">{t('details')}</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="transactions">
                    {isLoadingTransactions ? (
                      <div className="space-y-4">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-32 w-full" />
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex justify-end">
                          <Button variant="outline" className="mr-2">
                            <ArrowLeftRight className="mr-2 h-4 w-4" />
                            {t('transfer')}
                          </Button>
                          <Button>
                            {t('deposit')}
                          </Button>
                        </div>
                        
                        <DataTable
                          data={transactions || []}
                          columns={transactionColumns}
                          searchable
                          pagination
                          pageSize={10}
                        />
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="details">
                    <div className="space-y-4">
                      {isLoadingWallets ? (
                        <Skeleton className="h-32 w-full" />
                      ) : (
                        wallets?.find((w: any) => w.id === selectedWalletId) && (
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{t('accountType')}</p>
                                <p className="font-medium">
                                  {wallets.find((w: any) => w.id === selectedWalletId).type}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{t('currentBalance')}</p>
                                <p className="font-medium">
                                  {formatMoney(
                                    wallets.find((w: any) => w.id === selectedWalletId).balance,
                                    wallets.find((w: any) => w.id === selectedWalletId).currency
                                  )}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{t('currency')}</p>
                                <p className="font-medium">
                                  {wallets.find((w: any) => w.id === selectedWalletId).currency}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{t('status')}</p>
                                <p className="font-medium">
                                  {wallets.find((w: any) => w.id === selectedWalletId).isActive ? t('active') : t('inactive')}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex space-x-4">
                              <Button variant="outline" className="flex-1">
                                {t('editAccount')}
                              </Button>
                              <Button variant="destructive" className="flex-1">
                                {t('closeAccount')}
                              </Button>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          ) : (
            <div className="h-full flex items-center justify-center border rounded-lg p-8">
              <div className="text-center">
                <div className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600 mb-4">
                  <Wallet className="h-12 w-12" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  {t('selectAccount')}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  {t('selectAccountDescription')}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
