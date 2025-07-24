import axiosInstance from "@/app/utils/axios";

// React Query cache keys
export const serviceKeys = {
  all: ["services"],
  byId: (id) => ["service", id],
};

// API functions
export const servicesApi = {
  // Get all services
  getAll: async (isServer = false) => {
    if (isServer) {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/services`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error("Failed to fetch services");
      return res.json();
    }

    return axiosInstance.get("/services");
  },

  // Get single service by ID
  getById: async (id, isServer = false) => {
    if (isServer) {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/services/${id}`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error("Failed to fetch service");
      return res.json();
    }

    return axiosInstance.get(`/services/${id}`);
  },
};
