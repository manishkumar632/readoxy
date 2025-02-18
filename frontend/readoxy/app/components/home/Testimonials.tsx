"use client"; 
import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const testimonials = [
    {
        name: "Themadbrains",
        role: "Student",
        imageUrl: "https://storage.googleapis.com/a1aa/image/bTrw4akzWGCM-zvCtUP86EUpfSIx2mz9AgR9lSl6po4.jpg",
        rating: 5,
        review: "Skillfy is a life saver. I don’t have the time/money for a college education. My goal is to become a freelance web developer, and thanks to Skillfy.",
    },
    {
        name: "UIUX Designer",
        role: "Student",
        imageUrl: "https://storage.googleapis.com/a1aa/image/pR44_A_wADldhq66c0kNurAyOjm4vDAFfeM4RRoXmyg.jpg",
        rating: 4,
        review: "Skillfy is a life saver. I don’t have the time/money for a college education. My goal is to become a freelance web developer, and thanks to Skillfy.",
    },
    {
        name: "UIUX Designer",
        role: "Student",
        imageUrl: "https://storage.googleapis.com/a1aa/image/pR44_A_wADldhq66c0kNurAyOjm4vDAFfeM4RRoXmyg.jpg",
        rating: 5,
        review: "Skillfy is a life saver. I don’t have the time/money for a college education. My goal is to become a freelance web developer, and thanks to Skillfy.",
    },
    {
        name: "UIUX Designer",
        role: "Student",
        imageUrl: "https://storage.googleapis.com/a1aa/image/pR44_A_wADldhq66c0kNurAyOjm4vDAFfeM4RRoXmyg.jpg",
        rating: 5,
        review: "Skillfy is a life saver. I don’t have the time/money for a college education. My goal is to become a freelance web developer, and thanks to Skillfy.",
    },
    {
        name: "UIUX Designer",
        role: "Student",
        imageUrl: "https://storage.googleapis.com/a1aa/image/pR44_A_wADldhq66c0kNurAyOjm4vDAFfeM4RRoXmyg.jpg",
        rating: 5,
        review: "Skillfy is a life saver. I don’t have the time/money for a college education. My goal is to become a freelance web developer, and thanks to Skillfy.",
    },
    {
        name: "UIUX Designer",
        role: "Student",
        imageUrl: "https://storage.googleapis.com/a1aa/image/pR44_A_wADldhq66c0kNurAyOjm4vDAFfeM4RRoXmyg.jpg",
        rating: 5,
        review: "Skillfy is a life saver. I don’t have the time/money for a college education. My goal is to become a freelance web developer, and thanks to Skillfy.",
    },
    // Add more testimonials here...
];

const TestimonialCard = ({ name, role, imageUrl, rating, review }: { name: string; role: string; imageUrl: string; rating: number; review: string }) => (
    <div className="bg-white p-6 rounded-lg shadow-md flex-shrink-0 w-72 md:w-96 m-2">
        <div className="flex items-center mb-4">
            <img alt={`Profile picture of ${name}`} className="w-12 h-12 rounded-full mr-4" height="50" src={imageUrl} width="50" />
            <div>
                <h3 className="text-lg font-semibold">{name}</h3>
                <p className="text-gray-500">{role}</p>
            </div>
        </div>
        <div className="flex items-center mb-4">
            <div className="flex space-x-1">
                {Array.from({ length: rating }).map((_, i) => (
                    <i key={i} className="fas fa-star text-orange-500"></i>
                ))}
            </div>
        </div>
        <p className="text-gray-700">{review}</p>
    </div>
);

const Testimonials = () => {
    const settings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 3,
        slidesToScroll: 1,
        nextArrow: <SampleNextArrow />,
        prevArrow: <SamplePrevArrow />,
        responsive: [
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 1,
                    infinite: true,
                    dots: true,
                },
            },
            {
                breakpoint: 600,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                },
            },
        ],
    };

    function SampleNextArrow(props: any) {
        const { className, style, onClick } = props;
        return (
            <div
                className={`${className} bg-red-100 rounded-full flex items-center justify-center`}
                style={{ ...style, display: "block", right: "10px" }}
                onClick={onClick}
            >
                <i className="fas fa-arrow-right text-orange-500"></i>
            </div>
        );
    }

    function SamplePrevArrow(props: any) {
        const { className, style, onClick } = props;
        return (
            <div
                className={`${className} bg-red-100 rounded-full flex items-center justify-center`}
                style={{ ...style, display: "block", left: "10px", zIndex: 1 }}
                onClick={onClick}
            >
                <i className="fas fa-arrow-left text-orange-500"></i>
            </div>
        );
    }

    return (
        <div className="max-w-7xl m-auto px-4 relative py-8">
            <div className="">
                <div className="block sm:flex justify-between">
                    <h2 className="text-3xl text-center font-bold mb-8">
                        What our students have to say
                    </h2>
					{/* SampleNextArrow and  SamplePrevArrow*/}
                </div>
                <Slider {...settings}>
                    {testimonials.map((testimonial, index) => (
                        <TestimonialCard
                            key={index}
                            name={testimonial.name}
                            role={testimonial.role}
                            imageUrl={testimonial.imageUrl}
                            rating={testimonial.rating}
                            review={testimonial.review}
                        />
                    ))}
                </Slider>
            </div>
        </div>
    );
};

export default Testimonials;