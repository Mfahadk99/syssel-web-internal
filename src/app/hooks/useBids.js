import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../utils/axios";
import { useMutation } from "@tanstack/react-query";

const getAll = async (path) => {
  const response = await axiosInstance.get(path);
  return response.data;
};

const create = async (path, data) => {
  const response = await axiosInstance.post(path, data);
  return response.data;
};

const BID_KEY = "bids";

export const useGetAllBids = () => {
  return useQuery({
    queryKey: [BID_KEY],
    queryFn: () => getAll("/bids"),
  });
};

export const useGetAllBidsByMission = (missionId, options = {}) => {
  return useQuery({
    queryKey: [BID_KEY, missionId],
    queryFn: () => getAll(`/bids?mission=${missionId}`),
    enabled: !!missionId,
    ...options,
  });
};

export const useGetAllBidsByProvider = (providerId) => {
  return useQuery({
    queryKey: [BID_KEY, providerId],
    queryFn: () => getAll(`/bids?provider=${providerId}`),
  });
};

export const useGetBidById = (bidId) => {
  return useQuery({
    queryKey: [BID_KEY, bidId],
    queryFn: () => getAll(`/bids/${bidId}`),
  });
};

export const useCreateBid = () => {
  return useMutation({
    mutationFn: (data) => create("/bids", data),
  });
};
