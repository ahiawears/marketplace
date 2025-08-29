import { create } from 'zustand';

interface ProductFormState {
  category: string;
  setCategory: (newCategory: string) => void;

  isShippingConfigSet: boolean,
  setIsShippingConfigSet: (newIsShippingConfigSet: boolean) => void;

  productId: string,
  setProductId: (newProductId: string) => void;

  productName: string,
  setProductName: (newProductName: string) => void;

  baseSlug: string,
  setBaseSlug: (newBaseSlug: string) => void;
}

export const useProductFormStore = create<ProductFormState>((set) => ({
  category: '',

  setCategory: (newCategory) => set({ category: newCategory }),

  isShippingConfigSet: false,
  setIsShippingConfigSet: (newIsShippingConfigSet) => set({ isShippingConfigSet: newIsShippingConfigSet }),

  productId: '',
  setProductId: (newProductId) => set({ productId: newProductId}),

  baseSlug: '',
  setBaseSlug: (newBaseSlug) => set({ baseSlug: newBaseSlug }),

  productName: '',
  setProductName: (newProductName) => set({ productName: newProductName }),
}));