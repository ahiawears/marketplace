import Image from "next/image"
import { Button } from "../ui/button"

export const CategoryBento = () => {
    return (
        <div className="bg-[#BFCFBB] shadow-2xl py-24 sm:py-32">
            <div className="mx-auto max-w-2xl px-6 lg:max-w-7xl lg:px-8">
                <h2 className="text-center text-base/7 font-semibold text-indigo-600">
                    Deploy faster
                </h2>
                <p className="mx-auto mt-2 max-w-lg text-balance text-center text-4xl font-semibold tracking-tight text-gray-950 sm:text-5xl">
                    Everything you need to deploy your app
                </p>
                <div className="mt-10 grid gap-4 sm:mt-16 lg:grid-cols-3 lg:grid-rows-1">
                    <div className="mx-auto lg:basis-1/3 md:basis-2/3 basis-10/12">
                        <div className="relative mb-8 block cursor-pointer">
                            <Image 
                                width={370}
                                height={470}
                                alt="dress"
                                src={"https://placehold.co/370x470.png?text=Drop+the+products+main+image+here+or+click+here+to+browse"}
                                className="inset-0 transition duration-500 ease-in-out hover:h-[475px] hover:w-[375px]"
                                priority
                            />
                            <div className="absolute left-1/2 transform -translate-x-1/2 bottom-5 w-44 m-0">
                                <Button className="flex justify-center items-center w-full">
                                    Dresses
                                </Button>
                            </div>
                        </div>

                        <div className="relative mb-8 block cursor-pointer">
                            <Image 
                                width={370}
                                height={350}
                                alt="sunglasses"
                                src={"https://placehold.co/370x350.png?text=Drop+the+products+main+image+here+or+click+here+to+browse"}
                                className="  inset-0 transition duration-500 ease-in-out hover:h-[355px] hover:w-[375px]"
                                priority
                            />
                            <div className="absolute left-1/2 transform -translate-x-1/2 bottom-5 w-44">
                                <Button className="flex justify-center items-center w-full">
                                    Sunglasses
                                </Button>
                            </div>
                        </div>

                    </div>





                    <div className="mx-auto lg:basis-1/3 md:basis-2/3 basis-10/12">
                        <div className="relative mb-8 block cursor-pointer">
                            <Image 
                                width={370}
                                height={350}
                                alt="watches"
                                src={"https://placehold.co/370x350.png?text=Drop+the+products+main+image+here+or+click+here+to+browse"}
                                className=" inset-0 transition duration-500 ease-in-out hover:h-[355px] hover:w-[375px]"
                                priority
                            />
                            <div className="absolute left-1/2 transform -translate-x-1/2 bottom-5 w-44">
                                <Button className="flex justify-center items-center w-full">
                                    Watches
                                </Button>
                            </div>
                        </div>

                        <div className="relative mb-8 block cursor-pointer">
                            <Image 
                                width={370}
                                height={470}
                                alt="watches"
                                src={"https://placehold.co/370x470.png?text=Drop+the+products+main+image+here+or+click+here+to+browse"}
                                className=" inset-0 transition duration-500 ease-in-out hover:h-[475px] hover:w-[375px]"
                                priority
                            />
                            <div className="absolute left-1/2 transform -translate-x-1/2 bottom-5 w-44">
                                <Button className="flex justify-center items-center w-full">
                                    Watches
                                </Button>
                            </div>
                        </div>
                    </div>





                    <div className="mx-auto lg:basis-1/3 md:basis-2/3 basis-10/12">
                        <div className="relative mb-8 block cursor-pointer">
                            <Image 
                                width={370}
                                height={470}
                                alt="bags"
                                src={"https://placehold.co/370x470.png?text=Drop+the+products+main+image+here+or+click+here+to+browse"}
                                className=" inset-0 transition duration-500 ease-in-out hover:h-[475px] hover:w-[375px]"
                                priority
                            />
                            <div className="absolute left-1/2 transform -translate-x-1/2 bottom-5 w-44">
                                <Button className="flex justify-center items-center w-full">
                                    Bags
                                </Button>
                            </div>
                        </div>

                        <div className="relative mb-8 block cursor-pointer">
                            <Image 
                                width={370}
                                height={350}
                                alt="watches"
                                src={"https://placehold.co/370x350.png?text=Drop+the+products+main+image+here+or+click+here+to+browse"}
                                className=" inset-0 transition duration-500 ease-in-out hover:h-[355px] hover:w-[375px]"
                                priority
                            />
                            <div className="absolute left-1/2 transform -translate-x-1/2 bottom-5 w-44">
                                <Button className="flex justify-center items-center w-full">
                                    Watches
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
  