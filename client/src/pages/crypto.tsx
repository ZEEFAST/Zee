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
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { formatMoney, formatDateTime } from "@/lib/utils";
import { useLanguage } from "@/hooks/use-language";
import { Bitcoin, Brackets, DollarSign, BarChart, ArrowDownUp, Plus } from "lucide-react";

type CryptoAsset = {
  name: string;
  symbol: string;
  price: number;
  change24h: number;
  marketCap: number;
  icon: JSX.Element;
};

const cryptoAssets: CryptoAsset[] = [
  {
    name: "Bitcoin",
    symbol: "BTC",
    price: 52481.23,
    change24h: 2.34,
    marketCap: 975869420000,
    icon: <Bitcoin className="h-6 w-6 text-orange-500" />
  },
  {
    name: "Brackets",
    symbol: "ETH",
    price: 2863.18,
    change24h: -1.2,
    marketCap: 345923560000,
    icon: <Brackets className="h-6 w-6 text-purple-500" />
  },
  {
    name: "USD Coin",
    symbol: "USDC",
    price: 1.00,
    change24h: 0.01,
    marketCap: 50230560000,
    icon: <DollarSign className="h-6 w-6 text-blue-500" />
  }
];

export default function Crypto() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("wallet");
  
  // Fetch crypto wallets
  const { data: wallets, isLoading: isLoadingWallets } = useQuery({
    queryKey: ['/api/wallets'],
  });

  // Filter to only get crypto wallets
  const cryptoWallets = wallets?.filter((wallet: any) => wallet.type.includes('crypto')) || [];

  // Fetch transactions
  const { data: transactions, isLoading: isLoadingTx } = useQuery({
    queryKey: ['/api/transactions'],
  });

  // Filter to only get crypto transactions
  const cryptoTx = transactions?.filter((tx: any) => {
    // For demo purposes, we'll check if the description contains "Bitcoin" or "Crypto"
    return tx.description?.includes("Bitcoin") || tx.description?.includes("Crypto");
  }) || [];

  // Market data table columns
  const marketColumns = [
    {
      key: "asset",
      header: t('asset'),
      cell: (crypto: CryptoAsset) => (
        <div className="flex items-center gap-2">
          {crypto.icon}
          <div>
            <div className="font-medium">{crypto.name}</div>
            <div className="text-sm text-gray-500">{crypto.symbol}</div>
          </div>
        </div>
      ),
      sortable: true,
    },
    {
      key: "price",
      header: t('price'),
      cell: (crypto: CryptoAsset) => formatMoney(crypto.price, "USD"),
      sortable: true,
    },
    {
      key: "change24h",
      header: t('24hChange'),
      cell: (crypto: CryptoAsset) => (
        <span className={crypto.change24h >= 0 ? "text-green-600" : "text-red-600"}>
          {crypto.change24h > 0 ? "+" : ""}{crypto.change24h.toFixed(2)}%
        </span>
      ),
      sortable: true,
    },
    {
      key: "marketCap",
      header: t('marketCap'),
      cell: (crypto: CryptoAsset) => formatMoney(crypto.marketCap, "USD", "en-US", 0),
      sortable: true,
    },
    {
      key: "actions",
      header: "",
      cell: (crypto: CryptoAsset) => (
        <div className="flex justify-end gap-2">
          <Button size="sm" variant="outline">
            <ArrowDownUp className="h-4 w-4 mr-1" />
            {t('trade')}
          </Button>
        </div>
      ),
      sortable: false,
    },
  ];

  // Transaction table columns
  const txColumns = [
    {
      key: "date",
      header: t('date'),
      cell: (tx: any) => formatDateTime(tx.createdAt),
      sortable: true,
    },
    {
      key: "type",
      header: t('type'),
      cell: (tx: any) => tx.type.charAt(0).toUpperCase() + tx.type.slice(1),
      sortable: true,
    },
    {
      key: "description",
      header: t('description'),
      cell: (tx: any) => tx.description,
      sortable: false,
    },
    {
      key: "amount",
      header: t('amount'),
      cell: (tx: any) => (
        <span className={tx.amount >= 0 ? "text-green-600" : "text-red-600"}>
          {formatMoney(tx.amount, "USD")}
        </span>
      ),
      sortable: true,
    },
    {
      key: "status",
      header: t('status'),
      cell: (tx: any) => (
        <span className={
          tx.status === "completed" 
            ? "text-green-600" 
            : tx.status === "pending" 
              ? "text-yellow-600" 
              : "text-red-600"
        }>
          {tx.status}
        </span>
      ),
      sortable: true,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white font-heading">
          {t('crypto')}
        </h1>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              {t('buyCrypto')}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('buyCryptocurrency')}</DialogTitle>
              <DialogDescription>
                {t('buyCryptoDescription')}
              </DialogDescription>
            </DialogHeader>
            
            {/* Buy crypto form would go here */}
            <DialogFooter>
              <Button variant="outline">{t('cancel')}</Button>
              <Button>{t('buy')}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="wallet">
            <Bitcoin className="mr-2 h-4 w-4" />
            {t('cryptoWallet')}
          </TabsTrigger>
          <TabsTrigger value="market">
            <BarChart className="mr-2 h-4 w-4" />
            {t('market')}
          </TabsTrigger>
          <TabsTrigger value="history">
            <ArrowDownUp className="mr-2 h-4 w-4" />
            {t('transactionHistory')}
          </TabsTrigger>
        </TabsList>
        
        {/* Crypto Wallet Tab */}
        <TabsContent value="wallet">
          <div className="grid gap-6 md:grid-cols-2">
            {isLoadingWallets ? (
              <>
                <Skeleton className="h-40" />
                <Skeleton className="h-40" />
              </>
            ) : cryptoWallets.length > 0 ? (
              cryptoWallets.map((wallet: any) => (
                <Card key={wallet.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center">
                        {wallet.type === 'crypto-btc' ? (
                          <Bitcoin className="h-10 w-10 text-orange-500" />
                        ) : wallet.type === 'crypto-eth' ? (
                          <Brackets className="h-10 w-10 text-purple-500" />
                        ) : (
                          <DollarSign className="h-10 w-10 text-blue-500" />
                        )}
                        <div className="ml-3">
                          <h3 className="text-lg font-medium">
                            {wallet.type === 'crypto-btc' 
                              ? 'Bitcoin' 
                              : wallet.type === 'crypto-eth' 
                                ? 'Brackets' 
                                : 'Cryptocurrency'}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {wallet.type === 'crypto-btc' 
                              ? 'BTC' 
                              : wallet.type === 'crypto-eth' 
                                ? 'ETH' 
                                : wallet.type.replace('crypto-', '').toUpperCase()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold font-mono">
                          {formatMoney(wallet.balance, wallet.currency)}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {wallet.type === 'crypto-btc' 
                            ? `≈ ${(wallet.balance / 52481.23).toFixed(8)} BTC` 
                            : wallet.type === 'crypto-eth' 
                              ? `≈ ${(wallet.balance / 2863.18).toFixed(8)} ETH`
                              : ''}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2 mt-4">
                      <Button variant="outline" className="flex-1">
                        {t('buy')}
                      </Button>
                      <Button variant="outline" className="flex-1">
                        {t('sell')}
                      </Button>
                      <Button variant="outline" className="flex-1">
                        {t('convert')}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="md:col-span-2">
                <CardContent className="p-6 text-center">
                  <Bitcoin className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium mb-2">{t('noCryptoWallet')}</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    {t('noCryptoWalletDescription')}
                  </p>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    {t('createCryptoWallet')}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
          
          {/* Market summary */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>{t('marketSummary')}</CardTitle>
              <CardDescription>{t('latestCryptoPrices')}</CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                data={cryptoAssets}
                columns={marketColumns}
                pagination={false}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Market Tab */}
        <TabsContent value="market">
          <Card>
            <CardHeader>
              <CardTitle>{t('cryptoMarket')}</CardTitle>
              <CardDescription>{t('cryptoMarketDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                data={cryptoAssets}
                columns={marketColumns}
                searchable
                pagination={false}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Transaction History Tab */}
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>{t('cryptoTransactionHistory')}</CardTitle>
              <CardDescription>{t('cryptoTransactionDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingTx ? (
                <div className="space-y-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-64 w-full" />
                </div>
              ) : cryptoTx.length > 0 ? (
                <DataTable
                  data={cryptoTx}
                  columns={txColumns}
                  searchable
                  pagination
                  pageSize={10}
                />
              ) : (
                <div className="text-center py-10">
                  <ArrowDownUp className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium mb-2">{t('noTransactions')}</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    {t('noCryptoTransactionsDescription')}
                  </p>
                  <Button>
                    {t('buyCrypto')}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
