"use client";
import React, { useState, useEffect, useRef } from "react";
import { Check, ChevronDown, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { useCreateProfile } from "@/app/hooks/useProfile";
import { countries } from "@/app/data/jsonData";
import { useRouter } from "next/navigation";
import useAuthStore from "@/app/store/useAuthStore";
import {
  useGetAllCategories,
  useGetAllSubCategories,
} from "@/app/hooks/useCategory";
import { useUpdateSettingsLocation } from "@/app/hooks/useSettings";

const Providersignup = ({ location }) => {
  const [open, setOpen] = useState(false);
  const [subcategoryOpen, setSubcategoryOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [filteredCountries, setFilteredCountries] = useState([]);
  const [selectedSubCategoryNames, setSelectedSubCategoryNames] = useState([]);
  const dropdownRef = useRef(null);
  const subcategoryDropdownRef = useRef(null);
  const router = useRouter();
  const { mutate: createProfile } = useCreateProfile();
  const { mutateAsync: updateSettingsLocation } = useUpdateSettingsLocation();

  // Use auth store instead of localStorage
  const { user, updateProfile, updateUserData, createProfileByFilter } =
    useAuthStore();

  // useEffect(() => {
  //   if (!isAuthenticated) {
  //     router.push("/signin");
  //   }
  // }, [isAuthenticated, router]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    defaultValues: {
      orgNumber: "",
      companyName: "",
      companyAddress: "",
      city: "",
      zipCode: "",
      country: "",
      category: "",
      subCategory: [],
    },
  });

  const countryValue = watch("country");
  const selectedCategory = watch("category");
  const selectedSubCategories = watch("subCategory");

  const { data: categoriesResponse, isLoading: isLoadingCategories } =
    useGetAllCategories();
  const { data: subCategoriesResponse, isLoading: isLoadingSubCategories } =
    useGetAllSubCategories(selectedCategory);

  console.log(
    subCategoriesResponse?.data?.subcategories,
    "subCategoriesResponse"
  );

  const categories = categoriesResponse?.data?.categories || [];
  const allSubCategories = subCategoriesResponse?.data?.subcategories || [];

  // Reset selected subcategories when category changes
  useEffect(() => {
    if (selectedCategory) {
      setValue("subCategory", []);
      setSelectedSubCategoryNames([]);
    }
  }, [selectedCategory, setValue]);

  // Update selected subcategory names for display
  useEffect(() => {
    if (
      selectedSubCategories &&
      selectedSubCategories.length > 0 &&
      allSubCategories.length > 0
    ) {
      const names = selectedSubCategories
        .map((id) => {
          const subCat = allSubCategories.find((sc) => sc._id === id);
          return subCat ? subCat.name : "";
        })
        .filter((name) => name !== "");

      setSelectedSubCategoryNames(names);
    } else {
      setSelectedSubCategoryNames([]);
    }
  }, [selectedSubCategories, allSubCategories]);

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
      // Format the subcategory data as array if it's not already
      const subCategoryArray = Array.isArray(data.subCategory)
        ? data.subCategory
        : [data.subCategory];

      // Prepare data for the API with the correct structure
      const formattedData = {
        organizationNumber: data.orgNumber,
        profileType: "provider",
        name: data.companyName,
        address: data.companyAddress,
        city: data.city,
        zipCode: data.zipCode,
        country: data.country,
        category: [data.category], // Ensure it's an array
        subCategory: subCategoryArray, // Ensure it's an array
      };

      createProfile(
        {
          ...formattedData,
          id: user.id,
          user: {
            isProfileSetup: true,
          },
        },
        {
          onSuccess: async (profileResponse) => {
            const settingsId = profileResponse?.data?.settings;
            console.log(
              settingsId,
              "settingsIddddddddddddddddddddddddddddddddd"
            );
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
            createProfileByFilter({ id: user.id }); //currentProfile will be updated in auth-storage
            updateUserData({ isProfileSetup: true }); // user will be updated in auth-storage

            router.push("/missions");
          },
          onError: (error) => {
            console.error("Profile creation failed:", error);
          },
        }
      );
    } catch (error) {
      console.error("Profile creation failed:", error);
    }
  };

  const handleCountrySelect = (country) => {
    setValue("country", country.name);
    setSearchValue(country.name);
    setOpen(false);
  };

  // Add handler for subcategory selection
  const handleSubCategorySelect = (subCategory) => {
    const currentSelections = [...selectedSubCategories];
    const index = currentSelections.indexOf(subCategory._id);

    if (index === -1) {
      // Add to selection if not already selected
      currentSelections.push(subCategory._id);
    } else {
      // Remove from selection if already selected
      currentSelections.splice(index, 1);
    }

    setValue("subCategory", currentSelections);
  };

  // Add click outside handler for subcategory dropdown
  useEffect(() => {
    const handleSubCategoryClickOutside = (event) => {
      if (
        subcategoryDropdownRef.current &&
        !subcategoryDropdownRef.current.contains(event.target)
      ) {
        setSubcategoryOpen(false);
      }
    };
    document.addEventListener("mousedown", handleSubCategoryClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleSubCategoryClickOutside);
    };
  }, []);

  return (
    <div className="flex items-center justify-center p-4">
      <div className="w-full">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-[var(--color-secondary)]">
            Company Registration
          </h1>
          <p className="mt-1 text-gray-600 text-sm">
            Please fill in your company details
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label
                htmlFor="orgNumber"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Organization Number
              </label>
              <input
                id="orgNumber"
                type="text"
                {...register("orgNumber", { required: true })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all"
                placeholder="Enter organization number"
              />
              {errors.orgNumber && (
                <p className="mt-1 text-sm text-red-600">
                  Organization number is required
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="companyName"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Company Name
              </label>
              <input
                id="companyName"
                type="text"
                {...register("companyName", { required: true })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all"
                placeholder="Enter company name"
              />
              {errors.companyName && (
                <p className="mt-1 text-sm text-red-600">
                  Company name is required
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="companyAddress"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Company Address
              </label>
              <input
                id="companyAddress"
                type="text"
                {...register("companyAddress", { required: true })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all"
                placeholder="Enter company address"
              />
              {errors.companyAddress && (
                <p className="mt-1 text-sm text-red-600">
                  Company address is required
                </p>
              )}
            </div>

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
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="category"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Business Category
                </label>
                <select
                  id="category"
                  {...register("category", { required: true })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all"
                  required
                >
                  <option value="">Select category</option>
                  {isLoadingCategories ? (
                    <option disabled>Loading categories...</option>
                  ) : categories && categories.length > 0 ? (
                    categories.map((category) => (
                      <option key={category._id} value={category._id}>
                        {category.name}
                      </option>
                    ))
                  ) : (
                    <option disabled>No categories available</option>
                  )}
                </select>
                {errors.category && (
                  <p className="mt-1 text-sm text-red-600">
                    Business category is required
                  </p>
                )}
              </div>

              <div className="relative" ref={subcategoryDropdownRef}>
                <label
                  htmlFor="subcategory"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Sub Category
                </label>
                <div
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all cursor-pointer flex justify-between items-center"
                  onClick={() =>
                    selectedCategory
                      ? setSubcategoryOpen(!subcategoryOpen)
                      : null
                  }
                >
                  <span className={!selectedCategory ? "text-gray-400" : ""}>
                    {!selectedCategory
                      ? "Select a category first"
                      : selectedSubCategoryNames.length
                      ? `${selectedSubCategoryNames.length} selected`
                      : "Select subcategories"}
                  </span>
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                </div>

                {subcategoryOpen && selectedCategory && (
                  <div className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    {isLoadingSubCategories ? (
                      <div className="py-3 px-4 text-sm text-gray-500">
                        Loading subcategories...
                      </div>
                    ) : allSubCategories.length > 0 ? (
                      <ul className="divide-y divide-gray-100">
                        {allSubCategories.map((subCategory) => (
                          <li
                            key={subCategory._id}
                            onClick={() => handleSubCategorySelect(subCategory)}
                            className="relative cursor-pointer select-none py-2.5 px-4 hover:bg-gray-50 flex items-center"
                          >
                            <div className="flex items-center w-full">
                              <span className="block truncate">
                                {subCategory.name}
                              </span>
                            </div>
                            {selectedSubCategories.includes(
                              subCategory._id
                            ) && (
                              <Check className="h-4 w-4 text-[var(--color-primary)] ml-2" />
                            )}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="py-3 px-4 text-sm text-gray-500">
                        No subcategories available for this category
                      </div>
                    )}
                  </div>
                )}
                <input
                  {...register("subCategory", { required: true })}
                  type="hidden"
                  required
                />
                {errors.subCategory && (
                  <p className="mt-1 text-sm text-red-600">
                    At least one subcategory is required
                  </p>
                )}
              </div>
            </div>

            {/* Show selected subcategories */}
            {selectedSubCategoryNames.length > 0 && (
              <div className="mt-2">
                <div className="flex flex-wrap gap-2">
                  {selectedSubCategoryNames.map((name, index) => {
                    const subCat = allSubCategories.find(
                      (sc) => sc.name === name
                    );
                    return (
                      <div
                        key={index}
                        className="bg-[var(--color-primary)] bg-opacity-10 text-white px-3 py-1 rounded-full text-sm flex items-center"
                      >
                        {name}
                        <button
                          type="button"
                          onClick={() => {
                            if (subCat) {
                              const newSelections =
                                selectedSubCategories.filter(
                                  (id) => id !== subCat._id
                                );
                              setValue("subCategory", newSelections);
                            }
                          }}
                          className="ml-2 text-white text-md hover:text-opacity-70"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <button
              type="submit"
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

export default Providersignup;
