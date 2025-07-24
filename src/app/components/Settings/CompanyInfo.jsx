"use client";
import { ChevronLeft, X, Upload } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import useAuthStore from "@/app/store/useAuthStore";
import toast from "react-hot-toast";
import { useUpdateProfile, useGetProfileById } from "@/app/hooks/useProfile";
import {
  useGetAllCategories,
  useGetAllSubCategories,
} from "@/app/hooks/useCategory";
import useImageUploader from "@/app/utils/imgUpload";
// import SimpleLogoLoader from "../Loader/Loader";

const DUMMY_IMAGE =
  "https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1";

export default function CompanyInformation() {
  // ===== Hooks and State =====
  const router = useRouter();
  const {
    user,
    currentProfile,
    isLoading: authLoading,
    setCurrentProfile,
  } = useAuthStore();
  const updateProfileMutation = useUpdateProfile();
  const { data: categoriesResponse, isLoading: categoriesLoading } =
    useGetAllCategories();
  const [selectedCategoryId, setSelectedCategoryId] = useState("");

  const { data: profileResponse, isLoading: profileLoading } =
    useGetProfileById(currentProfile?._id);

  const { data: subCategoriesResponse, isLoading: subCategoriesLoading } =
    useGetAllSubCategories(selectedCategoryId);

  const fullProfile = profileResponse?.data;
  console.log(fullProfile, "fullProfile");
  const [selectedSubCategories, setSelectedSubCategories] = useState([]);

  const categories = categoriesResponse?.data?.categories || [];
  const subCategories = subCategoriesResponse?.data?.subcategories || [];

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm();

  const selectedCategory = watch("category");

  // ===== Effects =====

  // Set selected category and reset subcategories when category changes
  useEffect(() => {
    if (selectedCategory && categories.length > 0) {
      const category = categories.find((cat) => cat._id === selectedCategory);
      if (category) {
        setSelectedCategoryId(category._id);
        setSelectedSubCategories([]);
      }
    }
  }, [selectedCategory, categories]);

  // Pre-select subcategories when subcategories are loaded
  useEffect(() => {
    if (fullProfile?.subCategory && subCategories.length > 0) {
      const validSubCategories = fullProfile.subCategory.filter((subCatId) =>
        subCategories.some((subCat) => subCat._id === subCatId)
      );
      setSelectedSubCategories(validSubCategories);
    }
  }, [subCategories, fullProfile?.subCategory]);

  // Form initialization
  useEffect(() => {
    if (user && fullProfile) {
      const nameParts = user.name?.trim().split(" ") || [];
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";

      const newValues = {
        name: fullProfile.name || "",
        category: fullProfile.category || "",
        organizationNumber: fullProfile.organizationNumber || "",
        description: fullProfile.description || "",
        contact: {
          firstName,
          lastName,
          phone: fullProfile.personalPhone || "",
          email: user.email || "",
          address: fullProfile.address || "",
          postCode: fullProfile.zipCode || "",
          district: fullProfile.district || "",
          city: fullProfile.city || "",
          country: fullProfile.country || "",
          image: fullProfile.image || DUMMY_IMAGE,
          coverImage: fullProfile.coverImage || DUMMY_IMAGE,
        },
      };

      reset(newValues);

      if (fullProfile.category) {
        setSelectedCategoryId(fullProfile.category);
        setValue("category", fullProfile.category);
      }
    }
  }, [user, fullProfile, reset, setValue]);

  // ===== Handlers =====

  const handleSubCategoryChange = (subcategoryId) => {
    setSelectedSubCategories((prev) =>
      prev.includes(subcategoryId)
        ? prev.filter((id) => id !== subcategoryId)
        : [...prev, subcategoryId]
    );
  };

  const {
    uploadFiles: uploadProfileImage,
    uploading: uploadingProfileImage,
    error: profileImageError,
  } = useImageUploader();

  const {
    uploadFiles: uploadCoverImage,
    uploading: uploadingCoverImage,
    error: coverImageError,
  } = useImageUploader();

  const [profileImageUrl, setProfileImageUrl] = useState(fullProfile?.image);
  const [coverImageUrl, setCoverImageUrl] = useState(fullProfile?.coverImage);

  const handleProfileImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const result = await uploadProfileImage(file);
    if (result && result[0]?.success) setProfileImageUrl(result[0].urls[0]);
  };

  const handleCoverImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const result = await uploadCoverImage(file);
    if (result && result[0]?.success) setCoverImageUrl(result[0].urls[0]);
  };

  const onSubmit = (data) => {
    if (!fullProfile?._id) {
      toast.error("Profile information is missing");
      return;
    }

    const selectedCategoryObject = categories.find(
      (cat) => cat._id === (data.category || fullProfile.category)
    );
    const selectedSubCategoryIds =
      selectedSubCategories.length > 0
        ? selectedSubCategories
        : fullProfile.subCategory || [];
    const selectedSubCategoryObjects = selectedSubCategoryIds
      .map((subCatId) => subCategories.find((subCat) => subCat._id === subCatId))
      .filter(Boolean);

    const profileUpdateData = {
      id: fullProfile._id,
      name: data.name,
      category: data.category || fullProfile.category,
      subCategory: selectedSubCategoryIds,
      organizationNumber: data.organizationNumber,
      description: data.description,
      personalPhone: data.contact.phone,
      address: data.contact.address,
      zipCode: data.contact.postCode,
      district: data.contact.district,
      city: data.contact.city,
      country: data.contact.country,
      image: profileImageUrl,
      coverImage: coverImageUrl,
    };

    updateProfileMutation.mutate(profileUpdateData, {
      onSuccess: () => {
        toast.success("Company information updated successfully");
        const essentialProfileData = {
          _id: fullProfile._id,
          profileType: fullProfile.profileType,
          name: data.name,
          city: data.contact.city,
          country: data.contact.country,
          image: profileImageUrl || fullProfile?.image,
        };
        if (selectedCategoryObject) {
          essentialProfileData.category = {
            _id: selectedCategoryObject._id,
            name: selectedCategoryObject.name,
          };
        }
        if (selectedSubCategoryObjects.length > 0) {
          essentialProfileData.subCategory = selectedSubCategoryObjects.map(
            (sub) => ({
              _id: sub._id,
              name: sub.name,
            })
          );
        }
        setCurrentProfile(essentialProfileData);
        reset(data);
      },
      onError: (error) => {
        console.error("Error updating profile:", error);
        toast.error("Failed to update company information");
      },
    });
  };

  // ===== Utility =====

  const getSubCategoryNames = (ids) =>
    Array.isArray(ids)
      ? ids
          .map((id) => subCategories.find((sc) => sc._id === id)?.name || "")
          .filter(Boolean)
      : [];

  // ===== Loading States =====

  // if (authLoading || !currentProfile?._id || profileLoading) return <SimpleLogoLoader />;
  // if (uploadingProfileImage || uploadingCoverImage) return <SimpleLogoLoader />;

  // ===== Field Definitions =====

  const companyFields = [
    { id: "name", label: "Company Name", type: "text" },
    { id: "organizationNumber", label: "Organization Number", type: "number" },
    { id: "description", label: "Description", type: "textarea" },
  ];
  const contactFields = [
    { id: "firstName", label: "First Name", type: "text" },
    { id: "lastName", label: "Last Name", type: "text" },
    { id: "phone", label: "Phone Number", type: "text" },
    { id: "email", label: "Email", type: "email" },
    { id: "address", label: "Address", type: "text" },
    { id: "postCode", label: "Post Code", type: "text" },
    { id: "district", label: "District", type: "text" },
    { id: "city", label: "City", type: "text" },
    { id: "country", label: "Country", type: "text" },
  ];

  // ===== Render =====

  return (
    <div className="mx-auto bg-background min-h-screen pb-8 p-4">
      {/* Header */}
      <div className="flex items-center justify-center relative h-16">
        <div
          onClick={() => router.back()}
          className="cursor-pointer absolute left-4"
        >
          <ChevronLeft size={24} color="#3a2f29" />
        </div>
        <h1 className="text-2xl font-bold text-[#3a2f29]">
          Company Information
        </h1>
      </div>

      {/* Profile Display */}
      <div className="flex flex-col items-center my-6">
        {/* Cover Image */}
        <div className="w-full h-60 rounded-2xl overflow-hidden mb-4 relative">
          <img
            src={coverImageUrl || fullProfile?.coverImage}
            alt="Cover"
            className="w-full h-full object-cover"
          />
          <label className="absolute bottom-4 right-4 bg-white/80 hover:bg-white p-2 rounded-full cursor-pointer transition-all">
            <input
              type="file"
              accept="image/*"
              onChange={handleCoverImageUpload}
              className="hidden"
              disabled={uploadingCoverImage}
            />
            <Upload size={20} className="text-gray-600" />
          </label>
          {coverImageError && (
            <p className="text-red-500 text-xs mt-1">{coverImageError}</p>
          )}
        </div>

        {/* Profile Image */}
        <div className="relative -mt-24 mb-4">
          <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-background">
            <img
              src={profileImageUrl || fullProfile?.image}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
          <label className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg cursor-pointer hover:bg-gray-50">
            <input
              type="file"
              accept="image/*"
              onChange={handleProfileImageUpload}
              className="hidden"
              disabled={uploadingProfileImage}
            />
            <Upload size={20} className="text-gray-600" />
          </label>
          {profileImageError && (
            <p className="text-red-500 text-xs mt-1">{profileImageError}</p>
          )}
        </div>

        <h2 className="text-2xl font-bold text-[#3a2f29]">
          {fullProfile?.name}
        </h2>
        <p className="text-gray-500">
          {categories.find((cat) => cat._id === fullProfile?.category)?.name || ""}
          {fullProfile?.city && fullProfile?.country && (
            <span> | {fullProfile?.city}, {fullProfile?.country}</span>
          )}
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {companyFields.map((field) => (
            <div key={field.id}>
              <label
                htmlFor={field.id}
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                {field.label}
              </label>
              {field.type === "textarea" ? (
                <textarea
                  id={field.id}
                  {...register(field.id, { required: true })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all min-h-[100px]"
                />
              ) : (
                <input
                  id={field.id}
                  type={field.type}
                  {...register(field.id, { required: true })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all"
                />
              )}
              {errors[field.id] && (
                <p className="text-red-500 text-xs mt-1">
                  This field is required
                </p>
              )}
            </div>
          ))}

          {/* Category selection */}
          <div>
            <label
              htmlFor="category"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Select Category
            </label>
            <select
              id="category"
              {...register("category")}
              value={watch("category") || ""}
              onChange={(e) => {
                setValue("category", e.target.value);
                if (e.target.value) {
                  setSelectedCategoryId(e.target.value);
                }
              }}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all"
            >
              <option value="">Select a category</option>
              {!categoriesLoading &&
                categories.length > 0 &&
                categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
            </select>
          </div>

          {/* Multiple subcategories selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Subcategories
            </label>

            {selectedCategoryId && !subCategoriesLoading ? (
              <div className="grid grid-cols-2 gap-2 mt-2">
                {subCategories.length > 0 ? (
                  subCategories.map((subCategory) => (
                    <div
                      key={subCategory._id}
                      className={`flex items-center p-3 rounded-xl border cursor-pointer transition-all ${
                        selectedSubCategories.includes(subCategory._id)
                          ? "bg-primary/10 border-primary"
                          : "border-gray-200 hover:bg-gray-50"
                      }`}
                      onClick={() => handleSubCategoryChange(subCategory._id)}
                    >
                      <input
                        type="checkbox"
                        id={`subcat-${subCategory._id}`}
                        checked={selectedSubCategories.includes(
                          subCategory._id
                        )}
                        onChange={() => {}}
                        className="mr-2 h-4 w-4 accent-primary"
                      />
                      <label
                        htmlFor={`subcat-${subCategory._id}`}
                        className="cursor-pointer text-sm select-none"
                      >
                        {subCategory.name}
                      </label>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 col-span-2">
                    No subcategories available for this category
                  </p>
                )}
              </div>
            ) : (
              <p className="text-gray-500 italic mt-2">
                {selectedCategoryId
                  ? "Loading subcategories..."
                  : "Please select a category first to view subcategories"}
              </p>
            )}
          </div>

          {/* Show the selected subcategories for the current selection */}
          {selectedSubCategories.length > 0 && (
            <div className="mt-2">
              <p className="text-sm font-medium text-gray-700 mb-1">
                Selected subcategories:
              </p>
              <div className="flex flex-wrap gap-2">
                {getSubCategoryNames(selectedSubCategories).map((name, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm flex items-center"
                  >
                    {name}
                    <X
                      size={16}
                      className="ml-1 cursor-pointer"
                      onClick={() => {
                        const subCatId = subCategories.find(
                          (sc) => sc.name === name
                        )?._id;
                        if (subCatId) handleSubCategoryChange(subCatId);
                      }}
                    />
                  </span>
                ))}
              </div>
            </div>
          )}

          <h3 className="text-xl font-bold text-[var(--color-secondary)] pt-4">
            Contact Information
          </h3>

          {/* Grid layout for contact fields (2 columns) */}
          <div className="grid grid-cols-2 gap-4">
            {contactFields.map((field) => (
              <div key={field.id}>
                <label
                  htmlFor={`contact_${field.id}`}
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  {field.label}
                </label>
                <input
                  id={`contact_${field.id}`}
                  type={field.type}
                  {...register(`contact.${field.id}`, { required: true })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all"
                />
                {errors?.contact?.[field.id] && (
                  <p className="text-red-500 text-xs mt-1">
                    This field is required
                  </p>
                )}
              </div>
            ))}
          </div>

          <div className="mt-8">
            <button
              type="submit"
              className="cursor-pointer w-full py-3 rounded-xl bg-primary hover:bg-primary-hover text-white font-semibold hover:bg-opacity-90 duration-300 transition-all"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
