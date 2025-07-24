"use client";

import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import axiosInstance from "../utils/axios";

const SERVICE_KEY = "services";

//axios functions
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

//react query and mutation functions
export const useGetAllServices = () => {
  return useQuery({
    queryKey: [SERVICE_KEY],
    queryFn: () => get("/services"),
  });
};

export const useInfiniteServicesBySearchFilter = (filterKey, searchQuery) => {
  return useInfiniteQuery({
    queryKey: [SERVICE_KEY, filterKey, searchQuery],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await axiosInstance.get(
        `/services?${filterKey}=${searchQuery}&page=${pageParam}&limit=10`
      );
      return response.data.data; // Your API wraps in .data
    },
    getNextPageParam: (lastPage) => {
      const { page, pages } = lastPage.pagination;
      return page < pages ? page + 1 : undefined;
    },
  });
};

export const useGetServiceById = (serviceId) => {
  return useQuery({
    queryKey: [SERVICE_KEY, serviceId],
    queryFn: () => get(`/services/${serviceId}`),
  });
};

export const useGetServiceByProviderId = (providerId, options = {}) => {
  return useQuery({
    queryKey: [SERVICE_KEY, providerId],
    queryFn: () => get(`/services/provider/${providerId}`),
    // enabled: !!providerId,
    ...options,
  });
};

export const useCreateService = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => create("/services", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SERVICE_KEY] });
    },
  });
};

export const useUpdateService = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => {
      const { id, ...serviceData } = data;
      return update(`/services/${id}`, serviceData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SERVICE_KEY] });
    },
  });
};

export const useGetServicesByIds = (ids) => {
  const queryIds = Array.isArray(ids) ? ids.join(",") : ids;

  return useQuery({
    queryKey: [SERVICE_KEY, ids],
    queryFn: () => get(`/services?ids=${queryIds}`),
    enabled: !!ids && ids.length > 0,
  });
};

export const useGetServicesByProviderIds = (ids) => {
  const queryIds = Array.isArray(ids) ? ids.join(",") : ids;
  return useQuery({
    queryKey: [SERVICE_KEY, ids],
    queryFn: () => get(`/services?providerIds=${queryIds}&limit=500`),
    enabled: !!ids && ids.length > 0,
  });
};
