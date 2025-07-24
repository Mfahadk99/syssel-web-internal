import { useMutation } from "@tanstack/react-query";
import axiosInstance from "../utils/axios";


const create = async (path, data) => {
    const response = await axiosInstance.post(path, data);
    return response.data;
  };

  const TICKET_KEY = "ticket";



export const useCreateTicket = () => {
    return useMutation({
      mutationFn: (data) => create("/ticket", data),
    });
  };