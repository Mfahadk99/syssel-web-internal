import { useQuery, useMutation } from "@tanstack/react-query";
import axiosInstance from "../utils/axios";
import { queryClient } from "../utils/getQueryClient";

// API
const get = async (path) => {
  const response = await axiosInstance.get(path);
  return response.data;
};

const create = async (path, data) => {
  const response = await axiosInstance.post(path, data);
  return response.data;
};

const update = async (path, data) => {
  const response = await axiosInstance.put(path, data);
  return response.data;
};

const remove = async (path) => {
  const response = await axiosInstance.delete(path);
  return response.data;
};

const REVIEW_KEY = "review";

export const useCreateReview = () => {
    return useMutation({
      mutationFn: (data) => create("/reviews", data),
    });
  };

  export const useUpdateReview = (id) => {
    return useMutation({
      mutationFn: (data) => update(`/reviews/${id}`, data),
      onSuccess: () => {
        queryClient().invalidateQueries({ queryKey: [REVIEW_KEY] });
      },
    });
  };
  