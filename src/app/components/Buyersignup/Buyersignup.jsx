"use client";

import React, { useState, useEffect, useRef } from "react";
import { Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useCreateProfile } from "@/app/hooks/useProfile";
import { useUpdateSettingsLocation } from "@/app/hooks/useSettings";
import { countries } from "@/app/data/jsonData";
import useAuthStore from "@/app/store/useAuthStore";

const Buyersignup = ({ location }) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [filteredCountries, setFilteredCountries] = useState([]);
  const dropdownRef = useRef(null);
  const { user, createProfileByFilter } = useAuthStore();
  const { mutateAsync: createProfile } = useCreateProfile();
  const { mutateAsync: updateSettingsLocation } = useUpdateSettingsLocation();

  useEffect(() => {
    if (user?.isProfileSetup) {
      router.push("/discover");
    }
  }, [user?.isProfileSetup]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    defaultValues: {
      name: "",
      address: "",
      city: "",
      zipCode: "",
      country: "",
    },
  });

  const countryValue = watch("country");

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Improved search functionality
  useEffect(() => {
    if (searchValue.trim() === "") {
      setFilteredCountries([]);
    } else {
      const searchTerm = searchValue.toLowerCase();

      // First find exact matches starting with the search term
      const exactStartMatches = countries.filter((country) =>
        country.name.toLowerCase().startsWith(searchTerm)
      );

      // Then find countries that include the search term anywhere
      const containsMatches = countries.filter(
        (country) =>
          !country.name.toLowerCase().startsWith(searchTerm) &&
          country.name.toLowerCase().includes(searchTerm)
      );

      // Also include matches on country codes
      const codeMatches = countries.filter(
        (country) =>
          !country.name.toLowerCase().includes(searchTerm) &&
          country.code.toLowerCase().includes(searchTerm)
      );

      // Combine results with priority order (starts with > contains > code matches)
      const combined = [
        ...exactStartMatches,
        ...containsMatches,
        ...codeMatches,
      ].slice(0, 10);
      setFilteredCountries(combined);
    }
  }, [searchValue]);

  const onSubmit = async (data) => {
    try {
      // 1. Create profile
      const profileResponse = await createProfile({
        ...data,
        id: user.id,
        profileType: "buyer",
        user: {
          isProfileSetup: true,
        },
      });
      const settingsId = profileResponse?.data?.settings;
      console.log(settingsId, "settingsIddddddddddddddddddddddddddddddddd");
      // Now you can use the profileResponse variable
      console.log("Profile created successfully:", profileResponse);

      // 2. Prepare location data
      const locationData = {
        location: {
          address: data.address || "",
          coordinates: {
            latitude: location.latitude,
            longitude: location.longitude,
          },
        },
      };

      // 3. Update settings with location
      await updateSettingsLocation({
        id: settingsId,
        data: locationData,
      });

      // 4. Update store and redirect
      createProfileByFilter({ id: user.id });
      updateUserData({ isProfileSetup: true });
      router.push("/discover");
    } catch (error) {
      console.error("Profile creation failed:", error);
    }
  };

  const handleCountrySelect = (country) => {
    setValue("country", country.name);
    setSearchValue(country.name);
    setOpen(false);
  };

  return (
    <div className="h-screen flex items-center justify-center p-4">
      <div className="w-full">
        {/* Header Section */}
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-[var(--color-secondary)]">
            Enter your details
          </h1>
          <p className="mt-1 text-gray-600 text-sm">
            Please fill in your personal details
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Name Field */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Your Name
              </label>
              <input
                id="name"
                type="text"
                {...register("name", { required: true })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all"
                placeholder="Enter your full name"
                required
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">Name is required</p>
              )}
            </div>

            {/* Address Field */}
            <div>
              <label
                htmlFor="address"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Address
              </label>
              <input
                id="address"
                type="text"
                {...register("address", { required: true })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all"
                placeholder="Enter your street address"
                required
              />
              {errors.address && (
                <p className="mt-1 text-sm text-red-600">Address is required</p>
              )}
            </div>

            {/* City and Zip Code Row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="city"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  City
                </label>
                <input
                  id="city"
                  type="text"
                  {...register("city", { required: true })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all"
                  placeholder="Enter city"
                  required
                />
                {errors.city && (
                  <p className="mt-1 text-sm text-red-600">City is required</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="zipCode"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Zip Code
                </label>
                <input
                  id="zipCode"
                  type="text"
                  {...register("zipCode", { required: true })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all"
                  placeholder="Enter zip code"
                  required
                />
                {errors.zipCode && (
                  <p className="mt-1 text-sm text-red-600">
                    Zip code is required
                  </p>
                )}
              </div>
            </div>

            {/* Country Field with Autocomplete */}
            <div className="relative" ref={dropdownRef}>
              <label
                htmlFor="country"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Country
              </label>
              <div className="relative">
                <input
                  id="country"
                  type="text"
                  value={searchValue}
                  onChange={(e) => {
                    setSearchValue(e.target.value);
                    if (e.target.value.length > 0) {
                      setOpen(true);
                    } else {
                      setOpen(false);
                    }
                  }}
                  placeholder="Type to search for a country"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all"
                  required
                />
              </div>

              {open && (
                <div className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  {filteredCountries.length > 0 ? (
                    <ul className="divide-y divide-gray-100">
                      {filteredCountries.map((country) => (
                        <li
                          key={country.code}
                          onClick={() => handleCountrySelect(country)}
                          className="relative cursor-pointer select-none py-2.5 px-4 hover:bg-gray-50 flex items-center"
                        >
                          <div className="flex items-center w-full">
                            <span
                              className={`block truncate ${
                                countryValue === country.name
                                  ? "font-semibold text-[var(--color-primary)]"
                                  : "font-normal"
                              }`}
                            >
                              {country.name}
                            </span>
                            <span className="ml-auto text-xs text-gray-400">
                              {country.code}
                            </span>
                          </div>
                          {countryValue === country.name && (
                            <Check className="h-4 w-4 text-[var(--color-primary)] ml-2" />
                          )}
                        </li>
                      ))}
                    </ul>
                  ) : searchValue.trim() !== "" ? (
                    <div className="py-3 px-4 text-sm text-gray-500">
                      No countries found
                    </div>
                  ) : (
                    <div className="py-3 px-4 text-sm text-gray-500">
                      Type to search for a country
                    </div>
                  )}
                </div>
              )}
              <input
                {...register("country", { required: true })}
                type="hidden"
                required
              />
              {errors.country && (
                <p className="mt-1 text-sm text-red-600">Country is required</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              onClick={() => {
                router.push("/discover");
              }}
              className="cursor-pointer w-full bg-[var(--color-primary)] text-white py-3 rounded-xl hover:bg-opacity-90 transition-all duration-200 mt-6 font-medium hover:bg-primary-hover"
            >
              Register
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Buyersignup;
