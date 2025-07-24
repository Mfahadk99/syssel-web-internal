"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import axiosInstance from "../utils/axios";

const VOUCHER_KEY = "vouchers";

//axios functions
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

//react query and mutation functions
export const useGetVouchers = (filter, id, enabled = true) => {
  return useQuery({
    queryKey: [VOUCHER_KEY, filter, id],
    queryFn: () => get(`/vouchers?${filter}=${id}`),
    enabled: enabled && !!id, // only fetch if enabled and id is available
  });
};


export const useGetVoucherById = (voucherId) => {
  return useQuery({
    queryKey: [VOUCHER_KEY, voucherId],
    queryFn: () => get(`/vouchers/${voucherId}`),
  });
};

export const useCreateVoucher = () => {
  return useMutation({
    mutationFn: (data) => create("/vouchers", data),
  });
};

export const useUpdateVoucher = () => {
  return useMutation({
    mutationFn: (data) => {
      const { id, ...voucherData } = data;
      return update(`/vouchers/${id}`, voucherData);
    },
  });
};

export const useGetVouchersByIds = (ids) => {
  const queryIds = Array.isArray(ids) ? ids.join(",") : ids;

  return useQuery({
    queryKey: [VOUCHER_KEY, ids],
    queryFn: () => get(`/vouchers?ids=${queryIds}`),
    enabled: !!ids && ids.length > 0,
  });
};
