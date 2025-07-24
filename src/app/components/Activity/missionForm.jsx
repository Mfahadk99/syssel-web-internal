import React, { useRef, useState, useEffect } from "react";
import {
  ChevronDown,
  PlusIcon,
  HelpCircle,
  X,
  CheckCircle,
} from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import useAuthStore from "@/app/store/useAuthStore";
import {
  useGetAllCategories,
  useGetAllSubCategories,
} from "@/app/hooks/useCategory";
import { useCreateMission } from "@/app/hooks/useMission";
import toast from "react-hot-toast";
// import { useLoader } from "@/app/context/LoaderContext";
import useImageUploader from "@/app/utils/imgUpload";

// InfoModal component to display help information
const InfoModal = ({ isOpen, onClose, content }) => {
  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-xs bg-black/30"
    >
      <div className="bg-white rounded-4xl w-full max-w-sm overflow-hidden shadow-lg">
        <div className="flex flex-col items-center p-6">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-100 mb-3">
            <HelpCircle className="h-6 w-6 text-primary" />
          </div>
          <h2 className="text-lg font-semibold text-gray-800 text-center">
            {content}
          </h2>
        </div>
      </div>
    </div>
  );
};

// Success Modal component
const SuccessModal = ({ isOpen }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-xs bg-black/30">
      <div className="bg-white rounded-3xl w-full max-w-xs overflow-hidden shadow-lg">
        <div className="flex flex-col items-center p-6">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mb-3">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-xl font-semibold text-green-700 text-center">
            Mission Created!
          </h2>
          <p className="text-sm text-center text-gray-600 mt-2">
            You'll receive a notification when a service provider sends you a
            bid.
          </p>
        </div>
      </div>
    </div>
  );
};

