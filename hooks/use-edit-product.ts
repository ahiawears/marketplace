import { Product } from "@/lib/types";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";

export const useEditProduct = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: (product: Product) => axios.put("/api/edit-product", product),
    onSuccess: () => {
      toast({
        title: "Product updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error updating product",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};
