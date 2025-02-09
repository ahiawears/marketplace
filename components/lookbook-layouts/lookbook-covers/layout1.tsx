import Image from "next/image";

export const LookbookLayout1 = () => {
    return (
        <div className="container px-0 m-auto ">
            <div className="w-full md:w-full lg:w-full sm:w-full h-full bg-white lg:mx-auto md:mx-auto border-2">
                <div className="container h-full px-2 flex flex-col">
                    <div className="m-auto relative">
                        {/* Title */}
                        <div className="my-2 sm:my-2 md:my-2 lg:my-2 flex-none">
                            <h2 className="text-center text-2xl font-bold tracking-tight">
                                Title
                            </h2>
                        </div>

                        {/* Cover image */}
                        <div className="flex-grow m-auto my-5">
                            <Image 
                                src={ "https://placehold.co/510x600.png?text=Drop+the+products+main+image+here+or+click+here+to+browse" }
                                alt="collection-cover"
                                objectFit="cover"
                                width={510}
                                height={600}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}