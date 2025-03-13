"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function LoginSignupButton() {
    return (
        <div className="flex items-center gap-4">
            <Button variant="ghost" asChild>
                <Link href="/auth/login">Log in</Link>
            </Button>
            <Button asChild>
                <Link href="/auth/signup">Sign up</Link>
            </Button>
        </div>
    );
}
