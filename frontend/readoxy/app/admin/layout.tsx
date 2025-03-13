"use client";
import Sidebar from "@/app/components/admin/Sidebar";
import { AuthProvider } from "@/lib/context/AuthContext";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Layout({
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>) {
    const pathname = usePathname();
    const router = useRouter();
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        
        // Skip auth check for login page
        if (pathname === "/admin/login") {
            return;
        }

        // Check if user is authenticated
        const token = localStorage.getItem("adminToken");
        if (!token) {
            router.push("/admin/login");
        }
    }, [pathname, router]);

    // Don't render anything on the server for protected routes
    if (!isClient) {
        return null;
    }

    // Don't show sidebar on login page
    const isLoginPage = pathname === "/admin/login";

    return (
        <AuthProvider>
            <div className="flex">
                {!isLoginPage && <Sidebar />}
                <main className={isLoginPage ? "w-full" : "flex-1"}>
                    {children}
                </main>
            </div>
        </AuthProvider>
    );
}