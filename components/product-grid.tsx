import React from "react";
import { ProductCard } from "./product-card";

type Props = {
  title?: string;
};

export const ProductGrid = (props: Props) => {
	return (
		<section className="container flex flex-col gap-8">
			<h2 className="font-bold text-3xl">{props.title}</h2>
			<div className="grid md:grid-cols-3 gap-8">
				
			</div>
		</section>
	);
};
