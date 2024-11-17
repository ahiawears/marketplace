import { Product } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export const useGetProductDetails = (id: string) => {
  return useQuery({
    queryKey: ["product", id],
    queryFn: () => axios.get<Product>(`/api/product/${id}`),
  });
};
