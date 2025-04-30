import { useState } from "react";
import { Link } from "wouter";
import { 
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTheme } from "@/components/ui/theme-provider";
import { useLanguage } from "@/hooks/use-language";
import { useAuth } from "@/hooks/use-auth";
import { cn, generateAvatarUrl } from "@/lib/utils";
import { 
  Menu,
  Search,
  Sun,
  Moon,
  Bell,
  LogOut,
  User,
  Settings,
  HelpCircle,
} from "lucide-react";

type HeaderProps = {
  openSidebar: () => void;
};

export function Header({ openSidebar }: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const { t, setLanguage, currentLanguage, availableLanguages, isRtl } = useLanguage();
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement search functionality
    console.log("Search query:", searchQuery);
  };

  return (
    <div className="relative z-10 flex-shrink-0 flex h-16 bg-white dark:bg-dark-800 shadow">
      <button
        type="button"
        className="px-4 text-gray-500 dark:text-gray-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 md:hidden"
        onClick={openSidebar}
      >
        <span className="sr-only">{t('openSidebar')}</span>
        <Menu className="h-6 w-6" />
      </button>
      
      <div className="flex-1 px-4 flex justify-between">
        <div className="flex-1 flex">
          <form className="w-full flex md:ml-0" onSubmit={handleSearch}>
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                className={cn(
                  "block w-full pl-10 pr-3 py-2 rounded-md",
                  isRtl && "text-right pl-3 pr-10"
                )}
                placeholder={t('search')}
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </form>
        </div>
        
        <div className="ml-4 flex items-center md:ml-6 space-x-4">
          {/* Language Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                  <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                  </svg>
                  {currentLanguage.toUpperCase()}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{t('selectLanguage')}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {availableLanguages.map((lang) => (
                <DropdownMenuItem
                  key={lang.code}
                  onClick={() => setLanguage(lang.code)}
                  className="cursor-pointer"
                >
                  <span className={cn("mr-2", currentLanguage === lang.code && "font-bold")}>
                    {lang.name}
                  </span>
                  {lang.isRtl && <span className="text-xs text-gray-500 dark:text-gray-400">(RTL)</span>}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* Theme Toggle */}
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
          
          {/* Notification button */}
          <Button variant="outline" size="icon" className="h-8 w-8 relative">
            <Bell className="h-5 w-5" />
            <span className="notification-dot bg-red-500"></span>
            <span className="sr-only">{t('viewNotifications')}</span>
          </Button>

          {/* Profile dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative flex items-center rounded-full bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <span className="sr-only">{t('openUserMenu')}</span>
                <Avatar className="h-8 w-8">
                  <AvatarImage 
                    src={user ? generateAvatarUrl(user.fullName) : undefined} 
                    alt={user?.fullName || "User"} 
                  />
                  <AvatarFallback>
                    {user?.fullName?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                {user?.fullName || t('account')}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/settings/profile">
                  <div className="flex w-full cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    {t('profile')}
                  </div>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings">
                  <div className="flex w-full cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    {t('settings')}
                  </div>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/support">
                  <div className="flex w-full cursor-pointer">
                    <HelpCircle className="mr-2 h-4 w-4" />
                    {t('help')}
                  </div>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                {t('signOut')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
