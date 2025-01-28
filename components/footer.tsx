import Link from "next/link";
import { Input } from "./ui/input";
import { Logo } from "./ui/logo";

export const Footer = () => {
    const date = new Date();
    const year = date.getFullYear();
    return (
        <div>
            <footer className="bg-gray-100 dark:bg-gray-900">
                <div className="container px-6 py-12 mx-auto">
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-y-10 lg:grid-cols-4">
                        <div className="sm:col-span-2">
                            <h1 className="max-w-lg text-xl font-semibold tracking-tight text-gray-800 xl:text-2xl dark:text-white">Subscribe our newsletter to get an update.</h1>

                            <div className="flex flex-col mx-auto mt-6 space-y-3 md:space-y-0 md:flex-row">
                                <Input 
                                    id="email" 
                                    type="email" 
                                    autoComplete="email"
                                    className="px-4 py-2 text-gray-700 bg-white border rounded-md dark:bg-gray-900 dark:text-gray-300 dark:border-gray-600 dark:focus:border-blue-300 focus:outline-none focus:ring focus:ring-opacity-40" 
                                    placeholder="Email Address" 
                                />
                        
                                <button className="w-full px-6 py-2.5 text-sm font-medium tracking-wider text-white transition-colors duration-300 transform md:w-auto md:mx-4 focus:outline-none bg-gray-800 rounded-lg hover:bg-gray-700 focus:ring focus:ring-gray-300 focus:ring-opacity-80">
                                    Subscribe
                                </button>
                            </div>
                        </div>

                        {/* Categories Section */}
                        <div>
                            <p className="font-semibold text-gray-800 dark:text-white">Categories</p>
                            <div className="flex flex-col mt-5 space-y-2">
                                {["T-Shirts", "Shirts", "Hoodies & Sweatshirts", "Jackets & Coats", "Jeans", "Trousers", "Skirts"].map((category) => (
                                    <Link
                                        key={category}
                                        href={`/products?cat=${encodeURIComponent(category.trim())}`}
                                        className="text-gray-600 hover:text-blue-500 dark:text-gray-300 dark:hover:text-blue-400"
                                    >
                                        {category}
                                    </Link>
                                ))}
                            </div>
                        </div>

                        <div>
                            <p className="font-semibold text-gray-800 dark:text-white">Industries</p>

                            <div className="flex flex-col items-start mt-5 space-y-2">
                                <p className="text-gray-600 transition-colors duration-300 dark:text-gray-300 dark:hover:text-blue-400 hover:underline hover:cursor-pointer hover:text-blue-500">Retail & E-Commerce</p>
                                <p className="text-gray-600 transition-colors duration-300 dark:text-gray-300 dark:hover:text-blue-400 hover:underline hover:cursor-pointer hover:text-blue-500">Information Technology</p>
                                <p className="text-gray-600 transition-colors duration-300 dark:text-gray-300 dark:hover:text-blue-400 hover:underline hover:cursor-pointer hover:text-blue-500">Finance & Insurance</p>
                            </div>
                        </div>
                    </div>
                    
                    <hr className="my-6 border-gray-200 md:my-8 dark:border-gray-700 h-2" />
                    
                    <div className="sm:flex sm:items-center sm:justify-center mx-auto">
                        
                        <div className="flex gap-4 hover:cursor-pointer sm:self-center">
                            <img src="https://www.svgrepo.com/show/303114/facebook-3-logo.svg" width="30" height="30" alt="fb" />
                            <img src="https://www.svgrepo.com/show/303115/twitter-3-logo.svg" width="30" height="30" alt="tw" />
                            <img src="https://www.svgrepo.com/show/303145/instagram-2-1-logo.svg" width="30" height="30" alt="inst" />
                            <img src="https://www.svgrepo.com/show/22037/path.svg" width="30" height="30" alt="pn" />
                        </div>
                    </div>
                    <p className="px-8 py-4 text-center md:text-center md:text-lg md:p-4">© {year} ahịa</p>
                </div>
            </footer>
        </div>
    );
}