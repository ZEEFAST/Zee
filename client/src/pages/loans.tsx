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
  CardFooter,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatMoney, formatDate } from "@/lib/utils";
import { useLanguage } from "@/hooks/use-language";
import { 
  Landmark, 
  FileText, 
  Calculator,
  Clock,
  Check,
  Upload, 
  PlusCircle,
} from "lucide-react";

// Loan application schema
const loanApplicationSchema = z.object({
  loanTypeId: z.string().min(1, "Please select a loan type"),
  amount: z.string().min(1, "Amount is required").refine(
    (val) => !isNaN(Number(val)) && Number(val) > 0,
    "Amount must be a positive number"
  ),
  term: z.string().min(1, "Please select a term"),
  purpose: z.string().min(5, "Please provide a brief purpose for the loan"),
});

export default function Loans() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("loans");
  const [isLoanApplicationOpen, setIsLoanApplicationOpen] = useState(false);
  const [selectedLoanId, setSelectedLoanId] = useState<number | null>(null);
  
  // Fetch loan types
  const { data: loanTypes, isLoading: isLoadingLoanTypes } = useQuery({
    queryKey: ['/api/loans/types'],
  });
  
  // Fetch user's loan applications
  const { data: loanApplications, isLoading: isLoadingLoanApplications } = useQuery({
    queryKey: ['/api/loans/applications'],
  });
  
  // Fetch user's active loans
  const { data: loans, isLoading: isLoadingLoans } = useQuery({
    queryKey: ['/api/loans'],
  });
  
  // Loan application form
  const form = useForm<z.infer<typeof loanApplicationSchema>>({
    resolver: zodResolver(loanApplicationSchema),
    defaultValues: {
      loanTypeId: "",
      amount: "",
      term: "",
      purpose: "",
    },
  });
  
  // Create loan application mutation
  const createLoanApplicationMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/loans/applications", data);
    },
    onSuccess: () => {
      toast({
        title: t('loanApplicationSubmitted'),
        description: t('loanApplicationSubmittedDescription'),
      });
      // Reset form and close dialog
      form.reset();
      setIsLoanApplicationOpen(false);
      // Invalidate the queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/loans/applications'] });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: t('loanApplicationFailed'),
        description: error instanceof Error ? error.message : t('loanApplicationFailedDescription'),
      });
    },
  });
  
  // Handle form submission
  const onSubmit = (values: z.infer<typeof loanApplicationSchema>) => {
    // Get selected loan type details
    const selectedLoanType = loanTypes?.find((type: any) => type.id.toString() === values.loanTypeId);
    if (!selectedLoanType) {
      toast({
        variant: "destructive",
        title: t('error'),
        description: t('loanTypeNotFound'),
      });
      return;
    }
    
    // Validate amount against loan type limits
    const amount = parseFloat(values.amount);
    if (amount < selectedLoanType.minAmount || amount > selectedLoanType.maxAmount) {
      toast({
        variant: "destructive",
        title: t('invalidAmount'),
        description: t('loanAmountOutOfRange', { 
          min: formatMoney(selectedLoanType.minAmount, "USD"), 
          max: formatMoney(selectedLoanType.maxAmount, "USD") 
        }),
      });
      return;
    }
    
    // Validate term against loan type limits
    const term = parseInt(values.term);
    if (term < selectedLoanType.termMin || term > selectedLoanType.termMax) {
      toast({
        variant: "destructive",
        title: t('invalidTerm'),
        description: t('loanTermOutOfRange', { 
          min: selectedLoanType.termMin, 
          max: selectedLoanType.termMax 
        }),
      });
      return;
    }
    
    // Prepare data for API
    const loanApplicationData = {
      loanTypeId: parseInt(values.loanTypeId),
      amount,
      term,
      interestRate: selectedLoanType.interestRate,
      purpose: values.purpose,
      status: "pending",
      documents: [],
    };
    
    createLoanApplicationMutation.mutate(loanApplicationData);
  };
  
  // Loan applications table columns
  const loanApplicationsColumns = [
    {
      key: "applicationDate",
      header: t('applicationDate'),
      cell: (application: any) => formatDate(application.applicationDate),
      sortable: true,
    },
    {
      key: "loanType",
      header: t('loanType'),
      cell: (application: any) => {
        const loanType = loanTypes?.find((type: any) => type.id === application.loanTypeId);
        return loanType ? loanType.name : application.loanTypeId;
      },
      sortable: true,
    },
    {
      key: "amount",
      header: t('amount'),
      cell: (application: any) => formatMoney(application.amount, "USD"),
      sortable: true,
    },
    {
      key: "term",
      header: t('term'),
      cell: (application: any) => `${application.term} ${t('months')}`,
      sortable: true,
    },
    {
      key: "interestRate",
      header: t('interestRate'),
      cell: (application: any) => `${application.interestRate}%`,
      sortable: true,
    },
    {
      key: "status",
      header: t('status'),
      cell: (application: any) => (
        <Badge variant={
          application.status === "approved" ? "success" :
          application.status === "pending" ? "outline" :
          application.status === "disbursed" ? "success" : "destructive"
        }>
          {application.status}
        </Badge>
      ),
      sortable: true,
    },
  ];
  
  // Loans table columns
  const loansColumns = [
    {
      key: "accountNumber",
      header: t('accountNumber'),
      cell: (loan: any) => loan.accountNumber,
      sortable: true,
    },
    {
      key: "principalAmount",
      header: t('principalAmount'),
      cell: (loan: any) => formatMoney(loan.principalAmount, "USD"),
      sortable: true,
    },
    {
      key: "term",
      header: t('term'),
      cell: (loan: any) => `${loan.term} ${t('months')}`,
      sortable: true,
    },
    {
      key: "interestRate",
      header: t('interestRate'),
      cell: (loan: any) => `${loan.interestRate}%`,
      sortable: true,
    },
    {
      key: "monthlyPayment",
      header: t('monthlyPayment'),
      cell: (loan: any) => formatMoney(loan.monthlyPayment, "USD"),
      sortable: true,
    },
    {
      key: "nextPaymentDate",
      header: t('nextPaymentDate'),
      cell: (loan: any) => formatDate(loan.nextPaymentDate),
      sortable: true,
    },
    {
      key: "endDate",
      header: t('endDate'),
      cell: (loan: any) => formatDate(loan.endDate),
      sortable: true,
    },
    {
      key: "remainingAmount",
      header: t('remainingAmount'),
      cell: (loan: any) => formatMoney(loan.remainingAmount, "USD"),
      sortable: true,
    },
    {
      key: "status",
      header: t('status'),
      cell: (loan: any) => (
        <Badge variant={
          loan.status === "active" ? "success" :
          loan.status === "paid" ? "outline" : "destructive"
        }>
          {loan.status}
        </Badge>
      ),
      sortable: true,
    },
  ];
  
  // Selected loan type from form for display
  const selectedLoanType = form.watch("loanTypeId")
    ? loanTypes?.find((type: any) => type.id.toString() === form.watch("loanTypeId"))
    : null;
  
  // Selected loan for detail view
  const selectedLoan = selectedLoanId
    ? loans?.find((loan: any) => loan.id === selectedLoanId)
    : null;
  
  // Calculate loan summary
  const calculateLoanSummary = () => {
    if (!selectedLoanType || !form.watch("amount") || !form.watch("term")) {
      return null;
    }
    
    const amount = parseFloat(form.watch("amount"));
    const term = parseInt(form.watch("term"));
    const annualRate = selectedLoanType.interestRate / 100;
    const monthlyRate = annualRate / 12;
    
    // Calculate monthly payment using the formula: P * r * (1 + r)^n / ((1 + r)^n - 1)
    const monthlyPayment = amount * monthlyRate * Math.pow(1 + monthlyRate, term) / (Math.pow(1 + monthlyRate, term) - 1);
    const totalPayment = monthlyPayment * term;
    const totalInterest = totalPayment - amount;
    const processingFee = amount * (selectedLoanType.processingFeePercent / 100);
    
    return {
      monthlyPayment,
      totalPayment,
      totalInterest,
      processingFee,
    };
  };
  
  const loanSummary = calculateLoanSummary();
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white font-heading">
          {t('loans')}
        </h1>
        
        <Button onClick={() => setIsLoanApplicationOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          {t('applyForLoan')}
        </Button>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="loans">
            <Landmark className="mr-2 h-4 w-4" />
            {t('activeLoans')}
          </TabsTrigger>
          <TabsTrigger value="applications">
            <FileText className="mr-2 h-4 w-4" />
            {t('loanApplications')}
          </TabsTrigger>
          <TabsTrigger value="calculator">
            <Calculator className="mr-2 h-4 w-4" />
            {t('loanCalculator')}
          </TabsTrigger>
        </TabsList>
        
        {/* Active Loans Tab */}
        <TabsContent value="loans">
          <Card>
            <CardHeader>
              <CardTitle>{t('yourLoans')}</CardTitle>
              <CardDescription>{t('activeLoansDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingLoans ? (
                <div className="space-y-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-64 w-full" />
                </div>
              ) : loans?.length > 0 ? (
                <DataTable
                  data={loans}
                  columns={loansColumns}
                  searchable
                  pagination
                  pageSize={10}
                />
              ) : (
                <div className="text-center py-10">
                  <Landmark className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium mb-2">{t('noActiveLoans')}</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    {t('noActiveLoansDescription')}
                  </p>
                  <Button onClick={() => setIsLoanApplicationOpen(true)}>
                    {t('applyForLoan')}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Loan types cards */}
          <div className="mt-6">
            <h2 className="text-lg font-medium mb-4">{t('availableLoanTypes')}</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {isLoadingLoanTypes ? (
                <>
                  <Skeleton className="h-48" />
                  <Skeleton className="h-48" />
                  <Skeleton className="h-48" />
                </>
              ) : (
                loanTypes?.map((loanType: any) => (
                  <Card key={loanType.id}>
                    <CardHeader>
                      <CardTitle>{loanType.name}</CardTitle>
                      <CardDescription>{loanType.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">{t('interestRate')}:</span>
                        <span className="font-medium">{loanType.interestRate}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">{t('term')}:</span>
                        <span className="font-medium">{loanType.termMin} - {loanType.termMax} {t('months')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">{t('amountRange')}:</span>
                        <span className="font-medium">{formatMoney(loanType.minAmount, "USD")} - {formatMoney(loanType.maxAmount, "USD")}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">{t('processingFee')}:</span>
                        <span className="font-medium">{loanType.processingFeePercent}%</span>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        className="w-full" 
                        variant="outline"
                        onClick={() => {
                          form.setValue("loanTypeId", loanType.id.toString());
                          setIsLoanApplicationOpen(true);
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
        
        {/* Loan Applications Tab */}
        <TabsContent value="applications">
          <Card>
            <CardHeader>
              <CardTitle>{t('loanApplications')}</CardTitle>
              <CardDescription>{t('loanApplicationsDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingLoanApplications ? (
                <div className="space-y-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-64 w-full" />
                </div>
              ) : loanApplications?.length > 0 ? (
                <DataTable
                  data={loanApplications}
                  columns={loanApplicationsColumns}
                  searchable
                  pagination
                  pageSize={10}
                />
              ) : (
                <div className="text-center py-10">
                  <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium mb-2">{t('noLoanApplications')}</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    {t('noLoanApplicationsDescription')}
                  </p>
                  <Button onClick={() => setIsLoanApplicationOpen(true)}>
                    {t('applyForLoan')}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Loan Calculator Tab */}
        <TabsContent value="calculator">
          <Card>
            <CardHeader>
              <CardTitle>{t('loanCalculator')}</CardTitle>
              <CardDescription>{t('loanCalculatorDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div>
                    <FormField
                      control={form.control}
                      name="loanTypeId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('loanType')}</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            disabled={isLoadingLoanTypes}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={t('selectLoanType')} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {loanTypes?.map((loanType: any) => (
                                <SelectItem key={loanType.id} value={loanType.id.toString()}>
                                  {loanType.name} - {loanType.interestRate}%
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div>
                    <FormField
                      control={form.control}
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('loanAmount')}</FormLabel>
                          <FormControl>
                            <Input {...field} type="number" min="0" step="0.01" placeholder="0.00" />
                          </FormControl>
                          {selectedLoanType && (
                            <FormDescription>
                              {t('amountRange', {
                                min: formatMoney(selectedLoanType.minAmount, "USD"),
                                max: formatMoney(selectedLoanType.maxAmount, "USD")
                              })}
                            </FormDescription>
                          )}
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div>
                    <FormField
                      control={form.control}
                      name="term"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('loanTerm')}</FormLabel>
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
                              {selectedLoanType ? (
                                Array.from(
                                  { length: Math.floor((selectedLoanType.termMax - selectedLoanType.termMin) / 12) + 1 },
                                  (_, i) => selectedLoanType.termMin + i * 12
                                ).map((months) => (
                                  <SelectItem key={months} value={months.toString()}>
                                    {months} {t('months')} ({months / 12} {t('years')})
                                  </SelectItem>
                                ))
                              ) : (
                                [12, 24, 36, 48, 60].map((months) => (
                                  <SelectItem key={months} value={months.toString()}>
                                    {months} {t('months')} ({months / 12} {t('years')})
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                          {selectedLoanType && (
                            <FormDescription>
                              {t('termRange', {
                                min: selectedLoanType.termMin,
                                max: selectedLoanType.termMax
                              })}
                            </FormDescription>
                          )}
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <Button 
                    className="w-full"
                    onClick={() => setIsLoanApplicationOpen(true)}
                    disabled={!loanSummary}
                  >
                    {t('applyForThisLoan')}
                  </Button>
                </div>
                
                <div>
                  <Card className="bg-slate-50 dark:bg-slate-900">
                    <CardHeader>
                      <CardTitle>{t('loanSummary')}</CardTitle>
                      <CardDescription>{t('estimatedPayments')}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {loanSummary ? (
                        <>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-500 dark:text-gray-400">{t('loanAmount')}:</span>
                            <span className="font-medium">{formatMoney(parseFloat(form.watch("amount")), "USD")}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-500 dark:text-gray-400">{t('interestRate')}:</span>
                            <span className="font-medium">{selectedLoanType?.interestRate}%</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-500 dark:text-gray-400">{t('term')}:</span>
                            <span className="font-medium">{form.watch("term")} {t('months')}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-500 dark:text-gray-400">{t('processingFee')}:</span>
                            <span className="font-medium">{formatMoney(loanSummary.processingFee, "USD")}</span>
                          </div>
                          <div className="border-t pt-2">
                            <div className="flex justify-between items-center font-medium">
                              <span>{t('monthlyPayment')}:</span>
                              <span className="text-lg">{formatMoney(loanSummary.monthlyPayment, "USD")}</span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-500 dark:text-gray-400">{t('totalInterest')}:</span>
                            <span className="font-medium">{formatMoney(loanSummary.totalInterest, "USD")}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-500 dark:text-gray-400">{t('totalRepayment')}:</span>
                            <span className="font-medium">{formatMoney(loanSummary.totalPayment, "USD")}</span>
                          </div>
                        </>
                      ) : (
                        <div className="text-center py-6">
                          <Calculator className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                          <p className="text-gray-500 dark:text-gray-400">
                            {t('selectLoanParamsDescription')}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Loan Application Dialog */}
      <Dialog open={isLoanApplicationOpen} onOpenChange={setIsLoanApplicationOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>{t('loanApplication')}</DialogTitle>
            <DialogDescription>
              {t('loanApplicationDescription')}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Loan Type Selection */}
              <FormField
                control={form.control}
                name="loanTypeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('loanType')}</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isLoadingLoanTypes}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('selectLoanType')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {loanTypes?.map((loanType: any) => (
                          <SelectItem key={loanType.id} value={loanType.id.toString()}>
                            {loanType.name} - {loanType.interestRate}%
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Loan Amount */}
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('loanAmount')}</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" min="0" step="0.01" placeholder="0.00" />
                    </FormControl>
                    {selectedLoanType && (
                      <FormDescription>
                        {t('amountRange', {
                          min: formatMoney(selectedLoanType.minAmount, "USD"),
                          max: formatMoney(selectedLoanType.maxAmount, "USD")
                        })}
                      </FormDescription>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Loan Term */}
              <FormField
                control={form.control}
                name="term"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('loanTerm')}</FormLabel>
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
                        {selectedLoanType ? (
                          Array.from(
                            { length: Math.floor((selectedLoanType.termMax - selectedLoanType.termMin) / 12) + 1 },
                            (_, i) => selectedLoanType.termMin + i * 12
                          ).map((months) => (
                            <SelectItem key={months} value={months.toString()}>
                              {months} {t('months')} ({months / 12} {t('years')})
                            </SelectItem>
                          ))
                        ) : (
                          [12, 24, 36, 48, 60].map((months) => (
                            <SelectItem key={months} value={months.toString()}>
                              {months} {t('months')} ({months / 12} {t('years')})
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    {selectedLoanType && (
                      <FormDescription>
                        {t('termRange', {
                          min: selectedLoanType.termMin,
                          max: selectedLoanType.termMax
                        })}
                      </FormDescription>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Loan Purpose */}
              <FormField
                control={form.control}
                name="purpose"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('loanPurpose')}</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder={t('brieflyDescribePurpose')} />
                    </FormControl>
                    <FormDescription>
                      {t('loanPurposeDescription')}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Document Upload */}
              <div className="border rounded-lg p-4">
                <h3 className="font-medium mb-2">{t('requiredDocuments')}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  {t('requiredDocumentsDescription')}
                </p>
                <div className="space-y-2">
                  <div className="border border-dashed rounded-md p-6 text-center">
                    <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {t('dragDropDocuments')}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {t('supportedFileTypes')}
                    </p>
                    <Button variant="outline" size="sm" className="mt-4">
                      {t('browseFiles')}
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 italic">
                    {t('documentsSecurityNote')}
                  </p>
                </div>
              </div>
              
              {/* Loan Summary */}
              {loanSummary && (
                <Card className="bg-slate-50 dark:bg-slate-900">
                  <CardContent className="p-4 space-y-2">
                    <h3 className="font-medium">{t('loanSummary')}</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>{t('loanAmount')}:</span>
                        <span className="font-medium">{formatMoney(parseFloat(form.watch("amount")), "USD")}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>{t('interestRate')}:</span>
                        <span className="font-medium">{selectedLoanType?.interestRate}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>{t('processingFee')}:</span>
                        <span className="font-medium">{formatMoney(loanSummary.processingFee, "USD")}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>{t('monthlyPayment')}:</span>
                        <span className="font-medium">{formatMoney(loanSummary.monthlyPayment, "USD")}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>{t('totalRepayment')}:</span>
                        <span className="font-medium">{formatMoney(loanSummary.totalPayment, "USD")}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </form>
          </Form>
          
          <DialogFooter className="flex space-x-2 justify-end">
            <Button variant="outline" onClick={() => setIsLoanApplicationOpen(false)}>
              {t('cancel')}
            </Button>
            <Button 
              onClick={form.handleSubmit(onSubmit)}
              disabled={createLoanApplicationMutation.isPending}
            >
              {createLoanApplicationMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                  {t('processing')}
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Check className="h-4 w-4" />
                  {t('submitApplication')}
                </span>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
