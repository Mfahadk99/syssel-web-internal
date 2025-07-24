import { useQuery } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import axiosInstance from "../utils/axios";


const getAll = async (path) => {
    const response = await axiosInstance.get(path);
    return response.data;
};

const create = async (path, body) => {
    const response = await axiosInstance.post(path, body);
    return response.data;
};
const FRIEND_KEY = "freinds";

export const useGetAllFriends = (userId) => {
    return useQuery({
        queryKey: [FRIEND_KEY, userId],
        queryFn: () => getAll(`/friends/${userId}`),
    })
}

export const useCreateFriendAction = (id) => {
    return useMutation({
      mutationFn: (data) => create(`/friend/friend-request/${id}`, data),
    });
  };

