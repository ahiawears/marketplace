import React from 'react';

interface SelectMessageSvgProps {
    className?: string;
    width?: string | number;
    height?: string | number;
}

const SelectMessageSvg: React.FC<SelectMessageSvgProps> = ({
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
            strokeWidth="1"
            strokeLinecap="round"
            strokeLinejoin="round"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            <line x1="8" y1="7" x2="16" y2="7"></line>
            <line x1="8" y1="11" x2="14" y2="11"></line>
        </svg>
    );
};

export default SelectMessageSvg;