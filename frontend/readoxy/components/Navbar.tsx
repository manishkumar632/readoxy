"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, User, Settings, BookOpen, Menu, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useUserAuth } from "@/lib/context/UserAuthContext";

export default function Navbar() {
  const { user, isAuthenticated, loading, logout } = useUserAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();
  const [profileImage, setProfileImage] = useState<string | null>(null);

  useEffect(() => {
    // Fetch user profile to get profile image
    const fetchUserProfile = async () => {
      if (isAuthenticated) {
        try {
          const response = await fetch("http://localhost:5000/api/user/profile", {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("userToken")}`,
            },
          });
          
          if (response.ok) {
            const data = await response.json();
            if (data.profileImage) {
              setProfileImage(data.profileImage);
            }
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
        }
      }
    };
    
    fetchUserProfile();
  }, [isAuthenticated]);

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    router.push("/");
    router.refresh();
  };

  const handleGetQuizCode = async () => {
    if (!isAuthenticated) {
      toast.error("Please log in to get a quiz code", {
        description: "You need to be logged in to request a quiz code",
        action: {
          label: "Log in",
          onClick: () => router.push("/auth/login"),
        },
      });
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/quiz/generate-code", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("userToken")}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to generate quiz code");
      }

      toast.success("Quiz code generated", {
        description: `Your code has been sent to your email. It will expire on ${new Date(data.expiresAt).toLocaleString()}`,
      });
    } catch (error) {
      console.error("Error generating quiz code:", error);
      toast.error("Failed to generate quiz code", {
        description: error instanceof Error ? error.message : "Please try again later",
      });
    }
  };

  const navItems = [
    { name: "Home", href: "/" },
    { name: "Daily Quiz", href: "/daily-quiz" },
    { name: "Leaderboard", href: "/leaderboard" },
    { name: "About", href: "/about" },
  ];

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-xl font-bold text-blue-600">
                Readoxy
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={handleGetQuizCode}
              className="text-sm"
            >
              Get Quiz Code
            </Button>
            
            {!loading && isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      {profileImage ? (
                        <AvatarImage 
                          src={profileImage} 
                          alt={user?.username} 
                        />
                      ) : (
                        <AvatarFallback className="bg-blue-100 text-blue-800">
                          {user?.username?.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      )}
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{user?.username}</p>
                      <p className="text-sm text-gray-500">{user?.email}</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer flex w-full">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/quiz-history" className="cursor-pointer flex w-full">
                      <BookOpen className="mr-2 h-4 w-4" />
                      <span>Quiz History</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="cursor-pointer flex w-full">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="cursor-pointer text-red-600 focus:text-red-600"
                    onClick={handleLogout}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild>
                <Link href="/auth/login">Log in</Link>
              </Button>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            >
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={cn("sm:hidden", isMobileMenuOpen ? "block" : "hidden")}>
        <div className="pt-2 pb-3 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50 hover:border-gray-300"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {item.name}
            </Link>
          ))}
          <div className="pl-3 pr-4 py-2">
            <Button
              variant="outline"
              onClick={handleGetQuizCode}
              className="w-full justify-center text-sm"
            >
              Get Quiz Code
            </Button>
          </div>
          
          {!loading && isAuthenticated ? (
            <>
              <div className="pl-3 pr-4 py-2 border-t border-gray-200">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Avatar className="h-10 w-10">
                      {profileImage ? (
                        <AvatarImage 
                          src={profileImage} 
                          alt={user?.username} 
                        />
                      ) : (
                        <AvatarFallback className="bg-blue-100 text-blue-800">
                          {user?.username?.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      )}
                    </Avatar>
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium text-gray-800">
                      {user?.username}
                    </div>
                    <div className="text-sm font-medium text-gray-500">
                      {user?.email}
                    </div>
                  </div>
                </div>
              </div>
              <Link
                href="/profile"
                className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50 hover:border-gray-300"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Profile
              </Link>
              <Link
                href="/quiz-history"
                className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50 hover:border-gray-300"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Quiz History
              </Link>
              <Link
                href="/settings"
                className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50 hover:border-gray-300"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Settings
              </Link>
              <button
                onClick={() => {
                  handleLogout();
                  setIsMobileMenuOpen(false);
                }}
                className="block w-full text-left pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-red-600 hover:text-red-700 hover:bg-gray-50 hover:border-red-300"
              >
                Log out
              </button>
            </>
          ) : (
            <div className="pl-3 pr-4 py-2">
              <Button
                asChild
                className="w-full justify-center"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Link href="/auth/login">Log in</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
} 