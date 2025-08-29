import { create } from 'zustand';
import { MultiVariantGeneralDetailsInterface } from '@/components/brand-dashboard/add-product/general-details-form';

const DEFAULT_GENERAL_DETAILS: MultiVariantGeneralDetailsInterface = {
    productName: "",
    productDescription: "",
    category: "",
    subCategory: "",
    tags: [],
    gender: "",
    season: "",
};

interface ProductFormState {
  generalDetails: MultiVariantGeneralDetailsInterface;
  setGeneralDetails: (updates: Partial<MultiVariantGeneralDetailsInterface>) => void;

  productId: string,
  setProductId: (newProductId: string) => void;
}

export const useProductFormStore = create<ProductFormState>((set) => ({
  generalDetails: DEFAULT_GENERAL_DETAILS,
  setGeneralDetails: (updates) => set((state) => ({ generalDetails: { ...state.generalDetails, ...updates } })),

  productId: '',
  setProductId: (newProductId) => set({ productId: newProductId}),
}));