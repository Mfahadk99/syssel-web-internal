import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../utils/axios";

const getAll = async (path) => {
  const response = await axiosInstance.get(path);
  return response.data;
};


const CATEGORY_KEY = "categories";
const SUBCATEGORY_KEY = "subcategories";

export const useGetAllCategories = () => {
  return useQuery({
    queryKey: [CATEGORY_KEY],
    queryFn: () => getAll("/categories"),
  });
};

export const useGetAllSubCategories = (categoryId) => {
  return useQuery({
    queryKey: [SUBCATEGORY_KEY, categoryId],
    queryFn: () => getAll(`/subcategories?category=${categoryId}`),
  });
};
