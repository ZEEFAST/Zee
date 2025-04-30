import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { formatDate } from "@/lib/utils";
import { useLanguage } from "@/hooks/use-language";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { 
  Search, 
  AlertCircle,
  CheckCircle,
  XCircle,
  Eye,
  FileText, 
  Download
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminKycManagement() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedKyc, setSelectedKyc] = useState<any>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  
  // Fetch KYC applications
  const { data: kycApplications, isLoading: isLoadingKyc } = useQuery({
    queryKey: ['/api/admin/kyc-applications'],
  });

  // Approve KYC mutation
  const approveKycMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("POST", `/api/admin/kyc-applications/${id}/approve`, {});
    },
    onSuccess: () => {
      toast({
        title: t('kycApproved'),
        description: t('kycApprovedDescription'),
      });
      // Close modal and refresh data
      setIsDetailsModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['/api/admin/kyc-applications'] });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: t('kycApprovalFailed'),
        description: error instanceof Error ? error.message : t('kycApprovalFailedDescription'),
      });
    }
  });

  // Reject KYC mutation
  const rejectKycMutation = useMutation({
    mutationFn: async (data: { id: number, reason: string }) => {
      return await apiRequest("POST", `/api/admin/kyc-applications/${data.id}/reject`, { reason: data.reason });
    },
    onSuccess: () => {
      toast({
        title: t('kycRejected'),
        description: t('kycRejectedDescription'),
      });
      // Close modal and refresh data
      setIsDetailsModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['/api/admin/kyc-applications'] });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: t('kycRejectionFailed'),
        description: error instanceof Error ? error.message : t('kycRejectionFailedDescription'),
      });
    }
  });

  // KYC table columns
  const kycColumns = [
    {
      key: "id",
      header: "ID",
      cell: (application: any) => application.id,
      sortable: true,
    },
    {
      key: "userId",
      header: t('userId'),
      cell: (application: any) => application.userId,
      sortable: true,
    },
    {
      key: "userName",
      header: t('username'),
      cell: (application: any) => application.userName,
      sortable: true,
    },
    {
      key: "fullName",
      header: t('fullName'),
      cell: (application: any) => application.fullName,
      sortable: true,
    },
    {
      key: "documentType",
      header: t('documentType'),
      cell: (application: any) => application.documentType,
      sortable: true,
    },
    {
      key: "submittedAt",
      header: t('submittedAt'),
      cell: (application: any) => formatDate(application.submittedAt),
      sortable: true,
    },
    {
      key: "status",
      header: t('status'),
      cell: (application: any) => (
        <Badge variant={
          application.status === "approved" ? "success" :
          application.status === "pending" ? "outline" : "destructive"
        }>
          {application.status}
        </Badge>
      ),
      sortable: true,
    },
    {
      key: "actions",
      header: t('actions'),
      cell: (application: any) => (
        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => {
              setSelectedKyc(application);
              setIsDetailsModalOpen(true);
            }}
          >
            <Eye className="h-4 w-4" />
            <span className="sr-only">{t('viewDetails')}</span>
          </Button>
          
          {application.status === "pending" && (
            <>
              <Button 
                variant="outline" 
                size="sm" 
                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                onClick={() => approveKycMutation.mutate(application.id)}
              >
                <CheckCircle className="h-4 w-4" />
                <span className="sr-only">{t('approve')}</span>
              </Button>
              
              <Button 
                variant="outline" 
                size="sm"
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={() => {
                  setSelectedKyc(application);
                  // Here you would open a reject dialog with reason field
                  // For simplicity we're just calling reject with a default reason
                  rejectKycMutation.mutate({ id: application.id, reason: "Documentation not valid" });
                }}
              >
                <XCircle className="h-4 w-4" />
                <span className="sr-only">{t('reject')}</span>
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  // Filter KYC applications based on active tab and search query
  const filteredKyc = kycApplications
    ? kycApplications.filter((application: any) => {
        // Filter by tab first
        if (activeTab === "all") {
          // Continue to search filter
        } else if (activeTab === "pending" && application.status !== "pending") {
          return false;
        } else if (activeTab === "approved" && application.status !== "approved") {
          return false;
        } else if (activeTab === "rejected" && application.status !== "rejected") {
          return false;
        }
        
        // Then filter by search query if it exists
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          return (
            application.userName.toLowerCase().includes(query) ||
            application.fullName.toLowerCase().includes(query) ||
            application.documentType.toLowerCase().includes(query)
          );
        }
        
        return true;
      })
    : [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white font-heading">
          {t('kycManagement')}
        </h1>
      </div>
      
      <div className="flex items-center justify-between">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex justify-between items-center">
            <TabsList>
              <TabsTrigger value="all">
                <FileText className="mr-2 h-4 w-4" />
                {t('allApplications')}
              </TabsTrigger>
              <TabsTrigger value="pending">
                <AlertCircle className="mr-2 h-4 w-4" />
                {t('pending')}
              </TabsTrigger>
              <TabsTrigger value="approved">
                <CheckCircle className="mr-2 h-4 w-4" />
                {t('approved')}
              </TabsTrigger>
              <TabsTrigger value="rejected">
                <XCircle className="mr-2 h-4 w-4" />
                {t('rejected')}
              </TabsTrigger>
            </TabsList>
            
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('searchApplications')}
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          {["all", "pending", "approved", "rejected"].map((tab) => (
            <TabsContent key={tab} value={tab} className="mt-4">
              <Card>
                <CardContent className="p-0">
                  {isLoadingKyc ? (
                    <div className="p-4 space-y-4">
                      <Skeleton className="h-8 w-full" />
                      <Skeleton className="h-64 w-full" />
                    </div>
                  ) : filteredKyc.length > 0 ? (
                    <DataTable
                      data={filteredKyc}
                      columns={kycColumns}
                      searchable={false} // We handle search separately
                      pagination
                      pageSize={10}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8">
                      <FileText className="h-12 w-12 text-muted-foreground mb-2" />
                      <p className="text-muted-foreground">{t('noKycApplicationsFound')}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>
      
      {/* KYC Details Modal */}
      <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{t('kycApplicationDetails')}</DialogTitle>
            <DialogDescription>
              {t('kycApplicationSubmittedOn', { date: selectedKyc ? formatDate(selectedKyc.submittedAt) : '' })}
            </DialogDescription>
          </DialogHeader>
          
          {selectedKyc && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">{t('applicantDetails')}</h3>
                  <div className="mt-1 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">{t('userId')}:</span>
                      <span className="text-sm font-medium">{selectedKyc.userId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">{t('username')}:</span>
                      <span className="text-sm font-medium">{selectedKyc.userName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">{t('fullName')}:</span>
                      <span className="text-sm font-medium">{selectedKyc.fullName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">{t('dateOfBirth')}:</span>
                      <span className="text-sm font-medium">{selectedKyc.dateOfBirth ? formatDate(selectedKyc.dateOfBirth) : '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">{t('nationality')}:</span>
                      <span className="text-sm font-medium">{selectedKyc.nationality || '-'}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">{t('documentDetails')}</h3>
                  <div className="mt-1 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">{t('documentType')}:</span>
                      <span className="text-sm font-medium">{selectedKyc.documentType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">{t('documentNumber')}:</span>
                      <span className="text-sm font-medium">{selectedKyc.documentNumber || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">{t('issueDate')}:</span>
                      <span className="text-sm font-medium">{selectedKyc.issueDate ? formatDate(selectedKyc.issueDate) : '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">{t('expiryDate')}:</span>
                      <span className="text-sm font-medium">{selectedKyc.expiryDate ? formatDate(selectedKyc.expiryDate) : '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">{t('status')}:</span>
                      <Badge variant={
                        selectedKyc.status === "approved" ? "success" :
                        selectedKyc.status === "pending" ? "outline" : "destructive"
                      }>
                        {selectedKyc.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">{t('documents')}</h3>
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="p-3">
                      <CardTitle className="text-sm">{t('identificationDocument')}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-3">
                      <div className="bg-muted h-32 flex items-center justify-center">
                        <Button variant="outline" size="sm">
                          <Eye className="mr-2 h-4 w-4" />
                          {t('viewDocument')}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="p-3">
                      <CardTitle className="text-sm">{t('proofOfAddress')}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-3">
                      <div className="bg-muted h-32 flex items-center justify-center">
                        <Button variant="outline" size="sm">
                          <Eye className="mr-2 h-4 w-4" />
                          {t('viewDocument')}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
              
              {selectedKyc.status === "pending" && (
                <DialogFooter className="flex justify-between items-center">
                  <div className="flex-1">
                    {approveKycMutation.isPending || rejectKycMutation.isPending ? (
                      <div className="text-sm text-muted-foreground">
                        {t('processingRequest')}...
                      </div>
                    ) : null}
                  </div>
                  <div className="space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => rejectKycMutation.mutate({ id: selectedKyc.id, reason: "Documentation not valid" })}
                      disabled={approveKycMutation.isPending || rejectKycMutation.isPending}
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      {t('reject')}
                    </Button>
                    <Button
                      onClick={() => approveKycMutation.mutate(selectedKyc.id)}
                      disabled={approveKycMutation.isPending || rejectKycMutation.isPending}
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      {t('approve')}
                    </Button>
                  </div>
                </DialogFooter>
              )}
              
              {selectedKyc.status === "rejected" && selectedKyc.rejectionReason && (
                <div className="bg-red-50 p-3 rounded-md border border-red-200">
                  <h4 className="text-sm font-medium text-red-800 mb-1">{t('rejectionReason')}:</h4>
                  <p className="text-sm text-red-700">{selectedKyc.rejectionReason}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}