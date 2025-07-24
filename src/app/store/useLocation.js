import { create } from "zustand";

const useLocation = create((set) => ({
  location: { latitude: null, longitude: null },
  setLocation: (location) => set({ location }),
  clearLocation: () => set({ location: { latitude: null, longitude: null } }),
}));

export default useLocation;
