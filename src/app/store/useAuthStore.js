import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import axiosInstance from "../utils/axios";

const useAuthStore = create(
  persist(
    (set, get) => ({
      // Auth State
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      rememberedUsers: [], // New array to store multiple users

      // Profile State
      currentProfile: null,

      // Common State
      isLoading: false,
      error: null,

      // Auth Actions
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setTokens: (accessToken, refreshToken) =>
        set({ accessToken, refreshToken }),
      setError: (error) => set({ error }),
      setLoading: (isLoading) => set({ isLoading }),

      // Login action
      login: (userData, tokens, rememberMe = false) => {
        set((state) => {
          // If remember me is checked, add user to rememberedUsers
          if (rememberMe) {
            const newUser = {
              ...userData,
              accessToken: tokens.accessToken,
              refreshToken: tokens.refreshToken,
              lastLogin: new Date().toISOString(),
            };

            // Check if user already exists in rememberedUsers
            const existingUserIndex = state.rememberedUsers.findIndex(
              (u) => u.id === userData.id
            );
            let updatedRememberedUsers = [...state.rememberedUsers];

            if (existingUserIndex !== -1) {
              // Update existing user
              updatedRememberedUsers[existingUserIndex] = newUser;
            } else {
              // Add new user
              updatedRememberedUsers.push(newUser);
            }

            return {
              user: userData,
              accessToken: tokens.accessToken,
              refreshToken: tokens.refreshToken,
              isAuthenticated: true,
              error: null,
              rememberedUsers: updatedRememberedUsers,
            };
          }

          // If remember me is not checked, just set current user
          return {
            user: userData,
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            isAuthenticated: true,
            error: null,
          };
        });
      },

      // Switch user action
      switchUser: (userData) => {
        set({
          user: userData,
          accessToken: userData.accessToken,
          refreshToken: userData.refreshToken,
          isAuthenticated: true,
          error: null,
        });
      },

      // Logout action
      logout: () => {
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          currentProfile: null,
          error: null,
          isLoading: false,
        });
        localStorage.removeItem("auth-storage");
        window.location.href = "/signin";
      },

      // Update user profile
      updateUserData: (userData) => {
        set((state) => ({
          user: { ...state.user, ...userData },
        }));
      },

      // Profile Actions
      setCurrentProfile: (profile) => set({ currentProfile: profile }),

      // Create profile by id filter
      createProfileByFilter: async (profileData) => {
        try {
          set({ isLoading: true, error: null });

          const userId = profileData?.id;
          const response = await axiosInstance.get(
            `/profiles?userId=${userId}`
          );

          // Access the profiles array from the correct path in the response
          const newProfile = response?.data?.data?.profiles[0];

          // Only store essential fields in currentProfile
          const essentialProfileData = {
            _id: newProfile._id,
            profileType: newProfile.profileType,
            name: newProfile.name,
            city: newProfile.city,
            country: newProfile.country,
            rating: newProfile.rating.average,
            settingId: newProfile.settings,
          };

          // Add category if it exists
          if (newProfile.category) {
            essentialProfileData.category = {
              _id: newProfile.category._id,
              name: newProfile.category.name,
            };
          }

          // Add subcategory if it exists
          if (
            newProfile.subCategory &&
            newProfile.subCategory.length > 0 &&
            Array.isArray(newProfile.subCategory)
          ) {
            essentialProfileData.subCategory = newProfile.subCategory.map(
              (sub) => ({
                _id: sub._id,
                name: sub.name,
              })
            );
          }

          set({
            currentProfile: essentialProfileData,
            isLoading: false,
          });

          return essentialProfileData;
        } catch (error) {
          set({
            error: error.message || "Failed to create profile",
            isLoading: false,
          });
          throw error;
        }
      },

      // Create new profile
      createAuthProfile: async (profileData) => {
        try {
          set({ isLoading: true, error: null });

          set((state) => ({
            currentProfile: { ...state.currentProfile, ...profileData },
            isLoading: false,
          }));

          return profileData;
        } catch (error) {
          set({
            error: error.message || "Failed to create profile",
            isLoading: false,
          });
          throw error;
        }
      },

      // Update profile
      updateProfile: (profileData) => {
        try {
          set((state) => ({
            currentProfile: { ...state.currentProfile, ...profileData },
            isLoading: false,
          }));

          return profileData;
        } catch (error) {
          set({
            error: error.message || "Failed to update profile",
            isLoading: false,
          });
          throw error;
        }
      },

      // Clear error
      clearError: () => set({ error: null }),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
        currentProfile: state.currentProfile,
        rememberedUsers: state.rememberedUsers, // Add rememberedUsers to persistence
      }),
    }
  )
);

export default useAuthStore;