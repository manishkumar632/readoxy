import Blogs from "../components/home/Blogs";
import Hero from "../components/home/Hero";

import PopularCategories from "../components/home/PopularCategories";
import Testimonials from "../components/home/Testimonials";

const page = () => {
	return <div>
        <Hero />
        <Blogs />
        <PopularCategories />
        <Testimonials />
    </div>;
};

export default page;
