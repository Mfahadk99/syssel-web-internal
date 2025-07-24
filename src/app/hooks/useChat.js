import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../utils/axios";
import { useMutation } from "@tanstack/react-query";

const create = async (path, data) => {
  const response = await axiosInstance.post(path, data);
  return response.data;
};

const getById = async (path, id) => {
  const response = await axiosInstance.get(`${path}/${id}`);

  // console.log("responseresponseresponseresponse", response);
  return response.data;
};

const update = async (path, data) => {
  const response = await axiosInstance.put(path, data);
  return response.data;
};

const CHAT_KEY = "chat";

export const useCreateMessage = () => {
  return useMutation({
    mutationFn: (data) => create("/chat/message", data),
  });
};

export const useGetMessageHistoryById = (id) => {
  return useQuery({
    queryKey: [CHAT_KEY, id],
    queryFn: () => getById("/chat/history", id),
    refetchOnMount: true,
  });
};

export const useGetRecentConversation = (id) => {
  return useQuery({
    queryKey: [CHAT_KEY, id],
    queryFn: () => getById("/chat/conversations", id),
  });
};

export const useCheckIfRoomExist = (buyerId, bidderId, enabled) => {
  return useQuery({
    queryKey: [CHAT_KEY, buyerId, bidderId],
    queryFn: () => axiosInstance.get(`/chat/room/${buyerId}/${bidderId}`),
    enabled: enabled,
  });
};

export const useUpdateMessage = (id) => {
  return useMutation({
    mutationFn: (data) => update(`/chat/message/${id}`, data)
  });
};