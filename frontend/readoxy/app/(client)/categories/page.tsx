import React from "react";

const categories = [
    {
        name: "Design",
        iconClass: "fas fa-pencil-alt",
        bgColor: "bg-purple-100",
        textColor: "text-purple-500",
        description: "Learn Adobe Illustrator CC graphic design, logo design, and more with this in-depth, practical, easy-",
    },
    {
        name: "Development",
        iconClass: "fas fa-laptop-code",
        bgColor: "bg-orange-100",
        textColor: "text-orange-500",
        description: "Learn Adobe Illustrator CC graphic design, logo design, and more with this in-depth, practical, easy-",
    },
    {
        name: "IT & Software",
        iconClass: "fas fa-network-wired",
        bgColor: "bg-blue-100",
        textColor: "text-blue-500",
        description: "Learn Adobe Illustrator CC graphic design, logo design, and more with this in-depth, practical, easy-",
    },
    {
        name: "Business",
        iconClass: "fas fa-briefcase",
        bgColor: "bg-green-100",
        textColor: "text-green-500",
        description: "Learn Adobe Illustrator CC graphic design, logo design, and more with this in-depth, practical, easy-",
    },
    {
        name: "Marketing",
        iconClass: "fas fa-bullhorn",
        bgColor: "bg-green-200",
        textColor: "text-green-600",
        description: "Learn Adobe Illustrator CC graphic design, logo design, and more with this in-depth, practical, easy-",
    },
    {
        name: "Photography",
        iconClass: "fas fa-camera",
        bgColor: "bg-blue-200",
        textColor: "text-blue-600",
        description: "Learn Adobe Illustrator CC graphic design, logo design, and more with this in-depth, practical, easy-",
    },
    {
        name: "Health & Care",
        iconClass: "fas fa-heartbeat",
        bgColor: "bg-red-100",
        textColor: "text-red-500",
        description: "Learn Adobe Illustrator CC graphic design, logo design, and more with this in-depth, practical, easy-",
    },
    {
        name: "Technology",
        iconClass: "fas fa-microchip",
        bgColor: "bg-purple-200",
        textColor: "text-purple-600",
        description: "Learn Adobe Illustrator CC graphic design, logo design, and more with this in-depth, practical, easy-",
    },
    {
        name: "Art & Craft",
        iconClass: "fas fa-palette",
        bgColor: "bg-yellow-100",
        textColor: "text-yellow-500",
        description: "Learn Adobe Illustrator CC graphic design, logo design, and more with this in-depth, practical, easy-",
    },
    {
        name: "Music",
        iconClass: "fas fa-music",
        bgColor: "bg-pink-100",
        textColor: "text-pink-500",
        description: "Learn Adobe Illustrator CC graphic design, logo design, and more with this in-depth, practical, easy-",
    },
    {
        name: "Fitness",
        iconClass: "fas fa-dumbbell",
        bgColor: "bg-teal-100",
        textColor: "text-teal-500",
        description: "Learn Adobe Illustrator CC graphic design, logo design, and more with this in-depth, practical, easy-",
    },
    {
        name: "Languages",
        iconClass: "fas fa-language",
        bgColor: "bg-indigo-100",
        textColor: "text-indigo-500",
        description: "Learn Adobe Illustrator CC graphic design, logo design, and more with this in-depth, practical, easy-",
    },
    {
        name: "Literature",
        iconClass: "fas fa-book",
        bgColor: "bg-gray-100",
        textColor: "text-gray-500",
        description: "Learn Adobe Illustrator CC graphic design, logo design, and more with this in-depth, practical, easy-",
    },
    {
        name: "Cooking",
        iconClass: "fas fa-utensils",
        bgColor: "bg-red-200",
        textColor: "text-red-600",
        description: "Learn Adobe Illustrator CC graphic design, logo design, and more with this in-depth, practical, easy-",
    },
    {
        name: "Travel",
        iconClass: "fas fa-globe",
        bgColor: "bg-yellow-200",
        textColor: "text-yellow-600",
        description: "Learn Adobe Illustrator CC graphic design, logo design, and more with this in-depth, practical, easy-",
    },
    {
        name: "Environment",
        iconClass: "fas fa-leaf",
        bgColor: "bg-green-300",
        textColor: "text-green-700",
        description: "Learn Adobe Illustrator CC graphic design, logo design, and more with this in-depth, practical, easy-",
    },
    {
        name: "Robotics",
        iconClass: "fas fa-robot",
        bgColor: "bg-blue-300",
        textColor: "text-blue-700",
        description: "Learn Adobe Illustrator CC graphic design, logo design, and more with this in-depth, practical, easy-",
    },
    {
        name: "Psychology",
        iconClass: "fas fa-brain",
        bgColor: "bg-purple-300",
        textColor: "text-purple-700",
        description: "Learn Adobe Illustrator CC graphic design, logo design, and more with this in-depth, practical, easy-",
    },
    {
        name: "Childcare",
        iconClass: "fas fa-child",
        bgColor: "bg-pink-200",
        textColor: "text-pink-600",
        description: "Learn Adobe Illustrator CC graphic design, logo design, and more with this in-depth, practical, easy-",
    },
    {
        name: "Painting",
        iconClass: "fas fa-paint-brush",
        bgColor: "bg-teal-200",
        textColor: "text-teal-600",
        description: "Learn Adobe Illustrator CC graphic design, logo design, and more with this in-depth, practical, easy-",
    },
    {
        name: "Film & Media",
        iconClass: "fas fa-film",
        bgColor: "bg-indigo-200",
        textColor: "text-indigo-600",
        description: "Learn Adobe Illustrator CC graphic design, logo design, and more with this in-depth, practical, easy-",
    },
    {
        name: "Astronomy",
        iconClass: "fas fa-star",
        bgColor: "bg-blue-400",
        textColor: "text-blue-800",
        description: "Explore the universe and learn about stars, planets, and galaxies with this comprehensive course.",
    },
    {
        name: "Gardening",
        iconClass: "fas fa-seedling",
        bgColor: "bg-green-400",
        textColor: "text-green-800",
        description: "Learn the art of gardening, from planting to harvesting, with this practical and easy-to-follow course.",
    },
    {
        name: "Fashion",
        iconClass: "fas fa-tshirt",
        bgColor: "bg-pink-400",
        textColor: "text-pink-800",
        description: "Discover the world of fashion design, from sketching to sewing, with this in-depth and creative course.",
    },
];

const CategoryCard = ({
    name,
    iconClass,
    bgColor,
    textColor,
    description,
}: {
    name: string;
    iconClass: string;
    bgColor: string;
    textColor: string;
    description: string;
}) => (
    <div className={`${bgColor} p-6 rounded-lg shadow-md`}>
        <div className={`${textColor} text-3xl mb-4`}>
            <i className={iconClass}></i>
        </div>
        <h2 className="text-xl font-semibold mb-2">{name}</h2>
        <p className="text-gray-600">{description}</p>
    </div>
);

const Page = () => {
    return (
        <div>
            <div className="max-w-7xl m-auto px-4 py-8">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold mb-4">
                        Choose your favourite course from top categories
                    </h1>
                    <button className="bg-red-500 text-white px-4 py-2 rounded">
                        See all Categories
                    </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {categories.map((category, index) => (
                        <CategoryCard
                            key={index}
                            name={category.name}
                            iconClass={category.iconClass}
                            bgColor={category.bgColor}
                            textColor={category.textColor}
                            description={category.description}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Page;