const MissionForm = ({ onClose }) => {
  const fileInputRef = useRef(null);
  // const { loading, setLoading } = useLoader();
  const queryClient = useQueryClient();
  // State for managing info modals
  const [infoModal, setInfoModal] = useState({
    isOpen: false,
    title: "",
    content: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Function to open info modal with specific content
  const openInfoModal = (content) => {
    setInfoModal({
      isOpen: true,
      content,
    });
  };

  // Function to close info modal
  const closeInfoModal = () => {
    setInfoModal({
      ...infoModal,
      isOpen: false,
    });
  };

  const { user } = useAuthStore();
  const { mutate: createMission, isLoading: isCreatingMission } =
    useCreateMission();

  // React Hook Form setup
  const {
    control,
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      category: "",
      subCategory: "",
      images: [],
      title: "",
      about: "",
      location: "",
      hasLocation: false,
      hasDeadline: false,
      deadline: "",
    },
  });

  // Watching values for conditional rendering
  const hasLocation = watch("hasLocation");
  const hasDeadline = watch("hasDeadline");
  const images = watch("images");
  const selectedCategory = watch("category");

  // Fetch categories and subcategories
  const { data: categoriesResponse, isLoading: isLoadingCategories } =
    useGetAllCategories();
  const { data: subCategoriesResponse, isLoading: isLoadingSubCategories } =
    useGetAllSubCategories(selectedCategory);

  const categories = categoriesResponse?.data?.categories || [];
  const allSubCategories = subCategoriesResponse?.data?.subcategories || [];

  // Reset selected subcategory when category changes
  useEffect(() => {
    if (selectedCategory) {
      setValue("subCategory", "");
    }
  }, [selectedCategory, setValue]);

  const {
    uploadFiles,
    uploading: isUploading,
    error: uploadError,
  } = useImageUploader();

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const currentImages = watch("images") || [];
    const remainingSlots = 5 - currentImages.length;

    if (remainingSlots <= 0) {
      alert("Maximum 5 images allowed");
      return;
    }

    const newImages = files.slice(0, remainingSlots).map((file) => ({
      url: URL.createObjectURL(file),
      file: file,
    }));

    setValue("images", [...currentImages, ...newImages]);
  };

  const handleRemoveImage = (indexToRemove) => {
    const currentImages = watch("images");
    setValue(
      "images",
      currentImages.filter((_, index) => index !== indexToRemove)
    );
  };

  const uploadImages = async (imageFiles) => {
    if (!imageFiles.length) return [];
    const uploadedImageUrls = [];
    const uploadResults = await uploadFiles(imageFiles, { concurrent: true });

    for (const result of uploadResults) {
      if (!result.success) {
        throw new Error(`Failed to upload image: ${result.error}`);
      }
      if (result.urls && Array.isArray(result.urls)) {
        uploadedImageUrls.push(...result.urls);
      }
    }
    return uploadedImageUrls;
  };

  const onSubmit = async (data) => {
    if (!user?.id) {
      toast.error("You must be logged in to create a mission");
      return;
    }

    setIsSubmitting(true);
    // setLoading(true);
    try {
      // new images
      const newImages = (data.images || []).filter((img) => img.file);
      const existingImageUrls = (data.images || [])
        .filter((img) => !img.file && img.url)
        .map((img) => img.url);

      let uploadedImageUrls = [];
      if (newImages.length > 0) {
        const imageFiles = newImages.map((img) => img.file);
        uploadedImageUrls = await uploadImages(imageFiles);
      }

      // Combine already uploaded and newly uploaded image URLs
      const allImageUrls = [...existingImageUrls, ...uploadedImageUrls];

      // missionData prepare
      const missionData = {
        userId: user.id,
        category: data.category,
        subcategory: data.subCategory,
        title: data.title,
        about: data.about,
        images: allImageUrls,
        location: data.hasLocation ? data.location : null,
        deadline: data.hasDeadline
          ? new Date(data.deadline).toISOString()
          : null,
      };

      // API call
      createMission(missionData, {
        onSuccess: () => {
          setShowSuccessModal(true);
          // Invalidate and refetch missions data
          queryClient.invalidateQueries({ queryKey: ["missions"] });
          setTimeout(() => {
            setShowSuccessModal(false);
            onClose && onClose();
          }, 3000);
        },
        onError: (error) => {
          console.error("Mission creation failed:", error);
          toast.error("Failed to create mission. Please try again.");
        },
        onSettled: () => {
          setIsSubmitting(false);
          // setLoading(false);
        },
      });
    } catch (error) {
      console.error("Error creating mission:", error);
      toast.error("An error occurred. Please try again.");
      setIsSubmitting(false);
      // setLoading(false);
    }
  };

  // useEffect(() => {
  //   if (isLoadingCategories || isLoadingSubCategories || isCreatingMission) {
  //     setLoading(true);
  //   } else {
  //     setLoading(false);
  //   }
  // }, [
  //   isLoadingCategories,
  //   isLoadingSubCategories,
  //   isCreatingMission,
  //   setLoading,
  // ]);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-lg mx-auto rounded-xl scrollbar-hide overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="bg-white rounded-xl px-4 py-6 w-full mx-auto font-sans">
          {/* close button */}
          <button className="w-full flex justify-end" type="button">
            <X
              onClick={onClose}
              className="h-6 w-6 cursor-pointer text-gray-500"
            />
          </button>
          {/* Header */}
          <div className="mb-2">
            <h2 className="text-2xl text-secondary text-center font-semibold">
              Create Mission
            </h2>
            <p className="text-sm text-center text-gray-600 mt-2">
              Our service providers can see missions posted in their relevant
              category and give you a bid.
            </p>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-6 p-4 mt-6"
          >
            {/* Category */}
            <div>
              <div className="flex items-center justify-between">
                <label className="block text-lg font-medium text-gray-700">
                  Category
                </label>
                <HelpCircle
                  className="h-5 w-5 text-primary cursor-pointer"
                  onClick={() =>
                    openInfoModal(
                      "Choose one category that your mission belongs in."
                    )
                  }
                />
              </div>
              <div className="relative mt-2">
                <select
                  {...register("category", {
                    required: "Category is required",
                  })}
                  className={`w-full p-3 pr-10 border ${
                    errors.category ? "border-red-500" : "border-gray-300"
                  } rounded-lg appearance-none bg-white focus:outline-none text-sm`}
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
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 pointer-events-none" />
                {errors.category && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.category.message}
                  </p>
                )}
              </div>
            </div>

            {/* Sub Category */}
            <div>
              <div className="flex items-center justify-between">
                <label className="block text-lg font-medium text-gray-700">
                  Sub Category
                </label>
                <HelpCircle
                  className="h-5 w-5 text-primary cursor-pointer"
                  onClick={() =>
                    openInfoModal(
                      "Choose one subcategory that your mission belongs in."
                    )
                  }
                />
              </div>
              <div className="relative mt-2">
                <select
                  {...register("subCategory", {
                    required: "Subcategory is required",
                  })}
                  disabled={!selectedCategory}
                  className={`w-full p-3 pr-10 border ${
                    errors.subCategory ? "border-red-500" : "border-gray-300"
                  } rounded-lg appearance-none bg-white focus:outline-none text-sm ${
                    !selectedCategory ? "bg-gray-50 text-gray-400" : ""
                  }`}
                >
                  <option value="">
                    {selectedCategory
                      ? "Select subcategory"
                      : "Select a category first"}
                  </option>
                  {isLoadingSubCategories ? (
                    <option disabled>Loading subcategories...</option>
                  ) : allSubCategories && allSubCategories.length > 0 ? (
                    allSubCategories.map((subCategory) => (
                      <option key={subCategory._id} value={subCategory._id}>
                        {subCategory.name}
                      </option>
                    ))
                  ) : (
                    <option disabled>
                      {selectedCategory
                        ? "No subcategories available"
                        : "Select a category first"}
                    </option>
                  )}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 pointer-events-none" />
                {errors.subCategory && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.subCategory.message}
                  </p>
                )}
              </div>
            </div>

            {/* Cover Images */}
            <div>
              <div className="flex items-center justify-between">
                <label className="block text-base font-medium text-gray-700">
                  Cover Image(s)
                </label>
                <HelpCircle
                  className="h-5 w-5 text-primary cursor-pointer"
                  onClick={() =>
                    openInfoModal("Choose a cover image for your mission.")
                  }
                />
              </div>
              <div className="grid grid-cols-3 gap-4 mt-2">
                {/* Display uploaded images */}
                {images && images.length > 0
                  ? images.map((image, index) => (
                      <div
                        key={index}
                        className="relative aspect-square border border-gray-200 rounded-lg overflow-hidden"
                      >
                        <img
                          src={image.url}
                          alt={`Upload ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          className="absolute top-2 right-2 bg-red-500 rounded-full p-1 text-white hover:bg-red-600 shadow-md"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))
                  : null}

                {/* Image upload placeholders - only show as many as needed to reach 5 total */}
                {Array.from({
                  length: Math.max(0, 5 - (images?.length || 0)),
                }).map((_, index) => (
                  <div
                    key={`placeholder-${index}`}
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-primary transition-colors aspect-square"
                  >
                    <PlusIcon className="text-gray-400 h-6 w-6" />
                  </div>
                ))}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </div>
              {/* Show image count */}
              <p className="text-xs text-gray-500 mt-2">
                {images?.length || 0} of 5 images uploaded
              </p>
            </div>

            {/* Information */}
            <div>
              <div className="flex items-center justify-between">
                <label className="block text-base font-medium text-gray-700">
                  Information
                </label>
                <HelpCircle
                  className="h-5 w-5 text-primary cursor-pointer"
                  onClick={() =>
                    openInfoModal(
                      "Provide a clear title and detailed description about your mission. Be specific about what you need to help service providers understand your requirements."
                    )
                  }
                />
              </div>
              <div className="mt-2 space-y-2">
                <input
                  {...register("title", {
                    required: "Title is required",
                  })}
                  placeholder="Title"
                  className={`w-full p-3 border ${
                    errors.title ? "border-red-500" : "border-gray-300"
                  } hover:bg-gray-50 focus:outline-none rounded-lg`}
                />
                {errors.title && (
                  <p className="text-red-500 text-xs">{errors.title.message}</p>
                )}

                <textarea
                  {...register("about", {
                    required: "Description is required",
                  })}
                  placeholder="About"
                  rows={5}
                  className={`w-full p-3 border ${
                    errors.about ? "border-red-500" : "border-gray-300"
                  } hover:bg-gray-50 focus:outline-none rounded-lg`}
                />
                {errors.about && (
                  <p className="text-red-500 text-xs">{errors.about.message}</p>
                )}
              </div>
            </div>

            {/* Location and Deadline */}
            <div className="mb-4">
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-2">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <Controller
                      name="hasLocation"
                      control={control}
                      render={({ field: { onChange, value, ref } }) => (
                        <input
                          type="checkbox"
                          checked={value}
                          onChange={(e) => {
                            onChange(e.target.checked);
                            if (!e.target.checked) {
                              setValue("location", "");
                            }
                          }}
                          ref={ref}
                          className="sr-only"
                        />
                      )}
                    />
                    <div
                      className={`w-10 h-6 rounded-full transition-colors ${
                        hasLocation ? "bg-primary" : "bg-gray-200"
                      }`}
                    >
                      <div
                        className={`h-5 w-5 rounded-full bg-white transition-transform transform ${
                          hasLocation ? "translate-x-4" : "translate-x-1"
                        } mt-0.5`}
                      ></div>
                    </div>
                  </label>
                  <span className="text-sm font-medium">Location</span>
                </div>

                <div className="flex items-center gap-2">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <Controller
                      name="hasDeadline"
                      control={control}
                      render={({ field: { onChange, value, ref } }) => (
                        <input
                          type="checkbox"
                          checked={value}
                          onChange={(e) => {
                            onChange(e.target.checked);
                            if (e.target.checked) {
                              const today = new Date();
                              setValue(
                                "deadline",
                                today.toISOString().split("T")[0]
                              );
                            } else {
                              setValue("deadline", "");
                            }
                          }}
                          ref={ref}
                          className="sr-only"
                        />
                      )}
                    />
                    <div
                      className={`w-10 h-6 rounded-full transition-colors ${
                        hasDeadline ? "bg-primary" : "bg-gray-200"
                      }`}
                    >
                      <div
                        className={`h-5 w-5 rounded-full bg-white transition-transform transform ${
                          hasDeadline ? "translate-x-4" : "translate-x-1"
                        } mt-0.5`}
                      ></div>
                    </div>
                  </label>
                  <span className="text-sm font-medium">Deadline</span>
                </div>
              </div>

              <div className="mt-2 flex justify-between">
                {hasLocation ? (
                  <input
                    {...register("location", {
                      required: hasLocation ? "Location is required" : false,
                    })}
                    placeholder="Add location..."
                    className={`p-2 text-sm border-0 border-b ${
                      errors.location ? "border-red-500" : "border-gray-300"
                    } focus:outline-none w-1/2`}
                  />
                ) : (
                  <span className="text-sm text-gray-400 p-2">
                    Add location...
                  </span>
                )}

                {hasDeadline ? (
                  <Controller
                    name="deadline"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="date"
                        placeholder="DD/MM/YYYY"
                        className="p-2 text-sm text-gray-500 border-0 border-b border-gray-300 focus:outline-none text-right"
                      />
                    )}
                  />
                ) : (
                  <span className="text-sm text-gray-400 p-2">DD/MM/YYYY</span>
                )}
              </div>
              {errors.location && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.location.message}
                </p>
              )}
            </div>

            {/* Create Mission Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3 rounded-full transition-colors bg-primary text-white hover:bg-primary-hover mt-8 ${
                isSubmitting ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {isSubmitting ? "Creating..." : "Create Mission"}
            </button>
          </form>
        </div>
      </div>

      {/* Info Modal */}
      <InfoModal
        isOpen={infoModal.isOpen}
        onClose={closeInfoModal}
        title={infoModal.title}
        content={infoModal.content}
      />

      {/* Success Modal */}
      <SuccessModal isOpen={showSuccessModal} />
    </div>
  );
};

export default MissionForm;
