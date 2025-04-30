import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardFooter 
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
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { formatMoney, formatDate } from "@/lib/utils";
import { useLanguage } from "@/hooks/use-language";
import { Clock, TrendingUp, Plus, ArrowRight, Calendar, Check } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";

// DPS Application form schema
const dpsFormSchema = z.object({
  planId: z.string().min(1, "Please select a plan"),
  walletId: z.string().min(1, "Please select a source wallet"),
  monthlyAmount: z.string().min(1, "Amount is required").refine(
    (val) => !isNaN(Number(val)) && Number(val) > 0,
    "Amount must be a positive number"
  ),
  term: z.string().min(1, "Please select a term"),
});

// FDR Application form schema
const fdrFormSchema = z.object({
  planId: z.string().min(1, "Please select a plan"),
  walletId: z.string().min(1, "Please select a source wallet"),
  principalAmount: z.string().min(1, "Amount is required").refine(
    (val) => !isNaN(Number(val)) && Number(val) > 0,
    "Amount must be a positive number"
  ),
  term: z.string().min(1, "Please select a term"),
  compounding: z.boolean().default(false),
});

export default function DpsFdr() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("dps");
  const [isNewDpsOpen, setIsNewDpsOpen] = useState(false);
  const [isNewFdrOpen, setIsNewFdrOpen] = useState(false);
  
  // Fetch DPS plans
  const { data: dpsPlans, isLoading: isLoadingDpsPlans } = useQuery({
    queryKey: ['/api/dps/plans'],
  });
  
  // Fetch DPS accounts
  const { data: dpsAccounts, isLoading: isLoadingDpsAccounts } = useQuery({
    queryKey: ['/api/dps/accounts'],
  });
  
  // Fetch FDR plans
  const { data: fdrPlans, isLoading: isLoadingFdrPlans } = useQuery({
    queryKey: ['/api/fdr/plans'],
  });
  
  // Fetch FDR accounts
  const { data: fdrAccounts, isLoading: isLoadingFdrAccounts } = useQuery({
    queryKey: ['/api/fdr/accounts'],
  });
  
  // Fetch wallets for source funding
  const { data: wallets, isLoading: isLoadingWallets } = useQuery({
    queryKey: ['/api/wallets'],
  });
  
  // DPS form setup
  const dpsForm = useForm<z.infer<typeof dpsFormSchema>>({
    resolver: zodResolver(dpsFormSchema),
    defaultValues: {
      planId: "",
      walletId: "",
      monthlyAmount: "",
      term: "",
    },
  });
  
  // FDR form setup
  const fdrForm = useForm<z.infer<typeof fdrFormSchema>>({
    resolver: zodResolver(fdrFormSchema),
    defaultValues: {
      planId: "",
      walletId: "",
      principalAmount: "",
      term: "",
      compounding: false,
    },
  });
  
  // DPS table columns
  const dpsColumns = [
    {
      key: "accountNumber",
      header: t('accountNumber'),
      cell: (account: any) => account.accountNumber,
      sortable: true,
    },
    {
      key: "monthlyAmount",
      header: t('monthlyAmount'),
      cell: (account: any) => formatMoney(account.monthlyAmount, "USD"),
      sortable: true,
    },
    {
      key: "term",
      header: t('term'),
      cell: (account: any) => `${account.term} ${t('months')}`,
      sortable: true,
    },
    {
      key: "interestRate",
      header: t('interestRate'),
      cell: (account: any) => `${account.interestRate}%`,
      sortable: true,
    },
    {
      key: "startDate",
      header: t('startDate'),
      cell: (account: any) => formatDate(account.startDate),
      sortable: true,
    },
    {
      key: "nextPaymentDate",
      header: t('nextPaymentDate'),
      cell: (account: any) => formatDate(account.nextPaymentDate),
      sortable: true,
    },
    {
      key: "maturityDate",
      header: t('maturityDate'),
      cell: (account: any) => formatDate(account.maturityDate),
      sortable: true,
    },
    {
      key: "totalDeposited",
      header: t('totalDeposited'),
      cell: (account: any) => formatMoney(account.totalDeposited, "USD"),
      sortable: true,
    },
    {
      key: "interestEarned",
      header: t('interestEarned'),
      cell: (account: any) => formatMoney(account.interestEarned, "USD"),
      sortable: true,
    },
    {
      key: "status",
      header: t('status'),
      cell: (account: any) => (
        <span className={
          account.status === "active" 
            ? "text-green-600" 
            : account.status === "pending" 
              ? "text-yellow-600" 
              : "text-red-600"
        }>
          {account.status}
        </span>
      ),
      sortable: true,
    },
  ];
  
  // FDR table columns
  const fdrColumns = [
    {
      key: "accountNumber",
      header: t('accountNumber'),
      cell: (account: any) => account.accountNumber,
      sortable: true,
    },
    {
      key: "principalAmount",
      header: t('principalAmount'),
      cell: (account: any) => formatMoney(account.principalAmount, "USD"),
      sortable: true,
    },
    {
      key: "term",
      header: t('term'),
      cell: (account: any) => `${account.term} ${t('months')}`,
      sortable: true,
    },
    {
      key: "interestRate",
      header: t('interestRate'),
      cell: (account: any) => `${account.interestRate}%`,
      sortable: true,
    },
    {
      key: "compounding",
      header: t('compounding'),
      cell: (account: any) => account.compounding ? t('yes') : t('no'),
      sortable: true,
    },
    {
      key: "startDate",
      header: t('startDate'),
      cell: (account: any) => formatDate(account.startDate),
      sortable: true,
    },
    {
      key: "maturityDate",
      header: t('maturityDate'),
      cell: (account: any) => formatDate(account.maturityDate),
      sortable: true,
    },
    {
      key: "interestEarned",
      header: t('interestEarned'),
      cell: (account: any) => formatMoney(account.interestEarned, "USD"),
      sortable: true,
    },
    {
      key: "status",
      header: t('status'),
      cell: (account: any) => (
        <span className={
          account.status === "active" 
            ? "text-green-600" 
            : account.status === "pending" 
              ? "text-yellow-600" 
              : "text-red-600"
        }>
          {account.status}
        </span>
      ),
      sortable: true,
    },
  ];
  
  // Create DPS Account Mutation
  const createDpsMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/dps/accounts", data);
    },
    onSuccess: () => {
      toast({
        title: t('dpsAccountCreated'),
        description: t('dpsAccountCreatedDescription'),
      });
      // Reset form and close dialog
      dpsForm.reset();
      setIsNewDpsOpen(false);
      // Invalidate the queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/dps/accounts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/wallets'] });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: t('dpsAccountFailed'),
        description: error instanceof Error ? error.message : t('dpsAccountFailedDescription'),
      });
    },
  });
  
  // Create FDR Account Mutation
  const createFdrMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/fdr/accounts", data);
    },
    onSuccess: () => {
      toast({
        title: t('fdrAccountCreated'),
        description: t('fdrAccountCreatedDescription'),
      });
      // Reset form and close dialog
      fdrForm.reset();
      setIsNewFdrOpen(false);
      // Invalidate the queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/fdr/accounts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/wallets'] });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: t('fdrAccountFailed'),
        description: error instanceof Error ? error.message : t('fdrAccountFailedDescription'),
      });
    },
  });
  
  // Handle DPS form submission
  const onDpsSubmit = (values: z.infer<typeof dpsFormSchema>) => {
    // Get selected plan details
    const selectedPlan = dpsPlans?.find((plan: any) => plan.id.toString() === values.planId);
    if (!selectedPlan) {
      toast({
        variant: "destructive",
        title: t('error'),
        description: t('planNotFound'),
      });
      return;
    }
    
    // Validate amount against plan limits
    const amount = parseFloat(values.monthlyAmount);
    if (amount < selectedPlan.minAmount || (selectedPlan.maxAmount && amount > selectedPlan.maxAmount)) {
      toast({
        variant: "destructive",
        title: t('invalidAmount'),
        description: t('amountOutOfRange', { 
          min: formatMoney(selectedPlan.minAmount, "USD"), 
          max: selectedPlan.maxAmount ? formatMoney(selectedPlan.maxAmount, "USD") : t('noLimit') 
        }),
      });
      return;
    }
    
    // Prepare data for API
    const dpsData = {
      planId: parseInt(values.planId),
      walletId: parseInt(values.walletId),
      monthlyAmount: amount,
      term: parseInt(values.term),
      interestRate: selectedPlan.interestRate,
      accountNumber: `DPS${Date.now().toString().slice(-8)}`,
      startDate: new Date().toISOString(),
      nextPaymentDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      maturityDate: new Date(Date.now() + parseInt(values.term) * 30 * 24 * 60 * 60 * 1000).toISOString(),
      status: "active",
      totalDeposited: amount, // Initial deposit
      interestEarned: 0,
    };
    
    createDpsMutation.mutate(dpsData);
  };
  
  // Handle FDR form submission
  const onFdrSubmit = (values: z.infer<typeof fdrFormSchema>) => {
    // Get selected plan details
    const selectedPlan = fdrPlans?.find((plan: any) => plan.id.toString() === values.planId);
    if (!selectedPlan) {
      toast({
        variant: "destructive",
        title: t('error'),
        description: t('planNotFound'),
      });
      return;
    }
    
    // Validate amount against plan limits
    const amount = parseFloat(values.principalAmount);
    if (amount < selectedPlan.minAmount || (selectedPlan.maxAmount && amount > selectedPlan.maxAmount)) {
      toast({
        variant: "destructive",
        title: t('invalidAmount'),
        description: t('amountOutOfRange', { 
          min: formatMoney(selectedPlan.minAmount, "USD"), 
          max: selectedPlan.maxAmount ? formatMoney(selectedPlan.maxAmount, "USD") : t('noLimit') 
        }),
      });
      return;
    }
    
    // Prepare data for API
    const fdrData = {
      planId: parseInt(values.planId),
      walletId: parseInt(values.walletId),
      principalAmount: amount,
      term: parseInt(values.term),
      interestRate: selectedPlan.interestRate,
      compounding: values.compounding,
      accountNumber: `FDR${Date.now().toString().slice(-8)}`,
      startDate: new Date().toISOString(),
      maturityDate: new Date(Date.now() + parseInt(values.term) * 30 * 24 * 60 * 60 * 1000).toISOString(),
      status: "active",
      interestEarned: 0,
    };
    
    createFdrMutation.mutate(fdrData);
  };
  
  // Get plan details based on selected plan ID
  const selectedDpsPlan = dpsForm.watch("planId")
    ? dpsPlans?.find((plan: any) => plan.id.toString() === dpsForm.watch("planId"))
    : null;
    
  const selectedFdrPlan = fdrForm.watch("planId")
    ? fdrPlans?.find((plan: any) => plan.id.toString() === fdrForm.watch("planId"))
    : null;
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white font-heading">
          {t('dpsFdr')}
        </h1>
        
        <div className="flex space-x-2">
          {activeTab === "dps" ? (
            <Button onClick={() => setIsNewDpsOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              {t('newDpsAccount')}
            </Button>
          ) : (
            <Button onClick={() => setIsNewFdrOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              {t('newFdrAccount')}
            </Button>
          )}
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="dps">
            <Clock className="mr-2 h-4 w-4" />
            {t('depositPensionScheme')}
          </TabsTrigger>
          <TabsTrigger value="fdr">
            <TrendingUp className="mr-2 h-4 w-4" />
            {t('fixedDepositReceipt')}
          </TabsTrigger>
        </TabsList>
        
        {/* DPS Tab */}
        <TabsContent value="dps">
          <Card>
            <CardHeader>
              <CardTitle>{t('depositPensionScheme')}</CardTitle>
              <CardDescription>{t('dpsDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingDpsAccounts ? (
                <div className="space-y-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-64 w-full" />
                </div>
              ) : dpsAccounts?.length > 0 ? (
                <DataTable
                  data={dpsAccounts}
                  columns={dpsColumns}
                  searchable
                  pagination
                  pageSize={10}
                />
              ) : (
                <div className="text-center py-10">
                  <Clock className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium mb-2">{t('noDpsAccounts')}</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    {t('noDpsAccountsDescription')}
                  </p>
                  <Button onClick={() => setIsNewDpsOpen(true)}>
                    {t('createDpsAccount')}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* DPS Plans */}
          <div className="mt-6">
            <h2 className="text-lg font-medium mb-4">{t('availableDpsPlans')}</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {isLoadingDpsPlans ? (
                <>
                  <Skeleton className="h-48" />
                  <Skeleton className="h-48" />
                  <Skeleton className="h-48" />
                </>
              ) : (
                dpsPlans?.map((plan: any) => (
                  <Card key={plan.id}>
                    <CardHeader>
                      <CardTitle>{plan.name}</CardTitle>
                      <CardDescription>{plan.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">{t('interestRate')}:</span>
                        <span className="font-medium">{plan.interestRate}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">{t('term')}:</span>
                        <span className="font-medium">{plan.term} {t('months')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">{t('minimumAmount')}:</span>
                        <span className="font-medium">{formatMoney(plan.minAmount, "USD")}</span>
                      </div>
                      {plan.maxAmount && (
                        <div className="flex justify-between">
                          <span className="text-gray-500 dark:text-gray-400">{t('maximumAmount')}:</span>
                          <span className="font-medium">{formatMoney(plan.maxAmount, "USD")}</span>
                        </div>
                      )}
                    </CardContent>
                    <CardFooter>
                      <Button 
                        className="w-full" 
                        variant="outline"
                        onClick={() => {
                          dpsForm.setValue("planId", plan.id.toString());
                          dpsForm.setValue("term", plan.term.toString());
                          setIsNewDpsOpen(true);
                        }}
                      >
                        {t('applyNow')}
                      </Button>
                    </CardFooter>
                  </Card>
                ))
              )}
            </div>
          </div>
        </TabsContent>
        
        {/* FDR Tab */}
        <TabsContent value="fdr">
          <Card>
            <CardHeader>
              <CardTitle>{t('fixedDepositReceipt')}</CardTitle>
              <CardDescription>{t('fdrDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingFdrAccounts ? (
                <div className="space-y-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-64 w-full" />
                </div>
              ) : fdrAccounts?.length > 0 ? (
                <DataTable
                  data={fdrAccounts}
                  columns={fdrColumns}
                  searchable
                  pagination
                  pageSize={10}
                />
              ) : (
                <div className="text-center py-10">
                  <TrendingUp className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium mb-2">{t('noFdrAccounts')}</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    {t('noFdrAccountsDescription')}
                  </p>
                  <Button onClick={() => setIsNewFdrOpen(true)}>
                    {t('createFdrAccount')}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* FDR Plans */}
          <div className="mt-6">
            <h2 className="text-lg font-medium mb-4">{t('availableFdrPlans')}</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {isLoadingFdrPlans ? (
                <>
                  <Skeleton className="h-48" />
                  <Skeleton className="h-48" />
                  <Skeleton className="h-48" />
                </>
              ) : (
                fdrPlans?.map((plan: any) => (
                  <Card key={plan.id}>
                    <CardHeader>
                      <CardTitle>{plan.name}</CardTitle>
                      <CardDescription>{plan.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">{t('interestRate')}:</span>
                        <span className="font-medium">{plan.interestRate}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">{t('term')}:</span>
                        <span className="font-medium">{plan.term} {t('months')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">{t('compounding')}:</span>
                        <span className="font-medium">{plan.compounding ? t('yes') : t('no')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">{t('minimumAmount')}:</span>
                        <span className="font-medium">{formatMoney(plan.minAmount, "USD")}</span>
                      </div>
                      {plan.maxAmount && (
                        <div className="flex justify-between">
                          <span className="text-gray-500 dark:text-gray-400">{t('maximumAmount')}:</span>
                          <span className="font-medium">{formatMoney(plan.maxAmount, "USD")}</span>
                        </div>
                      )}
                    </CardContent>
                    <CardFooter>
                      <Button 
                        className="w-full" 
                        variant="outline"
                        onClick={() => {
                          fdrForm.setValue("planId", plan.id.toString());
                          fdrForm.setValue("term", plan.term.toString());
                          fdrForm.setValue("compounding", plan.compounding);
                          setIsNewFdrOpen(true);
                        }}
                      >
                        {t('applyNow')}
                      </Button>
                    </CardFooter>
                  </Card>
                ))
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
      
      {/* DPS Application Dialog */}
      <Dialog open={isNewDpsOpen} onOpenChange={setIsNewDpsOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>{t('newDpsAccount')}</DialogTitle>
            <DialogDescription>
              {t('newDpsAccountDescription')}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...dpsForm}>
            <form onSubmit={dpsForm.handleSubmit(onDpsSubmit)} className="space-y-4">
              {/* Plan Selection */}
              <FormField
                control={dpsForm.control}
                name="planId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('selectPlan')}</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isLoadingDpsPlans}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('selectPlan')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {dpsPlans?.map((plan: any) => (
                          <SelectItem key={plan.id} value={plan.id.toString()}>
                            {plan.name} - {plan.interestRate}% ({plan.term} {t('months')})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Source Wallet */}
              <FormField
                control={dpsForm.control}
                name="walletId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('sourceWallet')}</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isLoadingWallets}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('selectWallet')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {wallets?.filter((w: any) => w.type !== 'crypto-btc' && w.type !== 'crypto-eth').map((wallet: any) => (
                          <SelectItem key={wallet.id} value={wallet.id.toString()}>
                            {wallet.type === 'main' ? t('mainWallet') : t('savingsAccount')} ({formatMoney(wallet.balance, wallet.currency)})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Monthly Amount */}
              <FormField
                control={dpsForm.control}
                name="monthlyAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('monthlyDepositAmount')}</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" min="0" step="0.01" placeholder="0.00" />
                    </FormControl>
                    {selectedDpsPlan && (
                      <FormDescription>
                        {t('amountRange', {
                          min: formatMoney(selectedDpsPlan.minAmount, "USD"),
                          max: selectedDpsPlan.maxAmount ? formatMoney(selectedDpsPlan.maxAmount, "USD") : t('noLimit')
                        })}
                      </FormDescription>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Term Selection */}
              <FormField
                control={dpsForm.control}
                name="term"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('term')}</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('selectTerm')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {selectedDpsPlan ? (
                          <SelectItem value={selectedDpsPlan.term.toString()}>
                            {selectedDpsPlan.term} {t('months')}
                          </SelectItem>
                        ) : (
                          [12, 24, 36, 48, 60].map((months) => (
                            <SelectItem key={months} value={months.toString()}>
                              {months} {t('months')}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Plan Summary */}
              {selectedDpsPlan && dpsForm.watch("monthlyAmount") && dpsForm.watch("term") && (
                <Card className="bg-slate-50 dark:bg-slate-900">
                  <CardContent className="p-4 space-y-2">
                    <h3 className="font-medium">{t('planSummary')}</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>{t('planName')}:</span>
                        <span className="font-medium">{selectedDpsPlan.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>{t('interestRate')}:</span>
                        <span className="font-medium">{selectedDpsPlan.interestRate}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>{t('monthlyDeposit')}:</span>
                        <span className="font-medium">{formatMoney(parseFloat(dpsForm.watch("monthlyAmount") || "0"), "USD")}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>{t('term')}:</span>
                        <span className="font-medium">{dpsForm.watch("term")} {t('months')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>{t('totalContribution')}:</span>
                        <span className="font-medium">
                          {formatMoney(
                            parseFloat(dpsForm.watch("monthlyAmount") || "0") * parseInt(dpsForm.watch("term") || "0"), 
                            "USD"
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>{t('estimatedMaturityValue')}:</span>
                        <span className="font-medium">
                          {formatMoney(
                            calculateDpsMaturityValue(
                              parseFloat(dpsForm.watch("monthlyAmount") || "0"),
                              parseInt(dpsForm.watch("term") || "0"),
                              selectedDpsPlan.interestRate
                            ),
                            "USD"
                          )}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </form>
          </Form>
          
          <DialogFooter className="flex space-x-2 justify-end">
            <Button variant="outline" onClick={() => setIsNewDpsOpen(false)}>
              {t('cancel')}
            </Button>
            <Button 
              onClick={dpsForm.handleSubmit(onDpsSubmit)}
              disabled={createDpsMutation.isPending}
            >
              {createDpsMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                  {t('processing')}
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <ArrowRight className="h-4 w-4" />
                  {t('openAccount')}
                </span>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* FDR Application Dialog */}
      <Dialog open={isNewFdrOpen} onOpenChange={setIsNewFdrOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>{t('newFdrAccount')}</DialogTitle>
            <DialogDescription>
              {t('newFdrAccountDescription')}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...fdrForm}>
            <form onSubmit={fdrForm.handleSubmit(onFdrSubmit)} className="space-y-4">
              {/* Plan Selection */}
              <FormField
                control={fdrForm.control}
                name="planId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('selectPlan')}</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isLoadingFdrPlans}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('selectPlan')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {fdrPlans?.map((plan: any) => (
                          <SelectItem key={plan.id} value={plan.id.toString()}>
                            {plan.name} - {plan.interestRate}% ({plan.term} {t('months')})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Source Wallet */}
              <FormField
                control={fdrForm.control}
                name="walletId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('sourceWallet')}</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isLoadingWallets}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('selectWallet')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {wallets?.filter((w: any) => w.type !== 'crypto-btc' && w.type !== 'crypto-eth').map((wallet: any) => (
                          <SelectItem key={wallet.id} value={wallet.id.toString()}>
                            {wallet.type === 'main' ? t('mainWallet') : t('savingsAccount')} ({formatMoney(wallet.balance, wallet.currency)})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Principal Amount */}
              <FormField
                control={fdrForm.control}
                name="principalAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('principalAmount')}</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" min="0" step="0.01" placeholder="0.00" />
                    </FormControl>
                    {selectedFdrPlan && (
                      <FormDescription>
                        {t('amountRange', {
                          min: formatMoney(selectedFdrPlan.minAmount, "USD"),
                          max: selectedFdrPlan.maxAmount ? formatMoney(selectedFdrPlan.maxAmount, "USD") : t('noLimit')
                        })}
                      </FormDescription>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Term Selection */}
              <FormField
                control={fdrForm.control}
                name="term"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('term')}</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('selectTerm')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {selectedFdrPlan ? (
                          <SelectItem value={selectedFdrPlan.term.toString()}>
                            {selectedFdrPlan.term} {t('months')}
                          </SelectItem>
                        ) : (
                          [3, 6, 12, 24, 36].map((months) => (
                            <SelectItem key={months} value={months.toString()}>
                              {months} {t('months')}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Compounding Toggle */}
              <FormField
                control={fdrForm.control}
                name="compounding"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        {t('compoundingInterest')}
                      </FormLabel>
                      <FormDescription>
                        {t('compoundingDescription')}
                      </FormDescription>
                    </div>
                    <FormControl>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                        <span>{field.value ? t('enabled') : t('disabled')}</span>
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />
              
              {/* Plan Summary */}
              {selectedFdrPlan && fdrForm.watch("principalAmount") && fdrForm.watch("term") && (
                <Card className="bg-slate-50 dark:bg-slate-900">
                  <CardContent className="p-4 space-y-2">
                    <h3 className="font-medium">{t('planSummary')}</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>{t('planName')}:</span>
                        <span className="font-medium">{selectedFdrPlan.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>{t('interestRate')}:</span>
                        <span className="font-medium">{selectedFdrPlan.interestRate}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>{t('principalAmount')}:</span>
                        <span className="font-medium">{formatMoney(parseFloat(fdrForm.watch("principalAmount") || "0"), "USD")}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>{t('term')}:</span>
                        <span className="font-medium">{fdrForm.watch("term")} {t('months')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>{t('compounding')}:</span>
                        <span className="font-medium">{fdrForm.watch("compounding") ? t('yes') : t('no')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>{t('maturityDate')}:</span>
                        <span className="font-medium">
                          {formatDate(new Date(Date.now() + parseInt(fdrForm.watch("term") || "0") * 30 * 24 * 60 * 60 * 1000))}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>{t('estimatedMaturityValue')}:</span>
                        <span className="font-medium">
                          {formatMoney(
                            calculateFdrMaturityValue(
                              parseFloat(fdrForm.watch("principalAmount") || "0"),
                              parseInt(fdrForm.watch("term") || "0"),
                              selectedFdrPlan.interestRate,
                              fdrForm.watch("compounding")
                            ),
                            "USD"
                          )}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </form>
          </Form>
          
          <DialogFooter className="flex space-x-2 justify-end">
            <Button variant="outline" onClick={() => setIsNewFdrOpen(false)}>
              {t('cancel')}
            </Button>
            <Button 
              onClick={fdrForm.handleSubmit(onFdrSubmit)}
              disabled={createFdrMutation.isPending}
            >
              {createFdrMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                  {t('processing')}
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Check className="h-4 w-4" />
                  {t('openAccount')}
                </span>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Helper function to calculate DPS maturity value
function calculateDpsMaturityValue(monthlyAmount: number, term: number, interestRate: number): number {
  const annualRate = interestRate / 100;
  const monthlyRate = annualRate / 12;
  let totalAmount = 0;
  
  for (let i = 0; i < term; i++) {
    totalAmount += monthlyAmount;
    totalAmount += totalAmount * monthlyRate;
  }
  
  return totalAmount;
}

// Helper function to calculate FDR maturity value
function calculateFdrMaturityValue(principal: number, term: number, interestRate: number, compounding: boolean): number {
  const annualRate = interestRate / 100;
  
  if (!compounding) {
    // Simple interest
    const interest = principal * annualRate * (term / 12);
    return principal + interest;
  } else {
    // Compound interest (monthly compounding)
    const monthlyRate = annualRate / 12;
    return principal * Math.pow(1 + monthlyRate, term);
  }
}
