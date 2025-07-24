import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../utils/axios";

// want to add three hooks for gallery
// 1.(POST) Add image
// 2. get all images
// 3. delete images

const GALLERY_KEY = "gallery";

export const useAddImage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data) =>
      axiosInstance.post(`/gallery/section/${data.sectionId}`, data),
    onSuccess: () => {
      // Invalidate gallery and sections queries
      queryClient.invalidateQueries({ queryKey: [GALLERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ["sections"] });
    },
  });
};

// set limit to 100
export const useGetAllImages = (id) => {
  return useQuery({
    queryKey: [GALLERY_KEY, id],
    queryFn: () => axiosInstance.get(`/gallery?providerId=${id}&limit=100`),
    enabled: !!id,
  });
};

// body should be {imageIds: [id1, id2, id3]}

export const useDeleteImages = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data) =>
      axiosInstance.delete(`/gallery/${data.providerId}`, {
        data: { imageIds: data.imageIds },
      }),
    onSuccess: () => {
      // Invalidate gallery queries
      queryClient.invalidateQueries({ queryKey: [GALLERY_KEY] });
    },
  });
};
