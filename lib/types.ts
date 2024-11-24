// types.ts
export interface ProductTableType {
  id: string;
  name: string;
  main_image_url: string;
  category_name: string;
  sku: string;
}

export type ProductDetails = {
  id: string;
  name: string;
  sku: string;
  category_name: string;
  tags: string[];
  price: string;
  weight: string;
  images: string[];
  description: string;
  quantities: { [size: string]: number };
  subCategory: string;
};

export interface ProductData {
  id: string;
  productName: string;
  sku: string;
  category: string;
  tags: string[];
  price: string;
  weight: string;
  images: string[];
  description: string;
  quantities: { [size: string]: number };
  subCategory: string;
}

// A helper function to map ProductDetails to ProductData
export const mapProductDetailsToProductData = (
  details: ProductDetails
): ProductData => ({
  id: details.id,
  productName: details.name,
  sku: details.sku,
  category: details.category_name,
  tags: details.tags,
  price: details.price,
  weight: details.weight,
  images: details.images,
  description: details.description,
  quantities: details.quantities,
  subCategory: details.subCategory,
});

export interface UserDetails {
  firstname: string;
  lastname: string;
  email: string;
}

export type Product = {
  created_at?: string;
  brand_id?: string;
  category_id?: string;
  name?: string;
  description?: string;
  price?: number;
  id: string;
  updated_at?: string;
  subcategory_id?: string;
  qr_code_url?: string;
  weight?: number;
  quantity?: number;
  sku?: string;
  image_urls?: string[];
  tags?: string[];
  main_image_url?: string;
};

export interface ProductsListType {
  index: number;
  id: string;
  name: string;
  main_image_url: string;
  price?: string;
  source: "brand" | "product" | "tag";
}
