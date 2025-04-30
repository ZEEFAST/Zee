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
  UserPlus,
  Shield,
  User,
  AlertTriangle,
  Check,
  X,
  Eye,
  Edit,
  Lock
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminUsers() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Fetch all users
  const { data: users, isLoading: isLoadingUsers } = useQuery({
    queryKey: ['/api/admin/users'],
  });

  // Handle user action
  const handleUserAction = (userId: number, action: string) => {
    console.log(`Perform ${action} action on user ${userId}`);
    // Implement the actual action functionality
    toast({
      title: t('actionPerformed'),
      description: `${action} action performed on user ${userId}`,
    });
  };

  // User table columns
  const userColumns = [
    {
      key: "id",
      header: "ID",
      cell: (user: any) => user.id,
      sortable: true,
    },
    {
      key: "username",
      header: t('username'),
      cell: (user: any) => user.username,
      sortable: true,
    },
    {
      key: "email",
      header: t('email'),
      cell: (user: any) => user.email,
      sortable: true,
    },
    {
      key: "fullName",
      header: t('fullName'),
      cell: (user: any) => user.fullName || "-",
      sortable: true,
    },
    {
      key: "role",
      header: t('role'),
      cell: (user: any) => (
        <Badge variant={user.role === "admin" ? "destructive" : "outline"}>
          {user.role}
        </Badge>
      ),
      sortable: true,
    },
    {
      key: "kycStatus",
      header: t('kycStatus'),
      cell: (user: any) => (
        <Badge variant={
          user.kycStatus === "verified" ? "success" :
          user.kycStatus === "pending" ? "outline" : "destructive"
        }>
          {user.kycStatus}
        </Badge>
      ),
      sortable: true,
    },
    {
      key: "createdAt",
      header: t('registered'),
      cell: (user: any) => formatDate(user.createdAt),
      sortable: true,
    },
    {
      key: "lastLogin",
      header: t('lastLogin'),
      cell: (user: any) => user.lastLogin ? formatDate(user.lastLogin) : "-",
      sortable: true,
    },
    {
      key: "status",
      header: t('status'),
      cell: (user: any) => (
        <div className="flex items-center">
          <span className={`h-2 w-2 rounded-full mr-2 ${
            user.isActive ? "bg-green-500" : "bg-red-500"
          }`}></span>
          {user.isActive ? t('active') : t('inactive')}
        </div>
      ),
      sortable: true,
    },
    {
      key: "actions",
      header: t('actions'),
      cell: (user: any) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">{t('openMenu')}</span>
              <i className="text-gray-500 dark:text-gray-400">...</i>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{t('actions')}</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => handleUserAction(user.id, 'view')}>
              <Eye className="mr-2 h-4 w-4" />
              {t('viewDetails')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleUserAction(user.id, 'edit')}>
              <Edit className="mr-2 h-4 w-4" />
              {t('editUser')}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleUserAction(user.id, 'resetPassword')}>
              <Lock className="mr-2 h-4 w-4" />
              {t('resetPassword')}
            </DropdownMenuItem>
            {user.isActive ? (
              <DropdownMenuItem 
                className="text-red-600"
                onClick={() => handleUserAction(user.id, 'suspend')}
              >
                <X className="mr-2 h-4 w-4" />
                {t('suspendUser')}
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem 
                className="text-green-600"
                onClick={() => handleUserAction(user.id, 'activate')}
              >
                <Check className="mr-2 h-4 w-4" />
                {t('activateUser')}
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  // Filter users based on active tab and search query
  const filteredUsers = users
    ? users.filter((user: any) => {
        // Filter by tab first
        if (activeTab === "all") {
          // Continue to search filter
        } else if (activeTab === "admins" && user.role !== "admin") {
          return false;
        } else if (activeTab === "customers" && user.role !== "customer") {
          return false;
        } else if (activeTab === "needKyc" && user.kycStatus !== "pending") {
          return false;
        }
        
        // Then filter by search query if it exists
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          return (
            user.username.toLowerCase().includes(query) ||
            user.email.toLowerCase().includes(query) ||
            (user.fullName && user.fullName.toLowerCase().includes(query))
          );
        }
        
        return true;
      })
    : [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white font-heading">
          {t('userManagement')}
        </h1>
        
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          {t('addUser')}
        </Button>
      </div>
      
      <div className="flex items-center justify-between">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex justify-between items-center">
            <TabsList>
              <TabsTrigger value="all">
                <User className="mr-2 h-4 w-4" />
                {t('allUsers')}
              </TabsTrigger>
              <TabsTrigger value="admins">
                <Shield className="mr-2 h-4 w-4" />
                {t('admins')}
              </TabsTrigger>
              <TabsTrigger value="customers">
                <User className="mr-2 h-4 w-4" />
                {t('customers')}
              </TabsTrigger>
              <TabsTrigger value="needKyc">
                <AlertTriangle className="mr-2 h-4 w-4" />
                {t('needKyc')}
              </TabsTrigger>
            </TabsList>
            
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('searchUsers')}
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <TabsContent value="all" className="mt-4">
            <Card>
              <CardContent className="p-0">
                {isLoadingUsers ? (
                  <div className="p-4 space-y-4">
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-64 w-full" />
                  </div>
                ) : (
                  <DataTable
                    data={filteredUsers}
                    columns={userColumns}
                    searchable={false} // We handle search separately
                    pagination
                    pageSize={10}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="admins" className="mt-4">
            <Card>
              <CardContent className="p-0">
                {isLoadingUsers ? (
                  <div className="p-4 space-y-4">
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-64 w-full" />
                  </div>
                ) : (
                  <DataTable
                    data={filteredUsers}
                    columns={userColumns}
                    searchable={false} // We handle search separately
                    pagination
                    pageSize={10}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="customers" className="mt-4">
            <Card>
              <CardContent className="p-0">
                {isLoadingUsers ? (
                  <div className="p-4 space-y-4">
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-64 w-full" />
                  </div>
                ) : (
                  <DataTable
                    data={filteredUsers}
                    columns={userColumns}
                    searchable={false} // We handle search separately
                    pagination
                    pageSize={10}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="needKyc" className="mt-4">
            <Card>
              <CardContent className="p-0">
                {isLoadingUsers ? (
                  <div className="p-4 space-y-4">
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-64 w-full" />
                  </div>
                ) : (
                  <DataTable
                    data={filteredUsers}
                    columns={userColumns}
                    searchable={false} // We handle search separately
                    pagination
                    pageSize={10}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}