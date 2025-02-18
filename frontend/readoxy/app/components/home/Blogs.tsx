import { Button } from "@/components/ui/button";
import React from "react";
import { FaStar, FaEye, FaThumbsUp } from "react-icons/fa";

const blogData = [
	{
		title: "Caramel Strawberry Milkshake",
		imageUrl:
			"https://storage.googleapis.com/a1aa/image/X3wYRlfgp-NkDy5v63jZSbEMZtiufl0GNsfUVuIOdvE.jpg",
		author: "John Doe",
		authorImage: "/blogs/author-image.svg",
		rating: 4.5,
		datePosted: "2023-01-01",
		views: 1500,
		likes: 300,
	},
	{
		title: "Cashew Vegan Rice",
		imageUrl:
			"https://storage.googleapis.com/a1aa/image/DbCfmOPkBWIZ3BTcmtRMPNZ2hV-PvtdF5uj1k_eydpk.jpg",
		author: "Jane Smith",
		authorImage: "/blogs/author-image.svg",
		rating: 4.0,
		datePosted: "2023-02-15",
		views: 1200,
		likes: 250,
	},
	{
		title: "Smoked Salmon Salad Sandwich",
		imageUrl:
			"https://storage.googleapis.com/a1aa/image/T--FeqDDv_lRJSF4ID_LxcVeOxUjP7EpOh5g8zLQS2E.jpg",
		author: "John Doe",
		authorImage: "/blogs/author-image.svg",
		rating: 4.5,
		datePosted: "2023-01-01",
		views: 1500,
		likes: 300,
	},
	{
		title: "Salmon in Creamy Sun Dried Tomato Sauce",
		imageUrl:
			"https://storage.googleapis.com/a1aa/image/mp4qpg8HWIihFn6OpfxuPGSRy21Zk2eZEttSV3kMNPs.jpg",
		author: "Jane Smith",
		authorImage: "/blogs/author-image.svg",
		rating: 4.0,
		datePosted: "2023-02-15",
		views: 1200,
		likes: 250,
	},
	{
		title: "Healthy Jam Waffle Breakfast",
		imageUrl:
			"https://storage.googleapis.com/a1aa/image/Xyg8MpI3RlLotXZwlhRDp15bLhi_LMzyDAaIzDWDy_Y.jpg",
		author: "John Doe",
		authorImage: "/blogs/author-image.svg",
		rating: 4.5,
		datePosted: "2023-01-01",
		views: 1500,
		likes: 300,
	},
	{
		title: "Chocolate and Banana Jar Cake",
		imageUrl:
			"https://storage.googleapis.com/a1aa/image/JiQ4MMZLCYRw2d8mbcvSJi5tVnPzLTb-bIGghCQyAug.jpg",
		author: "Jane Smith",
		authorImage: "/blogs/author-image.svg",
		rating: 4.0,
		datePosted: "2023-02-15",
		views: 1200,
		likes: 250,
	},
	{
		title: "Caramel Blueberry Scones",
		imageUrl:
			"https://storage.googleapis.com/a1aa/image/XQ-uqGMoMAmYckOHPNHPzkguIdRzr4ToqP8iVzgeB8g.jpg",
		author: "John Doe",
		authorImage: "/blogs/author-image.svg",
		rating: 4.5,
		datePosted: "2023-01-01",
		views: 1500,
		likes: 300,
	},
	{
		title: "Blueberry Carrot Cake",
		imageUrl:
			"https://storage.googleapis.com/a1aa/image/Q_3F5b3oG0lic30dedRIm0xIq9-x1c0IRsSF77XAgU0.jpg",
		author: "Jane Smith",
		authorImage: "/blogs/author-image.svg",
		rating: 4.0,
		datePosted: "2023-02-15",
		views: 1200,
		likes: 250,
	},
	{
		title: "Vegan Cauliflower Salad",
		imageUrl:
			"https://storage.googleapis.com/a1aa/image/7_8_0a0PL8N8jay3kyhA6K6WdII9pjKNBIXu_-0nloY.jpg",
		author: "John Doe",
		authorImage: "/blogs/author-image.svg",
		rating: 4.5,
		datePosted: "2023-01-01",
		views: 1500,
		likes: 300,
	},
	{
		title: "Roasted Red Pepper Soup",
		imageUrl:
			"https://storage.googleapis.com/a1aa/image/_y4M-Yxbsv2ep7JtDKBws7gTugvit4XfOSeHkHAGVjQ.jpg",
		author: "Jane Smith",
		authorImage: "/blogs/author-image.svg",
		rating: 4.0,
		datePosted: "2023-02-15",
		views: 1200,
		likes: 250,
	},
	{
		title: "Eggs and Avocado Toast",
		imageUrl:
			"https://storage.googleapis.com/a1aa/image/W6pIJnvf2c6waxScP20oWItKZ_OAvFGjx4KeQ_qcZf8.jpg",
		author: "John Doe",
		authorImage: "/blogs/author-image.svg",
		rating: 4.5,
		datePosted: "2023-01-01",
		views: 1500,
		likes: 300,
	},
	{
		title: "Pork Shoulder Cashew Noodles",
		imageUrl:
			"https://storage.googleapis.com/a1aa/image/eYutbJmi6FLWzkrD0Krq9Vj3m8iRTJpR1cwdj0DUhI0.jpg",
		author: "Jane Smith",
		authorImage: "/blogs/author-image.svg",
		rating: 4.0,
		datePosted: "2023-02-15",
		views: 1200,
		likes: 250,
	},
];

