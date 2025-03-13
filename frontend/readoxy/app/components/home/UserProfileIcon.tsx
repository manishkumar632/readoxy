"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogOut, User, Settings, BookOpen } from "lucide-react";
import { useUserAuth } from "@/lib/context/UserAuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

export default function UserProfileIcon() {
    const { user, logout } = useUserAuth();
    const router = useRouter();
    const [profileImage, setProfileImage] = useState<string | null>(null);

    useEffect(() => {
        // Fetch user profile to get profile image
        const fetchUserProfile = async () => {
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
        };
        
        fetchUserProfile();
    }, []);

    const handleLogout = () => {
        logout();
        toast.success("Logged out successfully");
        router.push("/");
        router.refresh();
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger className="focus:outline-none">
                <Avatar className="h-8 w-8">
                    {profileImage ? (
                        <AvatarImage src={profileImage} alt={user?.username} />
                    ) : (
                        <AvatarFallback className="bg-blue-100 text-blue-800">
                            {user?.username?.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                    )}
                </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
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
    );
}
