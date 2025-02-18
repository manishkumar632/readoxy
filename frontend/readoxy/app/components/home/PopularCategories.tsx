"use client"; // Ensures this is a Client Component

import React from "react";
import dynamic from "next/dynamic";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

// Dynamically import Slider to prevent SSR issues
const Slider = dynamic(() => import("react-slick"), { ssr: false });

const categories = [
    {
        name: "Pasta",
        imageUrl: "https://storage.googleapis.com/a1aa/image/8KnaT4yNrAKKIeJsT7t--RkIZZikudBmF3_I2b3GjHE.jpg",
        alt: "A bowl of pasta with a fork twirling the noodles",
    },
    {
        name: "Pizza",
        imageUrl: "https://storage.googleapis.com/a1aa/image/ZCq1LydaB3rOAlFle33iY78_-Ya4Uu2jfZnIjv_g0-E.jpg",
        alt: "A close-up of a pizza with basil leaves",
    },
    {
        name: "Vegan",
        imageUrl: "https://storage.googleapis.com/a1aa/image/p7OKmFp8QWLb9JyGqFHIQ84FvHnFefLheg9y6XzOoLE.jpg",
        alt: "A bowl of vegan food with figs and granola",
    },
    {
        name: "Desserts",
        imageUrl: "https://storage.googleapis.com/a1aa/image/I6AJfmMhRuimxVsjlDTuUwpS2w6kxczey51p7ifM2ps.jpg",
        alt: "A bowl of ice cream with a spoon",
    },
    {
        name: "Smoothies",
        imageUrl: "https://storage.googleapis.com/a1aa/image/_Vm39HmA8ws9yegUFp2WUpoDLqUW9CZskwNG7FjQ5xQ.jpg",
        alt: "A glass of smoothie with a lemon slice",
    },
    {
        name: "Breakfast",
        imageUrl: "https://storage.googleapis.com/a1aa/image/JQ4yEeWQQ1xdyp5ND1jZa0HmzWUgZhlYfgQIYFVIuy8.jpg",
        alt: "A bowl of breakfast cereal with figs and milk",
    },
];

const CategoryCard = ({ name, imageUrl, alt }: { name: string; imageUrl: string; alt: string }) => (
    <div className="flex flex-col items-center">
        <img alt={alt} className="w-32 h-32 rounded-full object-cover" src={imageUrl} />
        <p className="mt-4 text-lg font-semibold">{name}</p>
    </div>
);

const PopularCategories = () => {
    const settings = {
        className: "center",
        infinite: true,
        centerPadding: "60px",
        slidesToShow: 5,
        swipeToSlide: true,
        arrows: true, // ✅ Enables navigation arrows
        responsive: [
            {
                breakpoint: 1024,
                settings: { slidesToShow: 3, arrows: true },
            },
            {
                breakpoint: 768,
                settings: { slidesToShow: 2, arrows: true },
            },
            {
                breakpoint: 480,
                settings: { slidesToShow: 2, arrows: false }, // Hide arrows on small screens
            },
        ],
        afterChange: function (index: number) {
            console.log(`Slider Changed to: ${index + 1}`);
        },
    };

    return (
        <div className="max-w-7xl m-auto text-center py-8 px-4">
            <h1 className="text-3xl font-bold py-4">Popular Categories</h1>
            <Slider {...settings}>
                {categories.map((category, index) => (
                    <CategoryCard key={index} name={category.name} imageUrl={category.imageUrl} alt={category.alt} />
                ))}
            </Slider>
        </div>
    );
};

export default PopularCategories;
