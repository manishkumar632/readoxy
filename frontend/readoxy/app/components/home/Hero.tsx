import React from "react";
import { FaSearch } from "react-icons/fa";

const Hero = () => {
	return (
		<div className="max-w-7xl m-auto flex items-center relative px-4">
			<div className="flex flex-col md:flex-row items-center justify-center max-h-fit">
				<div className="text-center md:text-left md:w-1/2">
					<h1 className="text-4xl md:text-5xl font-bold text-black mb-4 drop-shadow-lg">
						Turn your ambition into a success story
					</h1>
					<p className="text-lg text-gray-600 mb-6 drop-shadow-sm">
						Choose from over 100,000 online video courses with new
						additions published every month.
					</p>
					<div className="relative w-full md:w-2/3 mx-auto md:mx-0">
						<input
							className="w-full p-4 pl-6 pr-16 rounded-full shadow-md focus:outline-none"
							placeholder="Search your favourite course"
							type="text"
						/>
						<button className="absolute right-0 top-0 mt-2 mr-2 bg-green-300 text-white p-3 rounded-full">
							<FaSearch />
						</button>
					</div>
				</div>
				<div className="mt-8 md:mt-0 md:w-1/2 flex justify-center">
					<div className="relative">
						<img
							alt="A woman smiling and holding a pencil"
							className="h-[350px] md:h-[400px] lg:h-[500px]"
							src="/home-hero/hero-image.svg"
						/>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Hero;
