"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";

type User = {
  id: string;
  username: string;
  email: string;
};

type UserAuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  register: (username: string, email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  loginUser: (usernameOrEmail: string, password: string) => Promise<{ success: boolean; message?: string }>;
};

const UserAuthContext = createContext<UserAuthContextType | undefined>(undefined);

export const UserAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in on initial load
    const token = localStorage.getItem("userToken");
    const userData = localStorage.getItem("userData");

    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Error parsing user data:", error);
        localStorage.removeItem("userToken");
        localStorage.removeItem("userData");
      }
    }

    setLoading(false);
  }, []);

  const login = (token: string, userData: any) => {
    // Ensure userData has the expected structure
    const formattedUser: User = {
      id: userData._id || userData.id || '',
      username: userData.username || '',
      email: userData.email || ''
    };
    
    localStorage.setItem("userToken", token);
    localStorage.setItem("userData", JSON.stringify(formattedUser));
    setUser(formattedUser);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem("userToken");
    localStorage.removeItem("userData");
    setUser(null);
    setIsAuthenticated(false);
    router.push("/login");
  };

  const register = async (username: string, email: string, password: string) => {
    try {
      const response = await fetch("http://localhost:5000/api/user/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        login(data.token, data.user);
        return { success: true };
      } else {
        return { success: false, message: data.message || "Registration failed" };
      }
    } catch (error) {
      console.error("Registration error:", error);
      return { success: false, message: "An error occurred during registration" };
    }
  };

  const loginUser = async (usernameOrEmail: string, password: string) => {
    try {
      console.log("Login attempt with:", { usernameOrEmail, password });
      
      const response = await fetch("http://localhost:5000/api/user/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: usernameOrEmail, password }),
      });

      const data = await response.json();
      console.log("Login response:", { status: response.status, data });

      if (response.ok) {
        console.log("Login successful, storing user data");
        login(data.token, data.user);
        return { success: true };
      } else {
        console.log("Login failed:", data.message);
        return { success: false, message: data.message || "Login failed" };
      }
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, message: "An error occurred during login" };
    }
  };

  return (
    <UserAuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        login,
        logout,
        register,
        loginUser,
      }}
    >
      {children}
    </UserAuthContext.Provider>
  );
};

export const useUserAuth = () => {
  const context = useContext(UserAuthContext);
  if (context === undefined) {
    throw new Error("useUserAuth must be used within a UserAuthProvider");
  }
  return context;
}; 