const BlogCard = ({
	title,
	imageUrl,
	author,
	authorImage,
	rating,
	datePosted,
	views,
	likes,
}: {
	title: string;
	imageUrl: string;
	author: string;
	authorImage: string;
	rating: number;
	datePosted: string;
	views: number;
	likes: number;
}) => (
	<div className="bg-white rounded-lg shadow-lg overflow-hidden transform transition duration-500 hover:scale-105 hover:shadow-2xl">
		<img alt={title} className="w-full h-48 object-cover" src={imageUrl} />
		<div className="p-4">
			<h2 className="text-xl font-semibold mb-2">{title}</h2>
			<div className="flex items-center justify-between mb-2">
				<div className="flex items-center">
					<img
						alt={author}
						className="w-10 h-10 rounded-full mr-2"
						src={authorImage}
					/>
					<div>
						<p className="text-gray-800 font-semibold">{author}</p>
						<p className="text-gray-600 text-sm">
							{new Date(datePosted).toLocaleDateString()}
						</p>
					</div>
				</div>
				<div className="flex items-center">
					<FaStar className="text-yellow-500 mr-1" />
					<p className="text-gray-800 font-semibold">{rating}</p>
				</div>
			</div>
			<p className="text-gray-600 mb-4">
				Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque
				nisl eros, pulvinar facilisis justo mollis, auctor consequat
				urna.
			</p>
			<div className="flex items-center justify-between">
				<div className="flex items-center">
					<FaEye className="text-gray-600 mr-1" />
					<p className="text-gray-600">{views}</p>
				</div>
				<div className="flex items-center">
					<FaThumbsUp className="text-gray-600 mr-1" />
					<p className="text-gray-600">{likes}</p>
				</div>
			</div>
		</div>
	</div>
);

const Blogs = () => {
	return (
		<div className="max-w-7xl m-auto py-8">
			<div className="container mx-auto px-4 py-8">
				<h1 className="text-3xl font-bold mb-8">Latest Blogs</h1>
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
					{blogData.map((blog, index) => (
						<BlogCard
							key={index}
							title={blog.title}
							imageUrl={blog.imageUrl}
							author={blog.author}
							authorImage={blog.authorImage}
							rating={blog.rating}
							datePosted={blog.datePosted}
							views={blog.views}
							likes={blog.likes}
						/>
					))}
				</div>
			</div>
			<div className="flex justify-center">
				<Button>Load More</Button>
			</div>
		</div>
	);
};

export default Blogs;
