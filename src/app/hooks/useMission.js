import { useQuery, useMutation } from "@tanstack/react-query";
import axiosInstance from "../utils/axios";

const getAll = async (path) => {
  const response = await axiosInstance.get(path);
  return response.data;
};

const create = async (path, data) => {
  const response = await axiosInstance.post(path, data);
  return response.data;
};

const getById = async (path, id) => {
  const response = await axiosInstance.get(`${path}/${id}`);
  return response.data;
};

const MISSION_KEY = "missions";

export const useGetAllMissions = () => {
  return useQuery({
    queryKey: [MISSION_KEY],
    queryFn: () => getAll("/missions"),
  });
};

export const useGetAllMissionsByBuyer = (buyerId) => {
  return useQuery({
    queryKey: [MISSION_KEY, "buyer", buyerId],
    queryFn: () => getAll(`/missions?buyer=${buyerId}`),
    enabled: !!buyerId,
  });
};

export const useGetAllMissionsByCategory = (categoryId) => {
  return useQuery({
    queryKey: [MISSION_KEY, "category", categoryId],
    queryFn: () => getAll(`/missions?category=${categoryId}`),
    enabled: !!categoryId,
  });
};

export const useCreateMission = () => {
  return useMutation({
    mutationFn: (data) => create("/missions", data),
    onSuccess: () => {
      // The component will handle invalidation
    },
  });
};

export const useGetMissionById = (id) => {
  return useQuery({
    queryKey: [MISSION_KEY, "id", id],
    queryFn: () => getById("/missions", id),
    enabled: !!id,
  });
};

export const useGetMissionsByIds = (ids) => {
  const queryIds = Array.isArray(ids) ? ids.join(",") : ids;

  return useQuery({
    queryKey: [MISSION_KEY, "ids", ids],
    queryFn: () => getAll(`/missions?ids=${queryIds}`),
    enabled: !!ids && ids.length > 0,
  });
};
