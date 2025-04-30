import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Login from "@/pages/login";
import Accounts from "@/pages/accounts";
import Transfers from "@/pages/transfers";
import Crypto from "@/pages/crypto";
import DpsFdr from "@/pages/dps-fdr";
import Loans from "@/pages/loans";
import Layout from "@/components/layout/layout";
import { useAuth } from "@/hooks/use-auth";
import { useEffect } from "react";

function Router() {
  const { isAuthenticated, checkAuth } = useAuth();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    // Check authentication status when app loads
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    // Redirect to login if not authenticated and not already on login page
    if (!isAuthenticated && location !== "/login") {
      setLocation("/login");
    }
  }, [isAuthenticated, location, setLocation]);

  return (
    <Switch>
      <Route path="/login" component={Login} />

      {/* Protected routes that require authentication */}
      {isAuthenticated && (
        <>
          <Route path="/">
            {() => (
              <Layout>
                <Dashboard />
              </Layout>
            )}
          </Route>

          <Route path="/accounts">
            {() => (
              <Layout>
                <Accounts />
              </Layout>
            )}
          </Route>

          <Route path="/transfers">
            {() => (
              <Layout>
                <Transfers />
              </Layout>
            )}
          </Route>

          <Route path="/crypto">
            {() => (
              <Layout>
                <Crypto />
              </Layout>
            )}
          </Route>

          <Route path="/dps-fdr">
            {() => (
              <Layout>
                <DpsFdr />
              </Layout>
            )}
          </Route>

          <Route path="/loans">
            {() => (
              <Layout>
                <Loans />
              </Layout>
            )}
          </Route>
          
          {/* Additional routes will be added as their components are developed */}
        </>
      )}

      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
