"use client";

import React from "react";
import { Button } from "./button";
import { CheckCircle2, Lock, PencilLine } from "lucide-react";

type AccordionItem = {
  title: string;
  content: React.ReactNode;
  disabled?: boolean;
  description?: string;
  status?: "complete" | "current" | "locked" | "available";
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
		<div className="">
			{items.map((item, index) => (
				<div key={index} className="shadow border-2">
					<Button
						onClick={() => handleToggle(index)}
						disabled={item.disabled}
						className={`w-full rounded-none flex justify-between items-center gap-4 p-4 text-left text-lg font-medium text-gray-800 bg-gray-100 hover:bg-gray-200 focus:outline-none ${item.disabled ? "opacity-60 cursor-not-allowed" : ""}`}
					>
						<div className="min-w-0">
							<div className="flex items-center gap-2">
								<span>{item.title}</span>
								{item.status === "complete" && <CheckCircle2 className="h-4 w-4 text-green-600" />}
								{item.status === "current" && <PencilLine className="h-4 w-4 text-blue-600" />}
								{item.status === "locked" && <Lock className="h-4 w-4 text-gray-500" />}
							</div>
							{item.description && (
								<p className="mt-1 text-sm font-normal text-gray-600 whitespace-normal">
									{item.description}
								</p>
							)}
						</div>
						<div className="flex items-center gap-3">
							{item.status && (
								<span className="hidden sm:inline text-xs uppercase tracking-wide text-gray-500">
									{item.status === "complete"
										? "Saved"
										: item.status === "current"
											? "In progress"
											: item.status === "locked"
												? "Locked"
												: "Ready"}
								</span>
							)}
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
						</div>
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
