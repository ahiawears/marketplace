import Image from "next/image"

export const LookbookLayout2 = () => {
    return (
        <div className="container px-0 m-auto">
            <div className="w-full md:w-full lg:w-full sm:w-full h-full bg-white lg:mx-auto md:mx-auto border-2">
                <div className="container h-full px-2 flex flex-col">
                    <div className="m-auto py-2 relative">
                        <Image 
                            src={ "https://placehold.co/510x600.png?text=Drop+the+products+main+image+here+or+click+here+to+browse" }
                            alt="collection-cover"
                            objectFit="cover"
                            width={510}
                            height={600}
                        />
                        <div className="w-full absolute top-0 left-0 text-center mt-10">
                            <h2 className="text-center text-2xl font-bold tracking-tight">
                                Title
                            </h2>
                            
                        </div>
                    </div>
                </div>
            </div>

        </div>
    )
}