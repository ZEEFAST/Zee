import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/hooks/use-language";
import { useAuth } from "@/hooks/use-auth";
import {
  LayoutDashboard,
  CreditCard,
  ArrowLeftRight,
  TrendingUp,
  Clock,
  Landmark,
  Receipt,
  LifeBuoy,
  Settings,
  UserCog
} from "lucide-react";

type SidebarProps = {
  isOpen: boolean;
  closeSidebar?: () => void;
};

export function Sidebar({ isOpen, closeSidebar }: SidebarProps) {
  const { t, isRtl } = useLanguage();
  const { isAdmin } = useAuth();
  const [location] = useLocation();

  // Sidebar navigation links
  const navItems = [
    {
      href: "/",
      label: t('dashboard'),
      icon: <LayoutDashboard className="mr-3 h-6 w-6 rtl-mirror" />,
    },
    {
      href: "/accounts",
      label: t('accounts'),
      icon: <CreditCard className="mr-3 h-6 w-6 rtl-mirror" />,
    },
    {
      href: "/transfers",
      label: t('transfers'),
      icon: <ArrowLeftRight className="mr-3 h-6 w-6 rtl-mirror" />,
    },
    {
      href: "/crypto",
      label: t('crypto'),
      icon: <TrendingUp className="mr-3 h-6 w-6 rtl-mirror" />,
    },
    {
      href: "/dps-fdr",
      label: t('dpsFdr'),
      icon: <Clock className="mr-3 h-6 w-6 rtl-mirror" />,
    },
    {
      href: "/loans",
      label: t('loans'),
      icon: <Landmark className="mr-3 h-6 w-6 rtl-mirror" />,
    },
    {
      href: "/bill-pay",
      label: t('billPay'),
      icon: <Receipt className="mr-3 h-6 w-6 rtl-mirror" />,
    },
    {
      href: "/support",
      label: t('support'),
      icon: <LifeBuoy className="mr-3 h-6 w-6 rtl-mirror" />,
    },
    {
      href: "/settings",
      label: t('settings'),
      icon: <Settings className="mr-3 h-6 w-6 rtl-mirror" />,
    },
  ];

  return (
    <div className={cn(
      "flex md:flex-shrink-0 transition-all duration-300",
      isOpen ? "block fixed inset-0 z-40 md:relative md:block" : "hidden md:block"
    )}>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-75 md:hidden" 
          aria-hidden="true"
          onClick={closeSidebar}
        ></div>
      )}
      
      <div className={cn(
        "flex flex-col w-64 relative",
        isRtl ? "md:border-l" : "md:border-r",
        "border-gray-200 dark:border-gray-700"
      )}>
        <div className="flex flex-col h-0 flex-1 bg-white dark:bg-dark-800">
          {/* Logo and brand */}
          <div className="flex items-center h-16 flex-shrink-0 px-4 bg-primary-800 dark:bg-primary-900">
            <Link href="/">
              <div className="flex items-center cursor-pointer">
                <svg className="h-8 w-8 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M16 12L12 8L8 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 16V8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className="ml-2 text-white text-lg font-heading font-semibold">NexusBank</span>
              </div>
            </Link>
          </div>
          
          {/* Navigation links */}
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <nav className="mt-5 flex-1 px-2 space-y-1">
              {navItems.map((item) => (
                <Link 
                  key={item.href}
                  href={item.href}
                  onClick={() => closeSidebar && closeSidebar()}
                >
                  <a
                    className={cn(
                      "group flex items-center px-2 py-2 text-base font-medium rounded-md",
                      item.href === location || 
                      (item.href !== '/' && location.startsWith(item.href))
                        ? "bg-primary-100 dark:bg-primary-800 text-primary-800 dark:text-white"
                        : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    )}
                  >
                    {item.icon}
                    {item.label}
                  </a>
                </Link>
              ))}
            </nav>
            
            {/* Admin link (only for admin users) */}
            {isAdmin && (
              <div className="mt-auto">
                <div className="mt-2 px-3">
                  <div className="px-2 space-y-1">
                    <Link 
                      href="/admin"
                      onClick={() => closeSidebar && closeSidebar()}
                    >
                      <a className={cn(
                        "group flex items-center px-2 py-2 text-sm font-medium rounded-md",
                        location.startsWith("/admin")
                          ? "bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-100"
                          : "bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-200/70 hover:bg-yellow-100 dark:hover:bg-yellow-800/40"
                      )}>
                        <UserCog className="mr-3 h-6 w-6 text-yellow-600 dark:text-yellow-300 rtl-mirror" />
                        {t('adminPanel')}
                      </a>
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
