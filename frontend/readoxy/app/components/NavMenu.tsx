"use client";
import Link from "next/link";
import { useState } from "react";
import { FaChevronDown, FaSearch } from "react-icons/fa";
import UserProfileIcon from "./home/UserProfileIcon";
import LoginSignupButton from "./home/LoginSignupButton";
import { useUserAuth } from "@/lib/context/UserAuthContext";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const NavMenu = () => {
    const { isAuthenticated } = useUserAuth();
    const [selectedCategory, setSelectedCategory] = useState<string>("");

    const menuItems = [
        { label: "Homepage", options: [], link: "/" },
        {
            label: "Categories",
            options: [
                { name: "Health", link: "/categories/health" },
                { name: "Programming", link: "/categories/programming" },
                { name: "Technology", link: "/categories/technology" },
                { name: "Travels", link: "/categories/travels" },
                { name: "More...", link: "/categories" },
            ],
        },
        { label: "Blogs", options: [], link: "/all/blogs" },
        { label: "Contact", options: [], link: "/contact" },
    ];

    return (
        <div className="flex gap-8">
            
            <div className="items-center space-x-8 hidden md:flex">
                {menuItems.map((menu, index) => (
                    <div key={index} className="relative">
                        {menu.options.length > 0 ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger className="text-lg font-medium flex items-center gap-1">
                                    {menu.label} <FaChevronDown />
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="absolute bg-white shadow-lg mt-2 rounded-lg w-40 flex flex-col z-[1] left-1/2 transform -translate-x-1/2">
                                    {menu.options.map((option, i) => (
                                        <DropdownMenuItem key={i}>
                                            <Link
                                                href={option.link ?? "#"}
                                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 text-left w-full"
                                                onClick={() =>
                                                    setSelectedCategory(
                                                        option.name
                                                    )
                                                }
                                            >
                                                {option.name}
                                            </Link>
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <Link
                                href={menu.link ?? "#"}
                                className="text-lg font-medium"
                            >
                                {menu.label}
                            </Link>
                        )}
                    </div>
                ))}
                <Link href={`/pro`} className="text-lg font-medium">
                    Pro
                </Link>
            </div>
            <div>
                {isAuthenticated ? <UserProfileIcon /> : <LoginSignupButton />}
            </div>
        </div>
    );
};

export default NavMenu;
