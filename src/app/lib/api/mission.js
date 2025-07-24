import axiosInstance from "@/app/utils/axios";

// React Query cache keys
export const missionKeys = {
  all: ["missions"],
  byId: (id) => ["mission", id],
  byBuyer: (buyerId) => ["missions", "buyer", buyerId],
};

// API functions
export const missionsApi = {
  // Get all missions
  getAll: async (isServer = false) => {
    if (isServer) {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/missions`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error("Failed to fetch missions");
      return res.json();
    }

    return axiosInstance.get("/missions");
  },

  // Get single mission by ID
  getById: async (id, isServer = false) => {
    if (isServer) {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/missions/${id}`,
        {
          cache: "no-store",
        }
      );
      if (!res.ok) throw new Error("Failed to fetch mission");
      return res.json();
    }

    return axiosInstance.get(`/missions/${id}`);
  },

  // Get missions by buyer ID
  getByBuyer: async (buyerId, isServer = false) => {
    if (isServer) {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/missions?buyer=${buyerId}`,
        {
          cache: "no-store",
        }
      );
      if (!res.ok) throw new Error("Failed to fetch buyer missions");
      return res.json();
    }

    return axiosInstance.get(`/missions?buyer=${buyerId}`);
  },
};
