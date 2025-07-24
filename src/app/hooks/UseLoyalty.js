import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../utils/axios";

const REWARD_KEY = "reward";

// Axios functions
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


// GET: Fetch all rewards
// export const useGetRewards = (options = {}) => {
//     return useQuery({
//       queryKey: [REWARD_KEY],
//       queryFn: () => get("/reward"),
//       ...options,
//     });
//   };


// GET: Fetch all rewards
export const useGetRewardsById = (profileId,  options = {}) => {
  return useQuery({
    queryKey: [REWARD_KEY, profileId],
    queryFn: () => {
        if (!profileId) throw new Error("Profile ID is required");
        return get(`/reward/${profileId}`);
    }, 
    enabled: !!profileId,
    ...options,
  });
};

// POST: Create a new reward
export const useCreateReward = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => create("/reward", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [REWARD_KEY] });
    },
  });
};

// PUT: Update a reward by profileId and rewardId
export const useUpdateReward = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ profileId, rewardId, ...updateData }) =>
      axiosInstance
        .put(`/reward/${profileId}/${rewardId}`, updateData)
        .then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [REWARD_KEY] });
    },
  });
};
