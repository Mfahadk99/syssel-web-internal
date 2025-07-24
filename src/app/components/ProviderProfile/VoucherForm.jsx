import React, { useState, useRef } from "react";
import { Upload, Info, X } from "lucide-react";
import { useForm } from "react-hook-form";
import SlidingButtons from "../../components/Reusable/SlidingButtons";
import Image from 'next/image';
import useImageUploader from "../../utils/imgUpload";
// import { useCreateVoucher } from "@/app/hooks/useVoucher";
import toast from "react-hot-toast";

const VoucherForm = ({ onSubmit, onCancel, initialData = {}, providerId, providerTotalServices }) => {
  const { uploadFiles, uploading: isUploading, error: uploadError } = useImageUploader();
  const [activeTab, setActiveTab] = useState("STORE");

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: initialData.title || "",
      about: initialData.about || "",
      voucherValue: initialData.voucherValue || "",
      validity: initialData.validity || "",
      serviceType: initialData.serviceId,
      images: initialData.images || [],
    },
  });

  // Create refs for file inputs
  const fileInputRefs = Array(6)
    .fill(null)
    .map(() => useRef(null));

  const handleImageUpload = (index, e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const newImages = [...watch("images")];
      newImages[index] = {
        url: event.target.result,
        preview: event.target.result,
        file: file,
        id: Math.random().toString(36).substr(2, 9),
      };

      setValue("images", newImages);
    };
    reader.readAsDataURL(file);
  };

  const handleImageClick = (index) => {
    // Trigger click on hidden file input
    if (fileInputRefs[index]?.current) {
      fileInputRefs[index].current.click();
    }
  };

  const removeImage = (index, e) => {
    e.stopPropagation();
    const newImages = [...watch("images")];
    newImages[index] = undefined;
    setValue("images", newImages);
  };

  const onSubmitForm = async (data) => {
    try {
      // Get all image files from the form data
      const imageFiles = data.images
        .filter(img => img && img.file)
        .map(img => img.file);

      let uploadedImageUrls = [];
      
      // Only attempt upload if there are images
      if (imageFiles.length > 0) {
        // Upload all images at once
        const uploadResults = await uploadFiles(imageFiles, { concurrent: true });

        // Process upload results
        for (const result of uploadResults) {
          if (!result.success) {
            throw new Error(`Failed to upload image: ${result.error}`);
          }
          
          // Add all URLs from the result to our array
          if (result.urls && Array.isArray(result.urls)) {
            uploadedImageUrls.push(...result.urls);
          }
        }
      }

      // Prepare the final API data
      const submissionData = {
        providerId: providerId,
        type: activeTab.toUpperCase(),
        images: uploadedImageUrls,
        title: data.title,
        about: data.about,
        voucherValue: Number(data.voucherValue),
        validity: data.validity,
      };

      if (activeTab === "SERVICE") {
        submissionData.serviceId = data.serviceType;
      }

      // Submit the form data
      await onSubmit(submissionData);
      console.log(submissionData, "submissionDataaaaaaaaaaaaaaaaaaaaaa")
      toast.success("Voucher added successfully");
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error(error.message || "Failed to upload images. Please try again.");
    }
  };

  const tabButtons = [
    { id: "STORE", label: "Store" },
    { id: "SERVICE", label: "Service" },
  ];

  const serviceOptions = [
    { value: "Renovation - Consultation", label: "Renovation - Consultation" },
    { value: "Cleaning", label: "Cleaning" },
    { value: "Plumbing", label: "Plumbing" },
    { value: "Electrical", label: "Electrical" },
  ];

  const validityOptions = [
    { value: "", label: "Select", disabled: true },
    { value: "1", label: "1 year" },
    { value: "2", label: "6 months" },
    { value: "3", label: "1 month" },
  ];

  // Define the number of image upload slots
  const imageSlots = Array(6).fill(null);

  // const createVoucherMutation = useCreateVoucher();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="relative bg-white rounded-xl w-full max-w-lg max-h-[90vh] flex flex-col">
        {/* Fixed Header */}
        <div className="ml-6 mt-7">
          <h3 className="text-xl font-bold">Add New Voucher</h3>
        </div>

        {/* Sliding Buttons */}
        <div className="p-6 overflow-y-auto flex-1">
          <div className="mb-6">
            <SlidingButtons
              buttons={tabButtons}
              activeButton={activeTab}
              setActiveButton={setActiveTab}
              className="mx-auto"
            />
          </div>

          <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
            {activeTab === "SERVICE" && (
              <div>
                <label className="block text-sm font-medium mb-1">
                  Service Type
                </label>
                <select
                  {...register("serviceType")}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none"
                >
                  {providerTotalServices.map((option, index) => (
                    <option key={index} value={option.id}>
                      {option.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-sm font-medium text-[var(--color-secondary)]">
                Upload Images
              </label>
              <div className="grid grid-cols-3 gap-4">
                {[0, 1, 2].map((index) => (
                  <div
                    key={index}
                    className="relative aspect-square border-2 border-dashed rounded-lg overflow-hidden"
                  >
                    {watch("images")[index] ? (
                      <div className="relative h-full">
                        <Image
                          src={watch("images")[index].preview}
                          alt={`Upload ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                        <button
                          type="button"
                          onClick={(e) => removeImage(index, e)}
                          className="absolute top-1 right-1 bg-white rounded-full p-1 z-10"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <label className="flex items-center justify-center h-full cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(index, e)}
                          className="hidden"
                          ref={fileInputRefs[index]}
                        />
                        <span className="text-sm text-gray-500">
                          + Add Image
                        </span>
                      </label>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input
                type="text"
                {...register("title", { required: "Title is required" })}
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none"
              />
              {errors.title && (
                <span className="text-red-500 text-sm">
                  {errors.title.message}
                </span>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">About</label>
              <textarea
                {...register("about", { required: "About is required" })}
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none"
                rows="3"
              />
              {errors.about && (
                <span className="text-red-500 text-sm">
                  {errors.about.message}
                </span>
              )}
            </div>

            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">
                  Voucher Value
                </label>
                <div className="flex border border-gray-300 rounded-lg">
                  <input
                    type="number"
                    {...register("voucherValue", {
                      required: "Voucher value is required",
                      min: {
                        value: 0,
                        message: "Voucher value must be greater than 0"
                      },
                      max: {
                        value: 100,
                        message: "Voucher value cannot exceed 100"
                      },
                      valueAsNumber: true
                    })}
                    className="w-full p-2 focus:outline-none rounded-l-lg"
                  />
                  <span className="px-3 py-2 text-gray-500">%</span>
                </div>
                {errors.voucherValue && (
                  <span className="text-red-500 text-sm">
                    {errors.voucherValue.message}
                  </span>
                )}
              </div>

              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">
                  Validity
                </label>
                <input
                  type="date"
                  {...register("validity", {
                    required: "Validity is required",
                  })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none"
                />
                {errors.validity && (
                  <span className="text-red-500 text-sm">
                    {errors.validity.message}
                  </span>
                )}
              </div>
            </div>
          </form>
        </div>

        {/* Fixed Footer */}
        <div className="p-6 bg-white">
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onCancel}
              disabled={isUploading}
              className={`cursor-pointer px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg ${
                isUploading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit(onSubmitForm)}
              disabled={isUploading}
              className={`cursor-pointer px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary)]/90 ${
                isUploading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {isUploading ? "Uploading..." : "Add Voucher"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoucherForm;
