import { useQuery, useMutation } from "@tanstack/react-query";
import axiosInstance from "../utils/axios";

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

const BOOKING_KEY = "SETTINGS";

export const useGetSettingsById = (id, options = {}) => {
    return useQuery({
        queryKey: [BOOKING_KEY, id],
        queryFn: () => get(`/settings/profile/${id}`),
        enabled: !!id,
        ...options
    });
};

export const useGetWeekTimingsBySettingId = (settingsId, startDate, endDate, options = {}) => {
    return useQuery({
        queryKey: [BOOKING_KEY, settingsId],
        queryFn: () => get(`/settings/week-schedule/${settingsId}?startDate=${startDate}&endDate=${endDate}`),
        enabled: !!settingsId,
        ...options
    });
};

export const useUpdateCalendarTime = (settingsId) => {
    return useMutation({
        mutationFn: (data) => create(`/settings/custom-date-override/${settingsId}`, data),
    });
};

export const useCreateSettings = () => {
    return useMutation({
        mutationFn: (data) => create("/settings", data),
    });
};

export const useUpdateSettings = (id) => {
    return useMutation({    
        mutationFn: (data) => update(`/settings/${id}`, data),
    });
};

export const useUpdateSettingsLocation = () => {
  return useMutation({    
      mutationFn: ({ id, data }) => update(`/settings/${id}`, data),
  });
};


