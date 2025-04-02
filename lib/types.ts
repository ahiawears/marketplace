// types.ts
export interface ProductTableType {
  id: string;
  name: string;
  main_image_url: string;
  category_name: string;
  sku: string;
}

// export interface OrderTableType {
//   order_id: string;
//   customer_id: string;
//   status: string;
// }

export type Customer = {
  name: string;
  email: string;
  phone: string;
  shippingAddress: string;
};

export type Shipping = {
  method: string;
  trackingNumber: string | null;
  estimatedDelivery: string;
};

export type Order = {
  id: string;
  date: string;
  status: "Processing" | "Shipped" | "Delivered" | "Cancelled";
  total: number;
  customer: Customer;
  products: Product[];
  shipping: Shipping;
};

export type OrderTableType = Order;

export type OrderType = {
  id: string;
  date: string;
  status: string;
  total: number;
  customer: {
      name: string;
      email: string;
      phone: string;
      shippingAddress: string;
  };
  products: {
      name: string;
      image: string;
      quantity: number;
      price: number;
  }[];
  shipping: {
      method: string;
      trackingNumber: string | undefined;
      estimatedDelivery: string;
  };
};


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
  colorName: string;
  colorHex: string;
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
  colorName: string;
  colorHex: string;
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
  colorName: details.colorName,
  colorHex: details.colorHex,
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
  categoryName?: string;
};

export interface ProductsListType {
  index: number;
  id: string;
  name?: string;
  main_image_url: string;
  price?: string;
  source: "brand" | "product" | "tag";
  liked?: boolean;
}

export interface UserAddressType {
  id: string;
  city: string;
  address: string;
  post_code: string;
  country: string;
  county: string;
  mobile: string;
  country_code: string;
}

// export interface ProductShippingDeliveryType {
//   shippingMethods: string[];
//   shippingZones: string[];
//   estimatedDelivery: { [zone: string]: string }; // e.g., { "US": "3-5 days" }
//   shippingFees: { [zone: string]: number }; // e.g., { "US": 10, "UK": 15 }
//   freeShippingThreshold?: number;
//   handlingTime: string; // e.g., "1-2 days"
//   weight: number | string;
//   dimensions: { length: number; width: number; height: number };
//   customsDuties?: boolean;
//   shippingRestrictions?: string;
// }

export interface ShippingDeliveryType {
  shippingMethods: string[]; // ["Standard", "Express", "Local Pickup"]
  shippingZones: string[]; // ["NG", "GH", "KE", "ZA", "TZ", "UG", "Continental"]
  estimatedDelivery: { 
    [zone: string]: string; // {"NG": "2-3 days", "Continental": "7-14 days"}
  };
  shippingFees: {
    [zone: string]: number; // {"NG": 5, "GH": 8, "Continental": 25}
  };
  freeShippingThreshold?: number; // 50 (USD)
  handlingTime: string; // "1-3 business days"
  weight: number; // in kg
  dimensions: {
    length: number; // in cm
    width: number;
    height: number;
  };
  customsDuties?: 'seller-paid' | 'buyer-paid' | 'duty-free';
  shippingRestrictions?: string;
  // Africa-specific additions:
  localCourierOptions?: { // For last-mile delivery partners
    [country: string]: string[]; // {"NG": ["GIG Logistics", "Jumia Express"]}
  };
  intraAfricaTradeCompliant?: boolean; // AfCFTA compliance
  cashOnDelivery?: boolean; // Important for African markets
}

export interface ReturnRefundPolicyType {
  returnWindow: number; // e.g., 30 days
  refundMethod: "store_credit" | "bank_refund" | "replacement";
  returnShipping: "customer_pays" | "free_returns";
  conditions: string;
}


export interface ProductVariantType {
  main_image_url: string;
  productId: string;
  variantName: string;
  images: string[];
  colorName: string;
  price: string;
  colorHex: string;
  sku: string;
  measurementUnit: string;
  measurements: { 
    [size: string]: {
      [measurement: string]: number;
      quantity: number;
    };
  };
  productCode: string;
}

export interface GeneralProductDetailsType {
  productName: string;
  productDescription: string;
  category: string;
  subCategory: string;
  tags: string[];
  currency: string;
  material: string;
}

export interface ProductUploadData {
  generalDetails: GeneralProductDetailsType;
  productVariants: ProductVariantType[];
  shippingDelivery: ShippingDeliveryType;
  returnRefundPolicy: ReturnRefundPolicyType;
}

export interface PhysicalAttributesType {
	weight: string;
	height: string;
	width: string;
	depth: string;
}


export interface ProductInformation {
	variantTexts: {
		name: string;
		product_code: string;
		sku: string;
		price: number;
		color_id: {
			name: string;
			hex_code: string;
		}
		main_product_id: {
			id: string;
			product_description: string;
			category_id: {
				name: string;
			}
			subcategory_id: {
				name: string;
			}
			currency_id: {
				name: string;
			}
			material_id: {
				name: string;
			}
		}
	}
	variantTags: {
		tag_id: {
			name: string;
		}
	}[]
	variantImages: {
		image_url: string;
		is_main: boolean;
	}[]
	measurementsData: {
		value: number;
		measurement_type_id: {
			name: string;
		}
		product_size_id: {
			quantity: number;
			size_id: {
				name: string;
			}
			product_id: string;
		}
	}
}

export interface BrandSubAccounts {
  account_bank: string;
  account_number: string;
  bank_name: string;
  business_name: string;
  country: string;
  split_value: number;
  business_mobile: string;
  business_email: string;
  business_contact: string;
  business_contact_mobile: string;
  split_type: string;
  subaccount_id: string;
}

export interface BrandOnboarding {
  brandInformation: {
    brand_name: string;
    brand_description: string;
    brand_logo: string;
    brand_banner: string;
  }
  contactInformation: {
    business_email: string;
    phone_number: string;
    social_media: {
      website: string;
      facebook: string;
      instagram: string;
      twitter: string;
      tiktok: string;
    }
  }
  businessDetails: {
    country_of_registration: string;
    business_registration_name: string;
    business_registration_number: string;
  }
  paymentInformation: BrandSubAccounts;
}

export type BrandContactDetails = {
  brand_contact_details: {
    brand_email: string;
    phone_number: string;
  }
  facebook: string;
  instagram: string;
  twitter: string;
  tiktok: string;
  website: string;
}