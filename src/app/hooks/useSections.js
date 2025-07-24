"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../utils/axios";

const SECTION_KEY = "sections";

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

const remove = async (path) => {
  const response = await axiosInstance.delete(path);
  return response.data;
};

//react query and mutation functions
export const useGetAllSections = () => {
  return useQuery({
    queryKey: [SECTION_KEY],
    queryFn: () => get("/sections"),
  });
};

export const useGetSectionsByFilter = (filter, value, options = {}) => {
  return useQuery({
    queryKey: [SECTION_KEY, filter, value],
    queryFn: () => get(`/sections?${filter}=${value}`),
    enabled: !!filter && !!value, // Only run if both are truthy
    ...options, // Allows passing custom options like `enabled`
  });
};

export const useCreateSection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => create("/sections", data),
    onSuccess: () => {
      // Invalidate sections and gallery queries
      queryClient.invalidateQueries({ queryKey: [SECTION_KEY] });
      queryClient.invalidateQueries({ queryKey: ["gallery"] });
    },
  });
};

export const useUpdateSection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => update("/sections", data),
    onSuccess: () => {
      // Invalidate sections queries
      queryClient.invalidateQueries({ queryKey: [SECTION_KEY] });
    },
  });
};

export const useRemoveSection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => remove(`/sections/${id}`),
    onSuccess: () => {
      // Invalidate sections and gallery queries
      queryClient.invalidateQueries({ queryKey: [SECTION_KEY] });
      queryClient.invalidateQueries({ queryKey: ["gallery"] });
    },
  });
};
