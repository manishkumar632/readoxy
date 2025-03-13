"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LogOut, Users, Shield, Menu, X, UserCircle } from "lucide-react";
import { toast } from "sonner";

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // Prevent hydration errors
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Check if user is logged in as super admin
  useEffect(() => {
    if (isClient) {
      const token = localStorage.getItem("superAdminToken");
      const role = localStorage.getItem("userRole");
      const isAuthRoute =
        pathname.includes("/dashboard") ||
        pathname.includes("/admins") ||
        pathname.includes("/profile");

      if (!token || role !== "superadmin") {
        // Only redirect if trying to access authenticated routes
        if (isAuthRoute) {
          router.push("/superadmin/login");
        }
      }
    }
  }, [isClient, pathname, router]);

  // List of public routes that don't need the admin layout
  const publicRoutes = [
    "/superadmin/login",
    "/superadmin/reset-password",
    "/superadmin/forgot-password",
  ];

  // If not on client yet, or on public routes, just render children
  if (!isClient || publicRoutes.includes(pathname)) {
    return <>{children}</>;
  }

  const handleLogout = () => {
    localStorage.removeItem("superAdminToken");
    localStorage.removeItem("superAdminUsername");
    localStorage.removeItem("userRole");
    toast.success("Logged out successfully");
    router.push("/superadmin/login");
  };

  const navItems = [
    {
      title: "Dashboard",
      href: "/superadmin/dashboard",
      icon: <Shield className="h-5 w-5" />,
    },
    {
      title: "Admin Management",
      href: "/superadmin/admins",
      icon: <Users className="h-5 w-5" />,
    },
    {
      title: "Profile",
      href: "/superadmin/profile",
      icon: <UserCircle className="h-5 w-5" />,
    },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Mobile sidebar toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        {isSidebarOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <Menu className="h-6 w-6" />
        )}
      </Button>

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 transform bg-white shadow-lg transition-transform duration-200 ease-in-out md:relative md:translate-x-0",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Sidebar header */}
          <div className="flex h-16 items-center border-b px-6">
            <h2 className="text-xl font-bold text-gray-800">Super Admin</h2>
          </div>

          {/* Sidebar content */}
          <div className="flex-1 overflow-auto py-4">
            <nav className="space-y-1 px-3">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center rounded-md px-3 py-2 text-sm font-medium",
                    pathname === item.href
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.title}
                </Link>
              ))}
            </nav>
          </div>

          {/* Sidebar footer */}
          <div className="border-t p-4">
            <div className="mb-2 text-sm font-medium text-gray-500">
              Logged in as{" "}
              <span className="font-semibold">
                {localStorage.getItem("superAdminUsername")}
              </span>
            </div>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Main content header */}
        <header className="bg-white shadow">
          <div className="px-4 py-6 sm:px-6">
            <h1 className="text-2xl font-bold text-gray-900">
              {navItems.find((item) => item.href === pathname)?.title ||
                "Super Admin"}
            </h1>
          </div>
        </header>

        {/* Main content body */}
        <main className="flex-1 overflow-auto bg-gray-50 p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
