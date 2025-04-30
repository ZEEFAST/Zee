import { createContext, useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";

type User = {
  id: number;
  username: string;
  email: string;
  fullName: string;
  role: string;
  language: string;
  isRtl: boolean;
  isDarkMode: boolean;
  kycStatus?: string;
  rank?: string;
  rewardPoints?: number;
};

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (userData: any) => Promise<void>;
  checkAuth: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isAdmin: false,
  isLoading: true,
  login: async () => {},
  logout: async () => {},
  register: async () => {},
  checkAuth: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const [_, setLocation] = useLocation();

  const checkAuth = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/user", {
        credentials: "include",
      });

      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Auth check error:", error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (username: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await apiRequest("POST", "/api/auth/login", { username, password });
      const userData = await res.json();
      setUser(userData);
      toast({
        title: "Login Successful",
        description: `Welcome back, ${userData.fullName}!`,
      });
      setLocation("/");
    } catch (error) {
      console.error("Login error:", error);
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: error instanceof Error ? error.message : "Invalid username or password",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await apiRequest("POST", "/api/auth/logout");
      setUser(null);
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
      setLocation("/login");
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        variant: "destructive",
        title: "Logout Failed",
        description: "There was an issue logging you out. Please try again.",
      });
    }
  };

  const register = async (userData: any) => {
    setIsLoading(true);
    try {
      const res = await apiRequest("POST", "/api/auth/register", userData);
      toast({
        title: "Registration Successful",
        description: "Your account has been created. You can now log in.",
      });
      setLocation("/login");
    } catch (error) {
      console.error("Registration error:", error);
      toast({
        variant: "destructive",
        title: "Registration Failed",
        description: error instanceof Error ? error.message : "Could not create account. Please try again.",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const isAdmin = user?.role === "admin";
  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isAdmin,
        isLoading,
        login,
        logout,
        register,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
