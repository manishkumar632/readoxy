import NavMenu from "./NavMenu";
const Header = () => {
	return(
        <div className="flex justify-between max-w-7xl m-auto py-8 px-4">
            <p className="text-3xl font-bold drop-shadow-lg"
                    style={{ fontFamily: "Angelos, cursive" }}>Readoxy</p>
            <NavMenu />
        </div>
    );
};

export default Header;
