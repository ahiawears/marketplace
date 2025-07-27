// types.ts
export interface ProductTableType {
  id: string;
  name: string;
  category_name: string;
  subCategory: string;
  season: string;
}

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

export interface ShippingConfigType {
  shippingMethods: {
    sameDayDelivery: boolean;
    standardShipping: boolean;
    expressShipping: boolean;
    internationalShipping: boolean;
  };
  shippingZones: {
    domestic: boolean;
    regional: boolean;
    international: boolean;
  };
  handlingTime: {
    from: number;
    to: number;
  };
  shippingFees: {
      sameDayFee: number;
      standardFee: number;
      expressFee: number;
      internationalFee: number;
  };
  defaultPackage: {
      weight: number;
      dimensions: {
          dimensionsUnit: "Inch" | "Centimeter"
          length: number;
          width: number;
          height: number;
      };
  };
  freeShippingThreshold?: number;
  freeShippingMethod?: string;
  estimatedDeliveryTimes: {
      domestic: { from: string; to: string };
      regional: { from: string; to: string };
      international: { from: string; to: string };
  };
}

export interface ShippingDetails {
  shippingMethods: {
      sameDayDelivery: boolean;
      standardShipping: boolean;
      expressShipping: boolean;
      internationalShipping: boolean;
  };
  shippingZones: {
      domestic: boolean;
      regional: boolean;
      international: boolean;
  };
  handlingTime: {
    from: number;
    to: number;
  };
  shippingFees: {
      sameDayFee: number;
      standardFee: number;
      expressFee: number;
      internationalFee: number;
  };
  defaultPackage: {
      weight: number;
      dimensions: {
          dimensionsUnit: "Inch" | "Centimeter"
          length: number;
          width: number;
          height: number;
      };
  };
  ifSameDay:{
      cutOffTime: string,
      timeZone: string,
      cutOffDays: string[]
  },
  freeShippingThreshold?: number;
  freeShippingMethod?: string;
  estimatedDeliveryTimes: {
      domestic: { from: string; to: string };
      regional: { from: string; to: string };
      international: { from: string; to: string };
  };
}

export interface ShippingConfigDataProps {
  handlingTime: {
    from: number;
    to: number;
  }
  shippingMethods: {
      sameDayDelivery: {
          available: boolean;
          fee: number;
          estimatedDelivery?: {  
              cutOffTime: string;  
              timeZone: string;  
          };
          conditions?: {
              applicableCities?: string[];
              excludePublicHolidays: boolean;
          };
      };
      standardShipping: {
          available: boolean;
          estimatedDelivery: { 
              domestic: { from: number; to: number; fee: number; }; 
              regional: { from: number; to: number; fee: number;  }; 
              sub_regional: { from: number; to: number; fee: number;  };
              global: { from: number; to: number; fee: number;  }; 
          };
      };
      expressShipping: {
          available: boolean;
          estimatedDelivery: {
              domestic: { from: number; to: number; fee: number; };
              regional: { from: number; to: number; fee: number; };
              sub_regional: { from: number; to: number; fee: number; };
              global: { from: number; to: number; fee: number; };
          };
      };
    
  };
  shippingZones: {
      domestic: {
          available: boolean;
          excludedCities: string[];
      };
      regional: {
          available: boolean;
          excludedCountries: string[];
      };
      sub_regional: {
          available: boolean;
          excludedCountries: string[];
      }
      global: {
          available: boolean;
          excludedCountries: string[];
      };
  }
  freeShipping?: {
      available: boolean;
      threshold: number; 
      applicableMethods: ("standard" | "express")[];
      excludedCountries?: string[];
  }
}

export interface DatabaseShippingData {
  id: string;
  brand_id: string;
  handling_time_from: number;
  handling_time_to: number;
  free_shipping_threshold?: number;
  free_shipping_method?: string;
  default_package: {
      id: string;
      width: number;
      height: number;
      length: number;
      weight: number;
      dimensions_unit?: "Inch" | "Centimeter"; // Assuming it might be in the DB
  };
  shipping_methods: { method_type: string; is_active: boolean; fee: number }[];
  shipping_zones: { zone_type: string; is_active: boolean; delivery_time_from: string; delivery_time_to: string }[];
  created_at: string;
  updated_at: string;
}

// Defines the standard delivery zone keys
export type DeliveryZoneKey = 'domestic' | 'sub_regional' | 'regional' | 'global';

// Configuration for a specific shipping method (e.g., standard, express) for a product within a specific zone
export interface ProductMethodZoneConfig {
  available?: boolean;
  fee?: number;
}

export interface ProductShippingDeliveryType {
  productId: string;
  methods?: {
    standard?: Partial<Record<DeliveryZoneKey, ProductMethodZoneConfig>>;
    express?: Partial<Record<DeliveryZoneKey, ProductMethodZoneConfig>>;
    sameDay?: {
      available?: boolean;
      fee?: number;
    };
  };
  weight: number;
  dimensions: { length: number; width: number; height: number };
}

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
  imagesDescription: string;
  colorName: string;
  price: number;
  colorHex: string;
  sku: string;
  measurementUnit: string;
  measurements: { 
    [size: string]: {
      [measurement: string]: number | undefined;
      quantity: number | undefined;
    };
  };
  productCode: string;
  colorDescription: string;
  colorHexes: string[];
  mainColor: string; 
  availableDate?: string;
}

