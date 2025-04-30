import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { formatMoney, formatDateTime } from "@/lib/utils";
import { useLanguage } from "@/hooks/use-language";
import { Check, ArrowLeftRight, ArrowRight, CreditCard, Building, Globe } from "lucide-react";

// Transfer form schema
const transferSchema = z.object({
  fromWalletId: z.string().min(1, "Please select source account"),
  transferType: z.string().min(1, "Please select transfer type"),
  amount: z.string().min(1, "Amount is required").refine(
    (val) => !isNaN(Number(val)) && Number(val) > 0,
    "Amount must be a positive number"
  ),
  toWalletId: z.string().optional(),
  recipientName: z.string().optional(),
  recipientAccount: z.string().optional(),
  recipientBank: z.string().optional(),
  swiftCode: z.string().optional(),
  description: z.string().optional(),
}).refine((data) => {
  // If internal transfer, toWalletId is required
  if (data.transferType === "internal" && !data.toWalletId) {
    return false;
  }
  // If bank transfer, recipient details are required
  if (data.transferType === "bank" && (!data.recipientName || !data.recipientAccount || !data.recipientBank)) {
    return false;
  }
  // If wire or swift transfer, all recipient details including swift code are required
  if ((data.transferType === "wire" || data.transferType === "swift") && 
      (!data.recipientName || !data.recipientAccount || !data.recipientBank || !data.swiftCode)) {
    return false;
  }
  return true;
}, {
  message: "Please fill all required fields for this transfer type",
  path: ["transferType"],
});

