"use client";

import React, { useState } from "react";
import { Button } from "./button";

type AccordionItem = {
  title: string;
  content: React.ReactNode;
  disabled?: boolean;
};

type AccordionProps = {
  items: AccordionItem[];
  activeIndex: number | null;
  setActiveIndex: (index: number | null) => void;
};  

const Accordion: React.FC<AccordionProps> = ({ items, activeIndex, setActiveIndex  }) => {

  const handleToggle = (index: number) => {
    if (items[index].disabled) return;
    setActiveIndex(activeIndex === index ? null : index); 
  };

	return (
		<div className="space-y-2">
			{items.map((item, index) => (
				<div key={index} className="rounded-lg shadow border-2">
					<Button
						onClick={() => handleToggle(index)}
						disabled={item.disabled}
						className='w-full flex justify-between items-center p-4 text-left text-lg font-medium text-gray-800 bg-gray-100 hover:bg-gray-200 focus:outline-none ${item.disabled ? "opacity-50 cursor-not-allowed" : ""}'
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
					</Button>
				{activeIndex === index && (
					<div className="p-4 bg-white">{item.content}</div>
				)}
				</div>
			))}
		</div>
	);
};

export default Accordion;
