"use client";
import { create } from "zustand";

// Create a Zustand store WITHOUT persistence to avoid conflicts
const useSearchStore = create((set) => ({
  searchQuery: "",
  setSearchQuery: (query) => set({ searchQuery: query }),
}));

// Custom hook to use the store
const useSearch = () => {
  const searchQuery = useSearchStore((state) => state.searchQuery);
  const setSearchQuery = useSearchStore((state) => state.setSearchQuery);

  return {
    searchQuery,
    setSearchQuery,
  };
};

export default useSearch;