import React from 'react';

interface NoMessagesSvgProps {
    className?: string;
    width?: string | number;
    height?: string | number;
}

const NoMessagesSvg: React.FC<NoMessagesSvgProps> = ({
    className,
    width = 100,
    height = 100,
}) => {
    return (
        <svg
            className={className}
            width={width}
            height={height}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            <line x1="8" y1="7" x2="16" y2="7"></line>
        </svg>
    );
};

export default NoMessagesSvg;
