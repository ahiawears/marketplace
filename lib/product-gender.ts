export type ProductGenderDisplay = "Men" | "Women" | "Unisex";

const DISPLAY_TO_STORED: Record<ProductGenderDisplay, string> = {
  Men: "Male",
  Women: "Female",
  Unisex: "Unisex",
};

const STORED_TO_DISPLAY: Record<string, ProductGenderDisplay> = {
  male: "Men",
  men: "Men",
  female: "Women",
  women: "Women",
  unisex: "Unisex",
};

export function toStoredProductGender(gender: ProductGenderDisplay): string {
  return DISPLAY_TO_STORED[gender];
}

export function toDisplayProductGender(gender: string | null | undefined): ProductGenderDisplay {
  if (!gender) {
    return "Unisex";
  }

  return STORED_TO_DISPLAY[gender.trim().toLowerCase()] || "Unisex";
}

export function toStoredGenderScope(gender: string | null | undefined): string {
  if (!gender) {
    return "";
  }

  const normalized = gender.trim().toLowerCase();

  if (normalized === "men" || normalized === "male") {
    return "male";
  }

  if (normalized === "women" || normalized === "female") {
    return "female";
  }

  return normalized;
}
