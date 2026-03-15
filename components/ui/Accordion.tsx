"use client";

import React from "react";
import { CheckCircle2, Lock, PencilLine } from "lucide-react";
import { cn } from "@/lib/utils";

export type AccordionItem = {
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
	const getStatusLabel = (status: AccordionItem["status"]) => {
		switch (status) {
			case "complete":
				return "Saved";
			case "current":
				return "In progress";
			case "locked":
				return "Locked";
			case "available":
				return "Ready";
			default:
				return null;
		}
	};

  const getStatusClasses = (status: AccordionItem["status"]) => {
		switch (status) {
			case "complete":
				return "text-green-700";
			case "current":
				return "text-blue-700";
			case "locked":
				return "text-gray-600";
			case "available":
				return "text-amber-700";
			default:
				return "text-gray-500";
		}
  };

  const handleToggle = (index: number) => {
    if (items[index].disabled) return;
    setActiveIndex(activeIndex === index ? null : index); 
  };

	return (
		<div className="">
			{items.map((item, index) => (
				<div key={index} className="shadow border-2">
					<button
						type="button"
						onClick={() => handleToggle(index)}
						disabled={item.disabled}
						className={`w-full rounded-none flex flex-col items-stretch gap-4 bg-gray-100 px-4 py-4 text-left text-gray-800 transition-colors hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:min-h-[112px] sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:px-5 sm:py-5 ${item.disabled ? "cursor-not-allowed opacity-60" : ""}`}
					>
						<div className="min-w-0 flex-1">
							<div className="flex items-center gap-2 leading-tight">
								<span className="block text-base font-medium md:text-lg">{item.title}</span>
								{item.status === "complete" && <CheckCircle2 className="h-4 w-4 text-black outline-2" />}
								{item.status === "current" && <PencilLine className="h-4 w-4 text-black outline-2" />}
								{item.status === "locked" && <Lock className="h-4 w-4 text-black outline-2" />}
							</div>
							{item.description && (
								<p className="mt-2 text-sm leading-6 font-normal text-gray-600 whitespace-normal sm:max-w-3xl sm:pr-2">
									{item.description}
								</p>
							)}
						</div>
						<div className="flex w-full items-center justify-between gap-3 border-t border-gray-300 pt-3 sm:w-auto sm:shrink-0 sm:justify-end sm:self-center sm:border-t-0 sm:pt-0 sm:pl-2">
							{item.status && getStatusLabel(item.status) && (
								<span
									className={cn(
										"inline rounded-none border-0 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] sm:px-3",
										getStatusClasses(item.status)
									)}
								>
									{getStatusLabel(item.status)}
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
