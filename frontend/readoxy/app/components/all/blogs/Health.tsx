'use client';
import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Pagination, Navigation } from 'swiper/modules';
import { Star, Eye, ThumbsUp } from 'lucide-react';
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

interface FoodCardProps {
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

const FoodCard: React.FC<FoodCardProps> = ({
  imageSrc,
  imageAlt,
  title,
  authorName,
  authorImage,
  date,
  rating,
  views,
  likes,
  description
}) => {
  return (
    <div className="relative bg-white rounded-xl shadow-lg overflow-hidden w-full max-w-[400px] h-[420px] md:h-[500px] transform transition-all duration-300">
      <div className="h-[55%] md:h-[60%]">
        <img
          src={imageSrc}
          alt={imageAlt}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.src = 'https://via.placeholder.com/400x300?text=Image+Not+Found';
          }}
        />
      </div>
      
      <div className="p-4 md:p-6 h-[45%] md:h-[40%]">
        <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-2 line-clamp-1">{title}</h2>
        <p className="text-xs md:text-sm text-gray-600 line-clamp-2 mb-3">{description}</p>
        
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <img
              src={authorImage}
              alt={`Avatar of ${authorName}`}
              className="w-6 h-6 md:w-8 md:h-8 rounded-full border border-gray-200"
              onError={(e) => {
                e.currentTarget.src = 'https://via.placeholder.com/100?text=Avatar+Not+Found';
              }}
            />
            <div>
              <p className="text-xs md:text-sm font-medium text-gray-800">{authorName}</p>
              <p className="text-xs text-gray-500">{date}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 text-xs md:text-sm">
            <div className="flex items-center gap-1">
              <Star size={14} className="text-yellow-400" />
              <span className="text-gray-700">{rating}</span>
            </div>
            <div className="flex items-center gap-1 text-gray-600">
              <Eye size={14} />
              <span>{views.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1 text-gray-600">
              <ThumbsUp size={14} />
              <span>{likes.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const FoodGallery = () => {
  const foodData = [
    {
      imageSrc: "/image/image1.png",
      imageAlt: "Caramel Strawberry Milkshake",
      title: "Caramel Strawberry Milkshake",
      authorName: "John Doe",
      authorImage: "/image/image2.png",
      date: "1/1/2023",
      rating: 4.5,
      views: 1500,
      likes: 300,
      description: "A delicious blend of fresh strawberries and caramel sauce, topped with whipped cream."
    },
    {
      imageSrc: "/image/image1.png",
      imageAlt: "Cashew Vegan Rice",
      title: "Cashew Vegan Rice",
      authorName: "Jane Smith",
      authorImage: "/image/image2.png",
      date: "2/15/2023",
      rating: 4,
      views: 1200,
      likes: 250,
      description: "Healthy vegan rice dish topped with roasted cashews and fresh herbs."
    },
    {
      imageSrc: "/image/image1.png",
      imageAlt: "Smoked Salmon Salad",
      title: "Smoked Salmon Salad",
      authorName: "Mike Johnson",
      authorImage: "/image/image2.png",
      date: "3/1/2023",
      rating: 4.8,
      views: 2200,
      likes: 450,
      description: "Fresh smoked salmon served on a bed of mixed greens with avocado and lemon dressing."
    },
    {
      imageSrc: "/image/image1.png",
      imageAlt: "Mediterranean Bowl",
      title: "Mediterranean Bowl",
      authorName: "Sarah Wilson",
      authorImage: "/image/image2.png",
      date: "3/15/2023",
      rating: 4.6,
      views: 1800,
      likes: 380,
      description: "Mediterranean quinoa bowl with falafel and hummus."
    },
    {
      imageSrc: "/image/image1.png",
      imageAlt: "Mango Tango Smoothie",
      title: "Mango Tango Smoothie",
      authorName: "Lisa Chen",
      authorImage: "/image/image2.png",
      date: "4/1/2023",
      rating: 4.7,
      views: 1600,
      likes: 420,
      description: "Tropical smoothie with fresh mango and coconut."
    },
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <h3 className="text-center text-gray-600 text-lg mb-2 font-medium">
          - Popular Dishes -
        </h3>
        <h1 className="text-center text-4xl text-[#ec994b] font-bold mb-16">
          Trending Food
        </h1>
        
        <div className="relative">
          <Swiper
            effect={'coverflow'}
            grabCursor={true}
            centeredSlides={true}
            loop={true}
            slidesPerView={'auto'}
            coverflowEffect={{
              rotate: 0,
              stretch: 0,
              depth: 300,
              modifier: 1.5,
              slideShadows: true,
            }}
            breakpoints={{
              640: {
                slidesPerView: 2,
                spaceBetween: 20,
              },
              768: {
                slidesPerView: 3,
                spaceBetween: 40,
              },
              1024: {
                slidesPerView: 4,
                spaceBetween: 50,
              },
            }}
            pagination={{
              clickable: true,
              dynamicBullets: true,
            }}
            navigation={true}
            modules={[EffectCoverflow, Pagination, Navigation]}
            className="!pb-16"
          >
            {foodData.map((item, index) => (
              <SwiperSlide key={index} className="!w-[280px] md:!w-[400px]">
                <FoodCard {...item} />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  );
};

export default FoodGallery;

