"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../utils/axios";

const SALES_KEY = "sales";

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

const deleteSale = async (path) => {
  const response = await axiosInstance.delete(path);
  return response.data;
};

// Create a custom hook to use useQuery
export const useGetSaleById = (id) => {
  return useQuery({
    queryKey: [SALES_KEY, id],
    queryFn: () => {
      if (!id) {
        throw new Error("Sale ID is required to fetch sale");
      }
      return get(`/sales/${id}`);
    },
    enabled: !!id,
  });
};

export const useGetSaleByUserId = (id) => {
  return useQuery({
    queryKey: [SALES_KEY, "user", id],
    queryFn: () => {
      if (!id) {
        throw new Error("User ID is required to fetch sales");
      }
      return get(`/sales/${id}`);
    },
    enabled: !!id,
  });
};

export const useGetAllSales = () => {
  return useQuery({
    queryKey: [SALES_KEY],
    queryFn: () => get("/sales"),
  });
};

export const useGetAllSalesByProviderId = (id) => {
  return useQuery({
    queryKey: [SALES_KEY, "provider", id],
    queryFn: () => get(`/sales?providerId=${id}`),
    enabled: !!id,
  });
};

export const useCreateSale = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => {
      return create("/sales", data);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: [SALES_KEY] });
      // Invalidate the specific service query to refresh service data with new sale
      if (variables.service) {
        queryClient.invalidateQueries({
          queryKey: ["services", variables.service],
        });
      }
    },
  });
};

export const useUpdateSale = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => {
      const { service, ...saleData } = data;
      return update(`/sales/${service}`, saleData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SALES_KEY] });
    },
  });
};

export const useGetAllSalesByIds = (ids) => {
  const queryIds = Array.isArray(ids) ? ids.join(",") : ids;
  return useQuery({
    queryKey: [SALES_KEY, "ids", ids],
    queryFn: () => get(`/sales?ids=${queryIds}&limit=200`),
    enabled: !!ids && ids.length > 0,
  });
};

export const useDeleteSale = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => {
      return deleteSale(`/sales/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SALES_KEY] });
    },
  });
};
