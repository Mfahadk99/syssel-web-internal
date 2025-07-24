import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../utils/axios";

const getById = async (path, id) => {
    const response = await axiosInstance.get(`${path}/${id}`);
    return response.data;
  };

const NOTIFICATION_KEY = "notification";

export const useGetNotificationsById = (id) => {
  return useQuery({
    queryKey: [NOTIFICATION_KEY, id],
    queryFn: () => getById("/notification", id),
  });
};

