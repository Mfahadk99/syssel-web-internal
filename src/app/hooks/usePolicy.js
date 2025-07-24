import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../utils/axios";

const POLICY_KEY = "policy";

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

// GET: Fetch policy by profileId
export const useGetPolicy = (profileId, options = {}) => {
  return useQuery({
    queryKey: [POLICY_KEY, profileId],
    queryFn: () => {
      if (!profileId) throw new Error("Profile ID is required");
      return get(`/policy/${profileId}`);
    },
    enabled: !!profileId,
    ...options,
  });
};

// POST: Create a new policy
export const useCreatePolicy = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => create("/policy", data),
    onSuccess: (data, variables) => {
      // Invalidate the policy list for the profile
      if (variables && variables.profileId) {
        queryClient.invalidateQueries({
          queryKey: [POLICY_KEY, variables.profileId],
        });
      }
    },
  });
};

// PUT: Update a policy variant by profileId and variantId
export const useUpdatePolicy = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ profileId, variantId, ...updateData }) =>
      update(`/policy/${profileId}/${variantId}`, updateData),
    onSuccess: (data, variables) => {
      if (variables && variables.profileId) {
        queryClient.invalidateQueries({
          queryKey: [POLICY_KEY, variables.profileId],
        });
      }
    },
  });
};
