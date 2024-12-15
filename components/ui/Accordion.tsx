"use client";

import React, { useState } from "react";

type AccordionItem = {
  title: string;
  content: React.ReactNode;
};

type AccordionProps = {
  items: AccordionItem[];
};

const Accordion: React.FC<AccordionProps> = ({ items }) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(0);

  const handleToggle = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index); 
  };

  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <div key={index} className="border border-gray-300 rounded-lg shadow">
          <button
            onClick={() => handleToggle(index)}
            className="w-full flex justify-between items-center p-4 text-left text-lg font-medium text-gray-800 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring"
          >
            <span>{item.title}</span>
            <svg
              className={`h-5 w-5 transition-transform ${
                activeIndex === index ? "rotate-180" : ""
              }`}
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
          {activeIndex === index && (
            <div className="p-4 bg-white">{item.content}</div>
          )}
        </div>
      ))}
    </div>
  );
};

export default Accordion;
