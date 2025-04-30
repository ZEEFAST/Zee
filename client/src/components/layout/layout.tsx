import { useState, useEffect } from "react";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { Toaster } from "@/components/ui/toaster";
import { useLanguage } from "@/hooks/use-language";

type LayoutProps = {
  children: React.ReactNode;
};

export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isRtl } = useLanguage();

  // Close sidebar on window resize if it's open on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && sidebarOpen) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [sidebarOpen]);

  // Apply RTL direction to the document
  useEffect(() => {
    document.documentElement.dir = isRtl ? "rtl" : "ltr";
  }, [isRtl]);

  return (
    <div 
      className="flex h-screen overflow-hidden bg-gray-50 dark:bg-dark-900 text-gray-800 dark:text-gray-200 transition-colors duration-200"
      dir={isRtl ? "rtl" : "ltr"}
    >
      {/* Sidebar component */}
      <Sidebar isOpen={sidebarOpen} closeSidebar={() => setSidebarOpen(false)} />
      
      {/* Main content area */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        <Header openSidebar={() => setSidebarOpen(true)} />
        
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
      
      <Toaster />
    </div>
  );
}
