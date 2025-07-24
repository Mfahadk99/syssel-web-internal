import { useQuery, useMutation } from "@tanstack/react-query";
import axiosInstance from "../utils/axios";
import { queryClient } from "../utils/getQueryClient";

// API
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

const BOOKING_KEY = "booking";

// Hooks
export const useGetAllBookingbyCustomer = (customerId) => {
  return useQuery({
    queryKey: [BOOKING_KEY, customerId],
    queryFn: () => get(`/booking?customer=${customerId}`),
  });
};

export const useGetAllBookingsByFilter = (filter, value, options = {}) => {
  return useQuery({
    queryKey: [BOOKING_KEY, filter, value],
    queryFn: () => get(`/booking?${filter}=${value}`),
    ...options,
  });
};

// export const useGetAllTodaySlots = (providerId, date) => {
//   return useQuery({
//     queryKey: [BOOKING_KEY, "available-slots", providerId, date],
//     queryFn: () => get(`/booking/available-slots?providerId=${providerId}&date=${date}`),
//   });
// };

export const useGetAllTodaySlots = (providerId, date, options = {}) => {
  return useQuery({
    queryKey: [BOOKING_KEY, "available-slots", providerId, date],
    queryFn: () =>
      get(`/booking/available-slots?providerId=${providerId}&date=${date}`),
    enabled: !!providerId && !!date,
    ...options,
  });
};

export const useCreateBooking = () => {
  return useMutation({
    mutationFn: (data) => create("/booking", data),
  });
};

export const useUpdateBooking = (id) => {
  return useMutation({
    mutationFn: (data) => update(`/booking/${id}`, data),
    onSuccess: () => {
      queryClient().invalidateQueries({ queryKey: [BOOKING_KEY] });
    },
  });
};

export const useDeleteBooking = () => {
  return useMutation({
    mutationFn: (id) => remove(`/booking/${id}`),
  });
};
