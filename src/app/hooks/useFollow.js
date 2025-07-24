import { useQuery } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import axiosInstance from "../utils/axios";
import { queryClient } from "../utils/getQueryClient";

const FOLLOW_KEY = "follow";

export const useFollow = () => {
  return useMutation({
    mutationFn: ({ providerId, userId }) =>
      axiosInstance.post(`/follow/${providerId}`, { userId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [FOLLOW_KEY] });
    },
  });
};

export const useUnfollow = () => {
  return useMutation({
    mutationFn: ({ providerId, userId }) =>
      axiosInstance.delete(`/follow/${providerId}?userId=${userId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [FOLLOW_KEY] });
    },
  });
};

export const useGetAllFollowedProviders = (userId) => {
  return useQuery({
    queryKey: [FOLLOW_KEY, userId],
    queryFn: () =>
      axiosInstance.get("/follow/following", {
        data: {
          userId: userId,
        },
      }),
  });
};
