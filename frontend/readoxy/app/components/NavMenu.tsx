"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FaChevronDown, FaSearch } from "react-icons/fa";
import UserProfileIcon from "./home/UserProfileIcon";
import LoginSignupButton from "./home/LoginSignupButton";

const NavMenu = () => {
    const [openDropdown, setOpenDropdown] = useState<number | null>(null);
    const [showOptions, setShowOptions] = useState(false);
    const [userLoggedIn, setUserLoggedIn] = useState<boolean>(true);
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
        { label: "Blogs", options: [], link: "/blogs" },
        { label: "Contact", options: [], link: "/contact" },
    ];

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (!(event.target as HTMLElement).closest(".dropdown-menu")) {
                setShowOptions(false);
                setOpenDropdown(null);
            }
        };
        document.addEventListener("click", handleClickOutside);
        return () => {
            document.removeEventListener("click", handleClickOutside);
        };
    }, []);

    return (
        <div className="flex gap-8">
            <div className="items-center space-x-8 hidden md:flex">
                {menuItems.map((menu, index) => (
                    <div
                        key={index}
                        className="relative dropdown-menu"
                        onMouseEnter={() => {
                            setOpenDropdown(index);
                            setShowOptions(true);
                        }}
                    >
                        {menu.options.length > 0 ? (
                            <>
                                <button className="text-lg font-medium flex items-center gap-1">
                                    {menu.label} <FaChevronDown />
                                </button>
                                {openDropdown === index && showOptions && (
                                    <div className="absolute bg-white shadow-lg mt-2 rounded-lg w-40 flex flex-col z-[1]">
                                        {menu.options.map((option, i) => (
                                            <Link
												href={option.link ?? "#"}
                                                key={i}
                                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 text-left w-full"
                                                onClick={() =>
                                                    setSelectedCategory(
                                                        option.name
                                                    )
                                                }
                                            >
                                                {option.name}
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </>
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
                <Link href={`#`} className="text-lg font-medium">
                    Pro
                </Link>
            </div>
            <div>
                {userLoggedIn ? <UserProfileIcon /> : <LoginSignupButton />}
            </div>
        </div>
    );
};

export default NavMenu;
