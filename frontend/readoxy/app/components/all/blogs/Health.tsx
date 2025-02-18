'use client';
import React from 'react';
import dynamic from 'next/dynamic';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const Slider = dynamic(() => import('react-slick'), { ssr: false });

interface CardProps {
  imageSrc: string;
  imageAlt: string;
  title: string;
  authorName: string;
  authorImage: string;
  date: string;
  rating: number;
  views: number;
  likes: number;
  description: string;
}

const Card: React.FC<CardProps> = ({ imageSrc, imageAlt, title, authorName, authorImage, date, rating, views, likes, description }) => (
  <div className="bg-white rounded-lg shadow-md overflow-hidden m-4">
    <img alt={imageAlt} className="w-full h-48 object-cover" height="400" src={imageSrc} width="600" />
    <div className="p-4">
      <h2 className="text-xl font-bold mb-2">{title}</h2>
      <div className="flex items-center mb-2">
        <img alt={`Avatar of ${authorName}`} className="w-10 h-10 rounded-full mr-2" height="100" src={authorImage} width="100" />
        <div>
          <p className="text-sm font-semibold">{authorName}</p>
          <p className="text-sm text-gray-500">{date}</p>
        </div>
        <div className="ml-auto flex items-center">
          <span className="text-yellow-500">
            <i className="fas fa-star"></i>
          </span>
          <span className="ml-1 text-sm font-semibold">{rating}</span>
        </div>
      </div>
      <p className="text-gray-700 text-sm mb-4">{description}</p>
      <div className="flex items-center justify-between text-gray-500 text-sm">
        <div className="flex items-center">
          <i className="fas fa-eye mr-1"></i>{views}
        </div>
        <div className="flex items-center">
          <i className="fas fa-thumbs-up mr-1"></i>{likes}
        </div>
      </div>
    </div>
  </div>
);

const Health = () => {
  const cardsData = [
    {
      imageSrc: "https://storage.googleapis.com/a1aa/image/Wi4CR2BPg2fxuBWJfFVQt7gzL9r4axg0DqSR5mghxXI.jpg",
      imageAlt: "Caramel Strawberry Milkshake with strawberries and caramel sauce",
      title: "Caramel Strawberry Milkshake",
      authorName: "John Doe",
      authorImage: "https://storage.googleapis.com/a1aa/image/IW62qcRxs62VCAJxTt8YplKsRH7NTmmmY_v9xq7mYHo.jpg",
      date: "1/1/2023",
      rating: 4.5,
      views: 1500,
      likes: 300,
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque nisl eros, pulvinar facilisis justo mollis, auctor consequat urna."
    },
    {
      imageSrc: "https://storage.googleapis.com/a1aa/image/Jl6wshKgCbwxYRzu_aMeAIRjTHwc5E7rglBTwHUODa4.jpg",
      imageAlt: "Cashew Vegan Rice with cashews and green onions",
      title: "Cashew Vegan Rice",
      authorName: "Jane Smith",
      authorImage: "https://storage.googleapis.com/a1aa/image/DxQeD3ZoZFWtlLA4uy0XZDnYvfraWSZWxNv9TbNDIDk.jpg",
      date: "2/15/2023",
      rating: 4,
      views: 1200,
      likes: 250,
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque nisl eros, pulvinar facilisis justo mollis, auctor consequat urna."
    },
    {
      imageSrc: "https://storage.googleapis.com/a1aa/image/Jl6wshKgCbwxYRzu_aMeAIRjTHwc5E7rglBTwHUODa4.jpg",
      imageAlt: "Cashew Vegan Rice with cashews and green onions",
      title: "Cashew Vegan Rice",
      authorName: "Jane Smith",
      authorImage: "https://storage.googleapis.com/a1aa/image/DxQeD3ZoZFWtlLA4uy0XZDnYvfraWSZWxNv9TbNDIDk.jpg",
      date: "2/15/2023",
      rating: 4,
      views: 1200,
      likes: 250,
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque nisl eros, pulvinar facilisis justo mollis, auctor consequat urna."
    },
    {
      imageSrc: "https://storage.googleapis.com/a1aa/image/Jl6wshKgCbwxYRzu_aMeAIRjTHwc5E7rglBTwHUODa4.jpg",
      imageAlt: "Cashew Vegan Rice with cashews and green onions",
      title: "Cashew Vegan Rice",
      authorName: "Jane Smith",
      authorImage: "https://storage.googleapis.com/a1aa/image/DxQeD3ZoZFWtlLA4uy0XZDnYvfraWSZWxNv9TbNDIDk.jpg",
      date: "2/15/2023",
      rating: 4,
      views: 1200,
      likes: 250,
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque nisl eros, pulvinar facilisis justo mollis, auctor consequat urna."
    },
        {
        imageSrc: "https://storage.googleapis.com/a1aa/image/Jl6wshKgCbwxYRzu_aMeAIRjTHwc5E7rglBTwHUODa4.jpg",
        imageAlt: "Cashew Vegan Rice with cashews and green onions",
        title: "Cashew Vegan Rice",
        authorName: "Jane Smith",
        authorImage: "https://storage.googleapis.com/a1aa/image/DxQeD3ZoZFWtlLA4uy0XZDnYvfraWSZWxNv9TbNDIDk.jpg",
        date: "2/15/2023",
        rating: 4,
        views: 1200,
        likes: 250,
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque nisl eros, pulvinar facilisis justo mollis, auctor consequat urna."
        },
    {
      imageSrc: "https://storage.googleapis.com/a1aa/image/B5k1A--mWvTGKprfqEQlzYzRSVpyX4clONZXpdAkKXw.jpg",
      imageAlt: "Smoked Salmon Salad Sandwich with fresh vegetables",
      title: "Smoked Salmon Salad Sandwich",
      authorName: "John Doe",
      authorImage: "https://storage.googleapis.com/a1aa/image/IW62qcRxs62VCAJxTt8YplKsRH7NTmmmY_v9xq7mYHo.jpg",
      date: "1/1/2023",
      rating: 4.5,
      views: 1500,
      likes: 300,
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque nisl eros, pulvinar facilisis justo mollis, auctor consequat urna."
    }
  ];

  const settings = {
    infinite: true,
    slidesToShow: 3,
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 1024,
        settings: { slidesToShow: 2, slidesToScroll: 1 },
      },
      {
        breakpoint: 768,
        settings: { slidesToShow: 1, slidesToScroll: 1 },
      },
    ],
  };

  return (
    <div className="max-w-7xl m-auto py-8 px-4">
      <Slider {...settings}>
        {cardsData.map((card, index) => (
          <Card key={index} {...card} />
        ))}
      </Slider>
    </div>
  );
};

export default Health;