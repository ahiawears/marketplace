import { create } from 'zustand';

interface ProductFormState {
  category: string;
  setCategory: (newCategory: string) => void;

  isShippingConfigSet: boolean,
  setIsShippingConfigSet: (newIsShippingConfigSet: boolean) => void;
}

export const useProductFormStore = create<ProductFormState>((set) => ({
  category: '',

  setCategory: (newCategory) => set({ category: newCategory }),

  isShippingConfigSet: false,
  setIsShippingConfigSet: (newIsShippingConfigSet) => set({ isShippingConfigSet: newIsShippingConfigSet }),

}));