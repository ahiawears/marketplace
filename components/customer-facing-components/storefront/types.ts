export interface StorefrontProductCardData {
  variantId: string;
  variantSlug: string;
  productId: string;
  productName: string;
  variantName: string;
  categoryName: string;
  genderName: string;
  description: string;
  price: number | null;
  sku: string;
  productCode: string;
  colorName: string;
  colorHex: string;
  imageUrl: string | null;
  gallery: string[];
}
