import React from "react";

const Page = () => {
    return (
        <div className="max-w-7xl m-auto flex justify-between items-center p-6">
            <div>
                <p className="text-sm text-gray-500">Pages / Dashboard</p>
                <h1 className="text-3xl font-bold text-blue-900">Main Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4 bg-white p-2 rounded-full shadow-md">
                <div className="relative">
                    <input
                        className="bg-gray-100 rounded-full pl-10 pr-4 py-2 text-sm focus:outline-none"
                        placeholder="Search"
                        type="text"
                    />
                    <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                </div>
                <i className="fas fa-bell text-gray-400"></i>
                <i className="fas fa-moon text-gray-400"></i>
                <i className="fas fa-info-circle text-gray-400"></i>
                <img
                    alt="User profile picture"
                    className="w-10 h-10 rounded-full"
                    height="40"
                    src="https://storage.googleapis.com/a1aa/image/zBV9WQ-IdmbaK85Ny_4IABCtn3cwk_D-cF7GzxnZjeA.jpg"
                    width="40"
                />
            </div>
        </div>
    );
};

export default Page;
