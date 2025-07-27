import { ProductListItemsDataType } from "@/lib/types";

export const getUniqueCategories = (products: ProductListItemsDataType[]) => {
  const categories = new Map<string, { label: string; value: string }>();
  
  products?.forEach(product => {
    if (product.category_id && product.category_id.name && product.category_id.id) {
      categories.set(product.category_id.id, {
        label: product.category_id.name,
        value: product.category_id.id
      });
    }
  });
  
  return Array.from(categories.values());
};

export const getUniqueSubcategories = (products: ProductListItemsDataType[]) => {
  const subcategories = new Map<string, { label: string; value: string }>();
  
  products?.forEach(product => {
    if (product.subcategory && product.subcategory.name && product.subcategory.id) {
      subcategories.set(product.subcategory.id, {
        label: product.subcategory.name,
        value: product.subcategory.id
      });
    }
  });
  
  return Array.from(subcategories.values());
};

export const getUniqueMaterials = (products: ProductListItemsDataType[]) => {
  const materials = new Map<string, { label: string; value: string }>();
  
  products?.forEach(product => {
    if (product.material && product.material.name && product.material.id) {
      materials.set(product.material.id, {
        label: product.material.name,
        value: product.material.id
      });
    }
  });
  
  return Array.from(materials.values());
};

export const getUniqueColors = (products: ProductListItemsDataType[]) => {
  const colors = new Map<string, { label: string; value: string }>();
  
  products?.forEach(product => {
    product.product_variants?.forEach((variant) => {
      if (variant.color_id && variant.color_id.name && variant.color_id.id) {
        colors.set(variant.color_id.id, {
          label: variant.color_id.name,
          value: variant.color_id.id
        });
      }
    });
  });
  
  return Array.from(colors.values());
};

export const generateFilterOptions = (products: ProductListItemsDataType[]) => {
  return {
    category: {
      label: "Category",
      key: "category",
      options: getUniqueCategories(products),
    },
    productType: {
      label: "Product Type",
      key: "productType",
      options: getUniqueSubcategories(products),
    },
    color: {
      label: "Color",
      key: "color",
      options: getUniqueColors(products),
    },
    material: {
      label: "Material",
      key: "material",
      options: getUniqueMaterials(products),
    },
  };
};