export default function Transfers() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [transferTab, setTransferTab] = useState("new");
  
  // Fetch wallets for transfer source and destination
  const { data: wallets, isLoading: isLoadingWallets } = useQuery({
    queryKey: ['/api/wallets'],
  });
  
  // Fetch transfer history
  const { data: transfers, isLoading: isLoadingTransfers } = useQuery({
    queryKey: ['/api/transfers'],
  });
  
  // Form setup
  const form = useForm<z.infer<typeof transferSchema>>({
    resolver: zodResolver(transferSchema),
    defaultValues: {
      fromWalletId: "",
      transferType: "internal",
      amount: "",
      toWalletId: "",
      recipientName: "",
      recipientAccount: "",
      recipientBank: "",
      swiftCode: "",
      description: "",
    },
  });
  
  // Get the selected transfer type
  const transferType = form.watch("transferType");
  const fromWalletId = form.watch("fromWalletId");
  
  // Calculate the fee based on transfer type
  const calculateFee = (type: string, amount: number): number => {
    switch (type) {
      case "internal":
        return 0;
      case "bank":
        return amount * 0.005; // 0.5%
      case "wire":
        return amount * 0.01 + 10; // 1% + $10
      case "swift":
        return amount * 0.015 + 25; // 1.5% + $25
      default:
        return 0;
    }
  };
  
  // Transfer mutation
  const transferMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/transfers", data);
    },
    onSuccess: () => {
      toast({
        title: t('transferSuccess'),
        description: t('transferSuccessDescription'),
      });
      // Reset form and switch to history tab
      form.reset();
      setTransferTab("history");
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: t('transferFailed'),
        description: error instanceof Error ? error.message : t('transferFailedDescription'),
      });
    },
  });
  
  // Handle form submission
  const onSubmit = (values: z.infer<typeof transferSchema>) => {
    const amount = parseFloat(values.amount);
    const fee = calculateFee(values.transferType, amount);
    
    // Prepare transfer data
    const transferData: any = {
      fromWalletId: parseInt(values.fromWalletId),
      amount,
      fee,
      type: values.transferType,
      status: "pending",
    };
    
    // Add recipient info based on transfer type
    if (values.transferType === "internal") {
      transferData.toWalletId = parseInt(values.toWalletId || "0");
    } else {
      transferData.recipientInfo = {
        name: values.recipientName,
        account: values.recipientAccount,
        bank: values.recipientBank,
        swiftCode: values.swiftCode,
      };
    }
    
    if (values.description) {
      transferData.reference = values.description;
    }
    
    // Submit transfer
    transferMutation.mutate(transferData);
  };
  
  // Transfer history table columns
  const transferColumns = [
    {
      key: "date",
      header: t('date'),
      cell: (transfer: any) => formatDateTime(transfer.createdAt),
      sortable: true,
    },
    {
      key: "type",
      header: t('type'),
      cell: (transfer: any) => (
        <Badge variant={
          transfer.type === "internal" ? "outline" :
          transfer.type === "bank" ? "secondary" :
          transfer.type === "wire" ? "default" : "destructive"
        }>
          {transfer.type}
        </Badge>
      ),
      sortable: true,
    },
    {
      key: "amount",
      header: t('amount'),
      cell: (transfer: any) => formatMoney(transfer.amount, transfer.currency || "USD"),
      sortable: true,
    },
    {
      key: "fee",
      header: t('fee'),
      cell: (transfer: any) => formatMoney(transfer.fee || 0, transfer.currency || "USD"),
      sortable: true,
    },
    {
      key: "status",
      header: t('status'),
      cell: (transfer: any) => (
        <Badge variant={
          transfer.status === "completed" ? "success" :
          transfer.status === "pending" ? "warning" : "destructive"
        }>
          {transfer.status}
        </Badge>
      ),
      sortable: true,
    },
    {
      key: "reference",
      header: t('reference'),
      cell: (transfer: any) => transfer.reference || "-",
      sortable: false,
    },
  ];
  
  // Get the source wallet object
  const sourceWallet = wallets?.find((w: any) => w.id.toString() === fromWalletId);
  
  // Calculate total amount including fee
  const amount = parseFloat(form.watch("amount") || "0");
  const fee = calculateFee(transferType, amount);
  const total = amount + fee;
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white font-heading">
        {t('transfers')}
      </h1>
      
      <Tabs value={transferTab} onValueChange={setTransferTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="new">
            <ArrowRight className="mr-2 h-4 w-4" />
            {t('newTransfer')}
          </TabsTrigger>
          <TabsTrigger value="history">
            <ArrowLeftRight className="mr-2 h-4 w-4" />
            {t('transferHistory')}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="new">
          <Card>
            <CardHeader>
              <CardTitle>{t('createNewTransfer')}</CardTitle>
              <CardDescription>{t('fillDetailsForTransfer')}</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Source Account */}
                  <FormField
                    control={form.control}
                    name="fromWalletId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('fromAccount')}</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={isLoadingWallets}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t('selectSourceAccount')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {wallets?.map((wallet: any) => (
                              <SelectItem key={wallet.id} value={wallet.id.toString()}>
                                {wallet.type === 'main' 
                                  ? t('mainWallet') 
                                  : wallet.type === 'savings' 
                                    ? t('savingsAccount') 
                                    : t('cryptoWallet')} ({formatMoney(wallet.balance, wallet.currency)})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Transfer Type */}
                  <FormField
                    control={form.control}
                    name="transferType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('transferType')}</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t('selectTransferType')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="internal">
                              <div className="flex items-center">
                                <CreditCard className="mr-2 h-4 w-4" />
                                {t('internalTransfer')}
                              </div>
                            </SelectItem>
                            <SelectItem value="bank">
                              <div className="flex items-center">
                                <Building className="mr-2 h-4 w-4" />
                                {t('bankTransfer')}
                              </div>
                            </SelectItem>
                            <SelectItem value="wire">
                              <div className="flex items-center">
                                <Globe className="mr-2 h-4 w-4" />
                                {t('wireTransfer')}
                              </div>
                            </SelectItem>
                            <SelectItem value="swift">
                              <div className="flex items-center">
                                <Globe className="mr-2 h-4 w-4" />
                                {t('swiftTransfer')}
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          {transferType === "internal" 
                            ? t('internalTransferDescription') 
                            : transferType === "bank" 
                              ? t('bankTransferDescription') 
                              : transferType === "wire" 
                                ? t('wireTransferDescription') 
                                : t('swiftTransferDescription')}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Amount */}
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('amount')}</FormLabel>
                        <FormControl>
                          <Input {...field} type="number" min="0" step="0.01" placeholder="0.00" />
                        </FormControl>
                        {sourceWallet && (
                          <FormDescription>
                            {t('availableBalance')}: {formatMoney(sourceWallet.balance, sourceWallet.currency)}
                          </FormDescription>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Destination Account - for internal transfers */}
                  {transferType === "internal" && (
                    <FormField
                      control={form.control}
                      name="toWalletId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('toAccount')}</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            disabled={isLoadingWallets}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={t('selectDestinationAccount')} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {wallets?.filter((w: any) => w.id.toString() !== fromWalletId).map((wallet: any) => (
                                <SelectItem key={wallet.id} value={wallet.id.toString()}>
                                  {wallet.type === 'main' 
                                    ? t('mainWallet') 
                                    : wallet.type === 'savings' 
                                      ? t('savingsAccount') 
                                      : t('cryptoWallet')} ({formatMoney(wallet.balance, wallet.currency)})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                  
                  {/* External Transfer Details */}
                  {transferType !== "internal" && (
                    <>
                      <FormField
                        control={form.control}
                        name="recipientName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('recipientName')}</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder={t('recipientNamePlaceholder')} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="recipientAccount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('accountNumber')}</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder={t('accountNumberPlaceholder')} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="recipientBank"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('bankName')}</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder={t('bankNamePlaceholder')} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {(transferType === "wire" || transferType === "swift") && (
                        <FormField
                          control={form.control}
                          name="swiftCode"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t('swiftCode')}</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder={t('swiftCodePlaceholder')} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                    </>
                  )}
                  
                  {/* Description / Reference */}
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('description')}</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder={t('descriptionPlaceholder')} />
                        </FormControl>
                        <FormDescription>
                          {t('descriptionHelp')}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </form>
              </Form>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              {/* Transaction summary */}
              {amount > 0 && (
                <Card className="w-full bg-slate-50 dark:bg-slate-900">
                  <CardContent className="p-4">
                    <h3 className="font-medium mb-2">{t('transferSummary')}</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>{t('amount')}:</span>
                        <span>{formatMoney(amount, sourceWallet?.currency || "USD")}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>{t('fee')}:</span>
                        <span>{formatMoney(fee, sourceWallet?.currency || "USD")}</span>
                      </div>
                      <div className="border-t pt-2 flex justify-between font-medium">
                        <span>{t('total')}:</span>
                        <span>{formatMoney(total, sourceWallet?.currency || "USD")}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              <div className="flex justify-end gap-4 w-full">
                <Button variant="outline" onClick={() => form.reset()}>
                  {t('cancel')}
                </Button>
                <Button 
                  type="button"
                  onClick={form.handleSubmit(onSubmit)} 
                  disabled={transferMutation.isPending || (sourceWallet && total > sourceWallet.balance)}
                >
                  {transferMutation.isPending ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                      {t('processing')}
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Check className="h-4 w-4" />
                      {t('confirmTransfer')}
                    </span>
                  )}
                </Button>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>{t('transferHistory')}</CardTitle>
              <CardDescription>{t('recentTransfersDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingTransfers ? (
                <div className="space-y-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-64 w-full" />
                </div>
              ) : (
                <DataTable
                  data={transfers || []}
                  columns={transferColumns}
                  searchable
                  pagination
                  pageSize={10}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
