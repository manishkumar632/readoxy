'use client';
import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";

const Sidebar = () => {
    const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
    const [isQuizOpen, setIsQuizOpen] = useState(false);
    const currentPath = usePathname();

    const toggleCategories = () => setIsCategoriesOpen(!isCategoriesOpen);
    const toggleQuiz = () => setIsQuizOpen(!isQuizOpen);
    const isActive = (path: string) => currentPath === path ? 'text-blue-700' : 'text-gray-400';

    return (
        <div className="flex flex-col p-4 space-y-6">
            <Link href="/admin">
                <div className={`flex items-center space-x-3 cursor-pointer transition duration-300 ease-in-out transform hover:scale-105 ${isActive('/admin')}`}>
                    <i className="fas fa-home"></i>
                    <span className="text-lg font-bold">Dashboard</span>
                </div>
            </Link>
            <div className="flex flex-col">
                <div className="flex items-center space-x-3 cursor-pointer transition duration-300 ease-in-out transform hover:scale-105 hover:text-gray-600" onClick={toggleQuiz}>
                    <i className="fas fa-question-circle text-gray-400"></i>
                    <span className="text-lg text-gray-400">Quiz</span>
                </div>
                <div className={`pl-4 transition-all duration-300 ease-in-out ${isQuizOpen ? 'max-h-fit opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                    <Link href="/admin/quiz/servicenow">
                        <div className={`flex items-center space-x-3 cursor-pointer transition duration-300 ease-in-out transform hover:scale-105 ${isActive('/admin/quiz/servicenow')}`}>
                            <i className="fas fa-angle-right text-gray-400"></i>
                            <span className="text-lg text-gray-400">ServiceNow</span>
                        </div>
                    </Link>
                    <Link href="/admin/quiz/java">
                        <div className={`flex items-center space-x-3 cursor-pointer transition duration-300 ease-in-out transform hover:scale-105 ${isActive('/admin/quiz/java')}`}>
                            <i className="fas fa-angle-right text-gray-400"></i>
                            <span className="text-lg text-gray-400">Java</span>
                        </div>
                    </Link>
                    <Link href="/admin/quiz/python">
                        <div className={`flex items-center space-x-3 cursor-pointer transition duration-300 ease-in-out transform hover:scale-105 ${isActive('/admin/quiz/python')}`}>
                            <i className="fas fa-angle-right text-gray-400"></i>
                            <span className="text-lg text-gray-400">Python</span>
                        </div>
                    </Link>
                </div>
            </div>
            <div className="flex flex-col">
                <div className="flex items-center space-x-3 cursor-pointer transition duration-300 ease-in-out transform hover:scale-105 hover:text-gray-600" onClick={toggleCategories}>
                    <i className="fas fa-list text-gray-400"></i>
                    <span className="text-lg text-gray-400">Categories</span>
                </div>
                <div className={`pl-4 transition-all duration-300 ease-in-out ${isCategoriesOpen ? 'max-h-fit opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                    <Link href="/admin/categories/add">
                        <div className={`flex items-center space-x-3 cursor-pointer transition duration-300 ease-in-out transform hover:scale-105 ${isActive('/admin/categories/add')}`}>
                            <i className="fas fa-plus text-gray-400"></i>
                            <span className="text-lg text-gray-400">Add Categories</span>
                        </div>
                    </Link>
                </div>
            </div>
            <Link href="/admin/courses">
                <div className={`flex items-center space-x-3 transition duration-300 ease-in-out transform hover:scale-105 ${isActive('/admin/courses')}`}>
                    <i className="fas fa-book text-gray-400"></i>
                    <span className="text-lg text-gray-400">Courses</span>
                </div>
            </Link>
            <Link href="/admin/landing-page">
                <div className={`flex items-center space-x-3 transition duration-300 ease-in-out transform hover:scale-105 ${isActive('/admin/landing-page')}`}>
                    <i className="fas fa-globe text-gray-400"></i>
                    <span className="text-lg text-gray-400">Landing Page</span>
                </div>
            </Link>
            <Link href={`${currentPath}/user/profile`}>
                <div className={`flex items-center space-x-3 cursor-pointer transition duration-300 ease-in-out transform hover:scale-105 ${isActive(`${currentPath}/user/profile`)}`}>
                    <i className="fas fa-user text-gray-400"></i>
                    <span className="text-lg text-gray-400">Profile</span>
                </div>
            </Link>
            <Link href="/admin/sign-in">
                <div className={`flex items-center space-x-3 transition duration-300 ease-in-out transform hover:scale-105 ${isActive('/admin/sign-in')}`}>
                    <i className="fas fa-sign-in-alt text-gray-400"></i>
                    <span className="text-lg text-gray-400">Sign In</span>
                </div>
            </Link>
        </div>
    );
};

export default Sidebar;