export interface GeneralProductDetailsType {
  productName: string;
  productDescription: string;
  category: string;
  subCategory: string;
  tags: string[];
  currency: string;
  material: string;
  gender: string;
  season: string;
}

export interface ProductCareInstruction {
  productId: string;
  washingInstruction?: string | null;
  bleachingInstruction?: string | null;
  dryingInstruction?: string | null;
  ironingInstruction?: string | null;
  dryCleaningInstruction?: string | null;
  specialCases?: string | null;
}

export interface ProductReleaseDetails {
  isPublished: boolean;
  releaseDate?: string;
  timeZone?: string;
}

export interface ProductUploadData {
  generalDetails: GeneralProductDetailsType;
  productVariants: ProductVariantType[];
  shippingDelivery: ProductShippingDeliveryType;
  returnRefundPolicy: ReturnRefundPolicyType;   
  careInstructions: ProductCareInstruction;
  release: ProductReleaseDetails;
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

















// This should hold the important/updated types begin

// Notification Settings Types

export type BrandNotificationType =
  | "new_order"
  | "order_status_update"
  | "review"
  | "payout"
  | "support"
  | "general";

export type Channel = "email" | "sms" | "in_app";

export interface FetchedBrandNotificationSettingFromDB {
  id: string;
  created_at: string;
  brand_id: string;
  notification_type: BrandNotificationType;
  email: boolean;
  sms: boolean;  
  in_app: boolean; 
  updated_at: string | null; 
}


export const BRAND_NOTIFICATION_TYPES: BrandNotificationType[] = [
  "new_order",
  "order_status_update",
  "review",
  "payout",
  "support",
  "general",
];

export const CHANNELS: Channel[] = ["email", "sms", "in_app"];

// This interface is for your table of checkboxes
export interface BrandNotificationSettingCheckboxTable {
  type: BrandNotificationType;
  channels: {
    email: boolean;
    sms: boolean;
    in_app: boolean;
  };
}

// Default settings: all channels set to false for each notification type
export const DEFAULT_BRAND_NOTIFICATION_SETTINGS: BrandNotificationSettingCheckboxTable[] = BRAND_NOTIFICATION_TYPES.map(type => ({
  type,
  channels: {
    email: false,
    sms: false,
    in_app: false,
  },
}));

// Notification Settings Types

// Brand Legal Details Return Type

 export interface BrandLegalDetails {
  business_registration_name: string;
  business_registration_number: string;
  country_of_registration: string;
 }
// Brand Legal Details Return Type




//PRODUCT LIST ITEM DATA BEGINS
export interface tags {
    id: string;
    name: string;
}

export interface NestedRelationalField {
    id: string;
    name: string;
}

export interface ColorField extends NestedRelationalField {
    hex_code: string;
}

export interface ProductImage {
    id: string;
    image_url: string;
    is_main: boolean;
}

// Corrected ProductListItemsDataType
export interface ProductListItemsDataType {
    id: string;
    brand_id: string;
    category_id: NestedRelationalField; // Matches category_id:category_id in select
    name: string;
    product_description: string;
    subcategory: NestedRelationalField; // Matches subcategory_id:subcategory_id
    material: NestedRelationalField;  // Changed from material_id
    currency: NestedRelationalField;  // Changed from currency_id
    season: NestedRelationalField;    // Changed from season_id
    gender: NestedRelationalField;    // Changed from gender_id
    product_tags: tags[];
    is_published: boolean;
    product_variants: {
        id: string;
        name: string;
        color_id: ColorField; // Matches color_id:color_id
        sku: string;
        price: number;
        base_currency_price: number;
        product_code: string;
        color_description: string;
        product_images: ProductImage[];
        images_description: string;
    }[];
}
//PRODUCT LIST ITEM DATA BEGINS


// FILTER OPTION CASES BEGINS
// Base interface for a generic filter option
export interface FilterOption {
    label: string; 
    key: string; 
    options: { label: string; value: string }[];
}

// Specific filter types for different contexts
export interface BrandProductFilterQueries {
    category?: FilterOption;
    productType?: FilterOption;
    color?: FilterOption;
    // priceRange: FilterOption;
    material?: FilterOption;
    // sizeRange: FilterOption;
}

export interface AllProductsFilterQueries {
    category: FilterOption;
    brand: FilterOption; // When filtering all products, you might filter by brand
    priceRange: FilterOption;
    rating: FilterOption;
    // ... other general product filters
}

// You can add more as needed:
// export interface UserOrderFilterQueries {
//     status: FilterOption;
//     dateRange: FilterOption;
// }

// FILTER OPTION CASES ENDS








// This should hold the important/updated types begin