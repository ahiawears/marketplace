import React, { useState } from 'react';

interface CustomImageCarouselProps {
    images: string[];
}

const CustomImageCarousel: React.FC<CustomImageCarouselProps> = ({ images }) => {
    const [currentSlide, setCurrentSlide] = useState(0);

    const nextSlide = () => {
        if (currentSlide < images.length / 2 - 1) {
            setCurrentSlide(currentSlide + 1);
        }
    };

    const prevSlide = () => {
        if (currentSlide > 0) {
            setCurrentSlide(currentSlide - 1);
        }
    };

    return (
        <div className="relative w-full flex justify-center items-center">
            {/* Left button */}
            {currentSlide > 0 && (
                <button
                    className="absolute left-0 z-10 bg-gray-300 p-2 rounded-full"
                    onClick={prevSlide}
                >
                    ◀
                </button>
            )}

            {/* Image container */}
            <div className="w-full h-full flex">
                {images.slice(currentSlide * 2, currentSlide * 2 + 2).map((image, index) => (
                    <img
                        key={index}
                        src={image}
                        alt={`Slide ${index + 1}`}
                        className="w-[500px] h-[550px] object-cover"
                    />
                ))}
            </div>

            {/* Right button */}
            {currentSlide < images.length / 2 - 1 && (
                <button
                    className="absolute right-0 z-10 bg-gray-300 p-2 rounded-full"
                    onClick={nextSlide}
                >
                    ▶
                </button>
            )}
        </div>
    );
};

export default CustomImageCarousel;
