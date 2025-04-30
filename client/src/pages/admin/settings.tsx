import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/use-language";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { 
  Settings as SettingsIcon,
  Globe, 
  PaintBucket,
  Bell,
  Shield,
  CreditCard,
  CheckCircle,
  Save
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

export default function AdminSettings() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("general");
  
  // Fetch settings
  const { data: settings, isLoading: isLoadingSettings } = useQuery({
    queryKey: ['/api/admin/settings'],
  });

  // Update settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("PATCH", "/api/admin/settings", data);
    },
    onSuccess: () => {
      toast({
        title: t('settingsSaved'),
        description: t('settingsSavedDescription'),
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/settings'] });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: t('settingsSaveFailed'),
        description: error instanceof Error ? error.message : t('settingsSaveFailedDescription'),
      });
    }
  });

  // General settings form schema
  const generalSettingsSchema = z.object({
    siteName: z.string().min(1, "Site name is required"),
    siteDescription: z.string(),
    supportEmail: z.string().email("Invalid email address"),
    contactPhone: z.string(),
    maintenanceMode: z.boolean().default(false),
    allowRegistration: z.boolean().default(true),
  });

  // Appearance settings form schema
  const appearanceSettingsSchema = z.object({
    logoUrl: z.string().url("Must be a valid URL").or(z.string().length(0)),
    faviconUrl: z.string().url("Must be a valid URL").or(z.string().length(0)),
    primaryColor: z.string(),
    secondaryColor: z.string(),
    defaultTheme: z.enum(["light", "dark", "system"]),
  });

  // Notification settings form schema
  const notificationSettingsSchema = z.object({
    enableEmailNotifications: z.boolean().default(true),
    enablePushNotifications: z.boolean().default(true),
    enableSmsNotifications: z.boolean().default(false),
    adminEmailNotifications: z.boolean().default(true),
    dailyReportEmail: z.boolean().default(true),
  });

  // Security settings form schema
  const securitySettingsSchema = z.object({
    forceKycVerification: z.boolean().default(true),
    enable2FA: z.boolean().default(true),
    sessionTimeoutMinutes: z.number().min(5).max(1440),
    passwordPolicyMinLength: z.number().min(6).max(30),
    passwordPolicyRequireSpecialChar: z.boolean().default(true),
    passwordPolicyRequireNumber: z.boolean().default(true),
  });

  // Form setup for each tab
  const generalForm = useForm<z.infer<typeof generalSettingsSchema>>({
    resolver: zodResolver(generalSettingsSchema),
    defaultValues: {
      siteName: "",
      siteDescription: "",
      supportEmail: "",
      contactPhone: "",
      maintenanceMode: false,
      allowRegistration: true,
    },
  });

  const appearanceForm = useForm<z.infer<typeof appearanceSettingsSchema>>({
    resolver: zodResolver(appearanceSettingsSchema),
    defaultValues: {
      logoUrl: "",
      faviconUrl: "",
      primaryColor: "#6366F1",
      secondaryColor: "#4F46E5",
      defaultTheme: "system",
    },
  });

  const notificationForm = useForm<z.infer<typeof notificationSettingsSchema>>({
    resolver: zodResolver(notificationSettingsSchema),
    defaultValues: {
      enableEmailNotifications: true,
      enablePushNotifications: true,
      enableSmsNotifications: false,
      adminEmailNotifications: true,
      dailyReportEmail: true,
    },
  });

  const securityForm = useForm<z.infer<typeof securitySettingsSchema>>({
    resolver: zodResolver(securitySettingsSchema),
    defaultValues: {
      forceKycVerification: true,
      enable2FA: true,
      sessionTimeoutMinutes: 60,
      passwordPolicyMinLength: 8,
      passwordPolicyRequireSpecialChar: true,
      passwordPolicyRequireNumber: true,
    },
  });

  // Update form defaults when settings are loaded
  React.useEffect(() => {
    if (settings) {
      if (settings.general) {
        generalForm.reset(settings.general);
      }
      if (settings.appearance) {
        appearanceForm.reset(settings.appearance);
      }
      if (settings.notifications) {
        notificationForm.reset(settings.notifications);
      }
      if (settings.security) {
        securityForm.reset(settings.security);
      }
    }
  }, [settings]);

  // Handle form submissions
  const onGeneralSubmit = (data: z.infer<typeof generalSettingsSchema>) => {
    updateSettingsMutation.mutate({ general: data });
  };

  const onAppearanceSubmit = (data: z.infer<typeof appearanceSettingsSchema>) => {
    updateSettingsMutation.mutate({ appearance: data });
  };

  const onNotificationSubmit = (data: z.infer<typeof notificationSettingsSchema>) => {
    updateSettingsMutation.mutate({ notifications: data });
  };

  const onSecuritySubmit = (data: z.infer<typeof securitySettingsSchema>) => {
    updateSettingsMutation.mutate({ security: data });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white font-heading">
          {t('systemSettings')}
        </h1>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="general">
            <SettingsIcon className="mr-2 h-4 w-4" />
            {t('general')}
          </TabsTrigger>
          <TabsTrigger value="appearance">
            <PaintBucket className="mr-2 h-4 w-4" />
            {t('appearance')}
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="mr-2 h-4 w-4" />
            {t('notifications')}
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="mr-2 h-4 w-4" />
            {t('security')}
          </TabsTrigger>
          <TabsTrigger value="payments">
            <CreditCard className="mr-2 h-4 w-4" />
            {t('payments')}
          </TabsTrigger>
        </TabsList>
        
        {/* General Settings */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>{t('generalSettings')}</CardTitle>
              <CardDescription>{t('generalSettingsDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingSettings ? (
                <div className="space-y-4">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                </div>
              ) : (
                <Form {...generalForm}>
                  <form onSubmit={generalForm.handleSubmit(onGeneralSubmit)} className="space-y-4">
                    <FormField
                      control={generalForm.control}
                      name="siteName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('siteName')}</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormDescription>{t('siteNameDescription')}</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={generalForm.control}
                      name="siteDescription"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('siteDescription')}</FormLabel>
                          <FormControl>
                            <Textarea {...field} />
                          </FormControl>
                          <FormDescription>{t('siteDescriptionHelp')}</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={generalForm.control}
                        name="supportEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('supportEmail')}</FormLabel>
                            <FormControl>
                              <Input type="email" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={generalForm.control}
                        name="contactPhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('contactPhone')}</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={generalForm.control}
                        name="maintenanceMode"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between p-4 border rounded-md">
                            <div className="space-y-0">
                              <FormLabel>{t('maintenanceMode')}</FormLabel>
                              <FormDescription>{t('maintenanceModeDescription')}</FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={generalForm.control}
                        name="allowRegistration"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between p-4 border rounded-md">
                            <div className="space-y-0">
                              <FormLabel>{t('allowRegistration')}</FormLabel>
                              <FormDescription>{t('allowRegistrationDescription')}</FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="mt-4"
                      disabled={updateSettingsMutation.isPending}
                    >
                      <Save className="mr-2 h-4 w-4" />
                      {updateSettingsMutation.isPending ? t('saving') : t('saveChanges')}
                    </Button>
                  </form>
                </Form>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Appearance Settings */}
        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>{t('appearanceSettings')}</CardTitle>
              <CardDescription>{t('appearanceSettingsDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingSettings ? (
                <div className="space-y-4">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                </div>
              ) : (
                <Form {...appearanceForm}>
                  <form onSubmit={appearanceForm.handleSubmit(onAppearanceSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={appearanceForm.control}
                        name="logoUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('logoUrl')}</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormDescription>{t('logoUrlDescription')}</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={appearanceForm.control}
                        name="faviconUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('faviconUrl')}</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormDescription>{t('faviconUrlDescription')}</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={appearanceForm.control}
                        name="primaryColor"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('primaryColor')}</FormLabel>
                            <div className="flex space-x-2">
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <Input 
                                type="color" 
                                value={field.value} 
                                onChange={field.onChange}
                                className="w-12 p-1 h-10"
                              />
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={appearanceForm.control}
                        name="secondaryColor"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('secondaryColor')}</FormLabel>
                            <div className="flex space-x-2">
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <Input 
                                type="color" 
                                value={field.value} 
                                onChange={field.onChange}
                                className="w-12 p-1 h-10"
                              />
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={appearanceForm.control}
                      name="defaultTheme"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('defaultTheme')}</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={t('selectDefaultTheme')} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="light">{t('lightTheme')}</SelectItem>
                              <SelectItem value="dark">{t('darkTheme')}</SelectItem>
                              <SelectItem value="system">{t('systemTheme')}</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>{t('defaultThemeDescription')}</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button 
                      type="submit" 
                      className="mt-4"
                      disabled={updateSettingsMutation.isPending}
                    >
                      <Save className="mr-2 h-4 w-4" />
                      {updateSettingsMutation.isPending ? t('saving') : t('saveChanges')}
                    </Button>
                  </form>
                </Form>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Notification Settings */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>{t('notificationSettings')}</CardTitle>
              <CardDescription>{t('notificationSettingsDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingSettings ? (
                <div className="space-y-4">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                </div>
              ) : (
                <Form {...notificationForm}>
                  <form onSubmit={notificationForm.handleSubmit(onNotificationSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={notificationForm.control}
                        name="enableEmailNotifications"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between p-4 border rounded-md">
                            <div className="space-y-0">
                              <FormLabel>{t('enableEmailNotifications')}</FormLabel>
                              <FormDescription>{t('enableEmailNotificationsDescription')}</FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={notificationForm.control}
                        name="enablePushNotifications"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between p-4 border rounded-md">
                            <div className="space-y-0">
                              <FormLabel>{t('enablePushNotifications')}</FormLabel>
                              <FormDescription>{t('enablePushNotificationsDescription')}</FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={notificationForm.control}
                        name="enableSmsNotifications"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between p-4 border rounded-md">
                            <div className="space-y-0">
                              <FormLabel>{t('enableSmsNotifications')}</FormLabel>
                              <FormDescription>{t('enableSmsNotificationsDescription')}</FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={notificationForm.control}
                        name="adminEmailNotifications"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between p-4 border rounded-md">
                            <div className="space-y-0">
                              <FormLabel>{t('adminEmailNotifications')}</FormLabel>
                              <FormDescription>{t('adminEmailNotificationsDescription')}</FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={notificationForm.control}
                      name="dailyReportEmail"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between p-4 border rounded-md">
                          <div className="space-y-0">
                            <FormLabel>{t('dailyReportEmail')}</FormLabel>
                            <FormDescription>{t('dailyReportEmailDescription')}</FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button 
                      type="submit" 
                      className="mt-4"
                      disabled={updateSettingsMutation.isPending}
                    >
                      <Save className="mr-2 h-4 w-4" />
                      {updateSettingsMutation.isPending ? t('saving') : t('saveChanges')}
                    </Button>
                  </form>
                </Form>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Security Settings */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>{t('securitySettings')}</CardTitle>
              <CardDescription>{t('securitySettingsDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingSettings ? (
                <div className="space-y-4">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                </div>
              ) : (
                <Form {...securityForm}>
                  <form onSubmit={securityForm.handleSubmit(onSecuritySubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={securityForm.control}
                        name="forceKycVerification"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between p-4 border rounded-md">
                            <div className="space-y-0">
                              <FormLabel>{t('forceKycVerification')}</FormLabel>
                              <FormDescription>{t('forceKycVerificationDescription')}</FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={securityForm.control}
                        name="enable2FA"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between p-4 border rounded-md">
                            <div className="space-y-0">
                              <FormLabel>{t('enable2FA')}</FormLabel>
                              <FormDescription>{t('enable2FADescription')}</FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={securityForm.control}
                        name="sessionTimeoutMinutes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('sessionTimeout')}</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                min={5} 
                                max={1440} 
                                {...field} 
                                onChange={(e) => field.onChange(parseInt(e.target.value))} 
                              />
                            </FormControl>
                            <FormDescription>{t('sessionTimeoutDescription')}</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={securityForm.control}
                        name="passwordPolicyMinLength"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('passwordMinLength')}</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                min={6} 
                                max={30}
                                {...field} 
                                onChange={(e) => field.onChange(parseInt(e.target.value))} 
                              />
                            </FormControl>
                            <FormDescription>{t('passwordMinLengthDescription')}</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={securityForm.control}
                        name="passwordPolicyRequireSpecialChar"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between p-4 border rounded-md">
                            <div className="space-y-0">
                              <FormLabel>{t('requireSpecialChar')}</FormLabel>
                              <FormDescription>{t('requireSpecialCharDescription')}</FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={securityForm.control}
                        name="passwordPolicyRequireNumber"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between p-4 border rounded-md">
                            <div className="space-y-0">
                              <FormLabel>{t('requireNumber')}</FormLabel>
                              <FormDescription>{t('requireNumberDescription')}</FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="mt-4"
                      disabled={updateSettingsMutation.isPending}
                    >
                      <Save className="mr-2 h-4 w-4" />
                      {updateSettingsMutation.isPending ? t('saving') : t('saveChanges')}
                    </Button>
                  </form>
                </Form>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Payment Settings */}
        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <CardTitle>{t('paymentSettings')}</CardTitle>
              <CardDescription>{t('paymentSettingsDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-8">
                <Shield className="h-12 w-12 text-muted-foreground mb-2" />
                <p className="text-muted-foreground">{t('paymentSettingsComingSoon')}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}