import React from "react";

const Footer = () => {
	return (
		<footer className="max-w-7xl m-auto py-16 p-4">
			<div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-5 gap-8">
				<div className="col-span-3 sm:col-span-2">
					<div className="flex flex-col">
						<h1
							className="text-4xl font-bold"
							style={{ fontFamily: "Angelos, cursive" }}
						>
							Readoxy
						</h1>
						<p className="mt-4 text-gray-500">
							"On the other hand, we denounce with righteous
							indignation and dislike men who are so beguiled and
							demoralized by the charms of pleasure of the moment"
						</p>
					</div>
				</div>
				<div>
					<div>
						<h2 className="font-bold mb-4">Readoxy</h2>
						<ul>
							<li className="mb-2">
								<a href="#" className="hover:underline">
									About us
								</a>
							</li>
							<li className="mb-2">
								<a href="#" className="hover:underline">
									Careers
								</a>
							</li>
							<li className="mb-2">
								<a href="#" className="hover:underline">
									Contact Us
								</a>
							</li>
							<li className="mb-2">
								<a href="#" className="hover:underline">
									Feedback
								</a>
							</li>
						</ul>
					</div>
				</div>
				<div>
					<h2 className="font-bold mb-4">Legal</h2>
					<ul>
						<li className="mb-2">
							<a href="#" className="hover:underline">
								Terms
							</a>
						</li>
						<li className="mb-2">
							<a href="#" className="hover:underline">
								Conditions
							</a>
						</li>
						<li className="mb-2">
							<a href="#" className="hover:underline">
								Cookies
							</a>
						</li>
						<li className="mb-2">
							<a href="#" className="hover:underline">
								Copyright
							</a>
						</li>
					</ul>
				</div>
				<div>
					<h2 className="font-bold mb-4">Follow</h2>
					<ul>
						<li className="mb-2">
							<a href="#" className="hover:underline">
								Facebook
							</a>
						</li>
						<li className="mb-2">
							<a href="#" className="hover:underline">
								Twitter
							</a>
						</li>
						<li className="mb-2">
							<a href="#" className="hover:underline">
								Instagram
							</a>
						</li>
						<li className="mb-2">
							<a href="#" className="hover:underline">
								Youtube
							</a>
						</li>
					</ul>
				</div>
			</div>
			<div className="mt-12 border-t pt-6 flex flex-col md:flex-row justify-between items-center">
				<p className="text-gray-500 text-sm">
					&copy; 2025 Readoxy - All rights reserved
				</p>
				<div className="flex space-x-4 mt-4 md:mt-0">
					<a href="#" className="text-gray-500 hover:text-gray-700">
						<i className="fab fa-facebook-f"></i>
					</a>
					<a href="#" className="text-gray-500 hover:text-gray-700">
						<i className="fab fa-twitter"></i>
					</a>
					<a href="#" className="text-gray-500 hover:text-gray-700">
						<i className="fab fa-instagram"></i>
					</a>
					<a href="#" className="text-gray-500 hover:text-gray-700">
						<i className="fab fa-youtube"></i>
					</a>
				</div>
			</div>
		</footer>
	);
};

export default Footer;
