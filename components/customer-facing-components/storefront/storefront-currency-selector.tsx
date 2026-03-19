"use client";

import { useRouter } from "next/navigation";
import { Select } from "@/components/ui/select";
import {
	STOREFRONT_CURRENCY_COOKIE,
	STOREFRONT_CURRENCY_OPTIONS,
} from "@/lib/storefront-currency";

interface StorefrontCurrencySelectorProps {
	selectedCurrency: string;
	className?: string;
}

export function StorefrontCurrencySelector({
	selectedCurrency,
	className,
}: StorefrontCurrencySelectorProps) {
	const router = useRouter();

	const handleCurrencyChange = (nextCurrency: string) => {
		document.cookie = `${STOREFRONT_CURRENCY_COOKIE}=${nextCurrency}; path=/; max-age=31536000; samesite=lax`;
		router.refresh();
	};

	return (
		<div className={className}>
			<Select
				id="storefront-currency"
				value={selectedCurrency}
				onChange={(event) => handleCurrencyChange(event.target.value)}
				className="h-10 min-w-[112px] border-2 text-xs font-semibold tracking-[0.08em]"
			>
				{STOREFRONT_CURRENCY_OPTIONS.map((option) => (
					<option key={option.code} value={option.code}>
						{option.code}
					</option>
				))}
			</Select>
		</div>
	);
}
