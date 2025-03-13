"use client";

import { Toaster } from "sonner";
import NavMenu from "@/app/components/NavMenu";
import { UserAuthProvider } from "@/lib/context/UserAuthContext";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <UserAuthProvider>
      {/* <NavMenu /> */}
      <main>{children}</main>
      <Toaster position="top-right" />
    </UserAuthProvider>
  );
} 