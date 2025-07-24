"use client";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

// Create a Zustand store with persistence
const useFavouriteStore = create(
  persist(
    (set, get) => ({
      favorites: [],

      // Add to favorites
      addFavorite: (itemId) => {
        set((state) => ({
          favorites: [...state.favorites, itemId],
        }));
      },

      // Remove from favorites
      removeFavorite: (itemId) => {
        set((state) => ({
          favorites: state.favorites.filter((id) => id !== itemId),
        }));
      },

      // Toggle favorite
      toggleFavorite: (itemId) => {
        const { favorites, addFavorite, removeFavorite } = get();
        if (favorites.includes(itemId)) {
          removeFavorite(itemId);
        } else {
          addFavorite(itemId);
        }
      },

      // Check if item is favorited
      isFavorite: (itemId) => {
        return get().favorites.includes(itemId);
      },
    }),
    {
      name: "favorites-storage", // unique name for localStorage key
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// Custom hook to use the store
const useFavourite = () => {
  const favorites = useFavouriteStore((state) => state.favorites);
  const toggleFavorite = useFavouriteStore((state) => state.toggleFavorite);
  const isFavorite = useFavouriteStore((state) => state.isFavorite);

  return {
    favorites,
    handleFavorite: toggleFavorite,
    isFavorite,
  };
};

export default useFavourite;
