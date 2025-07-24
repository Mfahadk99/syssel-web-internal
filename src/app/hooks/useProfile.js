"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";
import axiosInstance from "../utils/axios";

const PROFILE_KEY = "profiles";

const getAll = async (path) => {
  const response = await axiosInstance.get(path);
  return response.data;
};

const getById = async (path) => {
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

// Create a custom hook to use useQuery
export const useGetProfileById = (id, options = {}) => {
  return useQuery({
    queryKey: [PROFILE_KEY, id],
    queryFn: () => {
      if (!id) {
        throw new Error("Profile ID is required");
      }
      return getById(`/profiles/${id}`);
    },
    enabled: !!id, // Only run query if id is truthy
    ...options,
  });
};

export const useGetAllProfiles = () => {
  return useQuery({
    queryKey: [PROFILE_KEY],
    queryFn: () => getAll("/profiles"),
  });
};

export const useGetBuyerProfiles = () => {
  return useQuery({
    queryKey: [PROFILE_KEY],
    queryFn: () => getAll("/profiles?profileType=buyer"),
  });
};

export const useGetProviderProfiles = () => {
  return useQuery({
    queryKey: [PROFILE_KEY],
    queryFn: () => getAll("/profiles?profileType=provider"),
  });
};

export const useCreateProfile = () => {
  return useMutation({
    mutationFn: (data) => {
      // Destructure id from data
      const { id, ...profileData } = data;
      // Use id in URL but send only profileData in body
      return create(`/profiles/${id}`, profileData);
    },
  });
};

// Updated to match useInfiniteServicesBySearchFilter pattern
export const useGetProfilesBySearchFilter = (filterKey, searchQuery) => {
  return useInfiniteQuery({
    queryKey: [PROFILE_KEY, filterKey, searchQuery],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await axiosInstance.get(
        `/profiles?${filterKey}=${searchQuery}&page=${pageParam}&limit=10`
      );
      return response.data.data; // Your API wraps in .data
    },
    getNextPageParam: (lastPage) => {
      const { page, pages } = lastPage.pagination;
      return page < pages ? page + 1 : undefined;
    },
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => update(`/profiles/${data.id}`, data),
    onSuccess: (data, variables) => {
      // Invalidate the updated profile by ID
      queryClient.invalidateQueries({ queryKey: [PROFILE_KEY, variables.id] });
      queryClient.invalidateQueries({ queryKey: [PROFILE_KEY] });
      queryClient.invalidateQueries({ queryKey: [PROFILE_KEY, "buyer"] });
      queryClient.invalidateQueries({ queryKey: [PROFILE_KEY, "provider"] });
    },
  });
};

export const useGetAllProfilesByIds = (ids) => {
  const queryIds = Array.isArray(ids) ? ids.join(",") : ids;
  return useQuery({
    queryKey: [PROFILE_KEY, ids],
    queryFn: () => getAll(`/profiles?ids=${queryIds}&limit=500`),
    enabled: !!ids && ids.length > 0,
  });
};

export const useGetAllProfilesBySearch = (search) => {
  return useQuery({
    queryKey: [PROFILE_KEY, search],
    queryFn: () =>
      getAll(`/profiles?profileType=buyer&search=${search}&limit=500`),
    // enabled: !!search && search.length > 0,
  });
};

export const useGetAllProfilesByUserIds = (ids) => {
  const queryIds = Array.isArray(ids) ? ids.join(",") : ids;
  return useQuery({
    queryKey: [PROFILE_KEY, ids],
    queryFn: () => getAll(`/profiles?userIds=${queryIds}&limit=500`),
    enabled: !!ids && ids.length > 0,
  });
};
