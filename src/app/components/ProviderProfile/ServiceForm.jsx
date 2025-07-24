import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, PlusIcon, HelpCircle, X } from "lucide-react";
import { useForm } from "react-hook-form";
import useImageUploader from "../../utils/imgUpload";
import Image from "next/image";
import toast from "react-hot-toast";

const DUMMY_IMAGE_URL =
  "https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1";

const HelpModal = ({ isOpen, onClose, title, content }) => {
  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    // Check if the click was on the overlay (not the modal content)
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/30 flex items-center justify-center z-[60]"
      onClick={handleOverlayClick}
    >
      <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className="bg-[var(--color-primary)]/10 p-3 rounded-full mb-4">
            <HelpCircle className="h-6 w-6 text-[var(--color-primary)]" />
          </div>

          <h3 className="font-medium text-lg mb-3">{title}</h3>

          <p className="text-gray-600 text-sm leading-relaxed">{content}</p>
        </div>
      </div>
    </div>
  );
};

const ServiceForm = ({
  onSubmit,
  onCancel,
  initialData = {},
  providerId,
  subcategories,
  sectionId,
  onClose,
  providerSetting,
}) => {
  const {
    uploadFiles,
    uploading: isUploading,
    error: uploadError,
  } = useImageUploader();

  const isDirectBookingAllow =
    providerSetting?.data?.calendarAndBooking?.allowDirectBooking;

  const [availableSubcategories, setAvailableSubcategories] = useState(
    initialData.providerSubCategories || subcategories || []
  );
  const fileInputRef = useRef(null);
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    control,
  } = useForm({
    defaultValues: {
      category: initialData.category || "",
      subcategories: initialData.providerSubCategories,
      images: initialData.images || [],
      title: initialData.title || "",
      about: initialData.description || "",
      defaultPrice: initialData.price || "",
      priceUnit: initialData.priceUnit || "Per Session",
      vat: initialData.vat || "",
      defaultDuration: initialData.defaultDuration || "",
      allowClientDirectBooking: initialData.allowClientDirectBooking || false,
      allowRating: initialData.allowRating || true,
      homeService: initialData.homeService || false,
      nonRefundable: initialData.nonRefundable || false,
      addons: initialData.addons || [],
      inputFields: initialData.inputFields || [
        { type: "text", label: "", enabled: true },
      ],
    },
  });

  const [helpModal, setHelpModal] = useState({
    isOpen: false,
    title: "",
    content: "",
  });

  useEffect(() => {
    setAvailableSubcategories(
      initialData.providerSubCategories || subcategories || []
    );
  }, [initialData.providerSubCategories, subcategories]);

  // Add effect to reset allowClientDirectBooking when direct booking is disabled
  useEffect(() => {
    if (!isDirectBookingAllow) {
      setValue("allowClientDirectBooking", false);
    }
  }, [isDirectBookingAllow, setValue]);

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const currentImages = watch("images");
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

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setValue(name, type === "checkbox" ? checked : value);
  };

  const [addon, setAddon] = useState({ title: "", price: "" });

  const handleAddAddon = () => {
    if (addon.title && addon.price) {
      const currentAddons = watch("addons") || [];
      const newAddon = {
        title: addon.title,
        price: addon.price,
      };
      setValue("addons", [...currentAddons, newAddon]);
      setAddon({ title: "", price: "" });
    }
  };

  const handleRemoveAddon = (index) => {
    const currentAddons = watch("addons");
    setValue(
      "addons",
      currentAddons.filter((_, i) => i !== index)
    );
  };

  const handleInputFieldChange = (index, field, value) => {
    const currentFields = watch("inputFields");
    const updatedFields = currentFields.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    );
    setValue("inputFields", updatedFields);
  };

  const handleAddInputField = () => {
    const currentFields = watch("inputFields");
    setValue("inputFields", [
      ...currentFields,
      { type: "text", label: "", enabled: true },
    ]);
  };

  const onSubmitForm = async (data) => {
    try {
      // Check if there's a pending addon that hasn't been added yet
      if (addon.title && addon.price) {
        const currentAddons = data.addons || [];
        const newAddon = {
          title: addon.title,
          price: addon.price,
        };
        data.addons = [...currentAddons, newAddon];
      }

      // Separate new images (with file objects) from existing images (URLs only)
      const newImages = data.images.filter((img) => img.file);
      const existingImages = data.images.filter((img) => !img.file && img.url);

      let uploadedImageUrls = [];

      // Add existing image URLs first
      uploadedImageUrls.push(...existingImages.map((img) => img.url));

      // Only upload new images if there are any
      if (newImages.length > 0) {
        const imageFiles = newImages.map((img) => img.file);

        try {
          const uploadResults = await uploadFiles(imageFiles, {
            concurrent: true,
          });

          // Ensure uploadResults is iterable
          const resultsArray = Array.isArray(uploadResults)
            ? uploadResults
            : [uploadResults];

          // Process upload results
          for (const result of resultsArray) {
            if (!result.success) {
              throw new Error(`Failed to upload image: ${result.error}`);
            }

            // Add all URLs from the result to our array
            if (result.urls && Array.isArray(result.urls)) {
              uploadedImageUrls.push(...result.urls);
            } else if (result.url) {
              // Handle single URL case
              uploadedImageUrls.push(result.url);
            }
          }
        } catch (uploadError) {
          console.error("Upload error:", uploadError);
          throw new Error("Failed to upload images. Please try again.");
        }
      }

      // Prepare the final API data
      const apiData = {
        provider: providerId,
        title: data.title,
        subcategory: data.category,
        description: data.about,
        defaultDuration: parseInt(data.defaultDuration) || 0,
        defaultPrice: parseFloat(data.defaultPrice) || 0,
        perHourPrice:
          data.priceUnit === "Per Hour"
            ? parseFloat(data.defaultPrice) || 0
            : 0,
        vatPercentage: parseInt(data.vat) || 0,
        directBooking: data.allowClientDirectBooking,
        allowRating: data.allowRating,
        homeService: data.homeService,
        nonRefundable: data.nonRefundable,
        addOns: data.addons.map((addon) => ({
          title: addon.title,
          price: parseFloat(addon.price) || 0,
        })),
        inputBoxes: (data.inputFields || []).map((field) => ({
          value: field.label,
          inputType: field.type === "text" ? "text-box" : "image",
          isEnabled: field.enabled,
        })),
        images: uploadedImageUrls,
        sections: initialData.sections || [sectionId] || [],
        status: "active",
        priceUnit: data.priceUnit || "per-session",
      };

      // Submit the form data
      await onSubmit(apiData);
      console.log(apiData, "Service data prepared for submission");
      toast.success("Service updated successfully");
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error(
        error.message || "Failed to update service. Please try again."
      );
    }
  };

  const toggleSettings = [
    {
      name: "allowClientDirectBooking",
      label: "Allow client's direct booking",
      checked: watch("allowClientDirectBooking"),
      disabled: !isDirectBookingAllow,
      title: "Booking Help",
      help: "Allow clients to directly book this service into your calendar.(Must be enabled in settings)",
    },
    {
      name: "allowRating",
      label: "Allow rating",
      checked: watch("allowRating"),
      disabled: false,
      title: "Rating Help",
      help: "Allow clients to rate this service. This will apply to your store and any other providers linked to this service.",
    },
    {
      name: "homeService",
      label: "Home service",
      checked: watch("homeService"),
      disabled: false,
      title: "Home Service Help",
      help: "Clients can request this service to their location",
    },
    {
      name: "nonRefundable",
      label: "Non-refundable",
      checked: watch("nonRefundable"),
      disabled: false,
    },
  ];

  const vatOptions = [
    { value: "", label: "VAT %", status: "disabled" },
    { value: "0", label: "0%", status: "enabled" },
    { value: "12", label: "12%", status: "enabled" },
    { value: "15", label: "15%", status: "enabled" },
    { value: "25", label: "25%", status: "enabled" },
  ];

  const durationOptions = [
    { value: "", label: "Default duration" },
    { value: "30", label: "30 min" },
    { value: "60", label: "1 hour" },
    { value: "120", label: "2 hours" },
  ];

  const priceUnits = [
    { value: "per-hour", label: "Per Hour" },
    { value: "per-session", label: "Per Session" },
    { value: "fixed-price", label: "Fixed Price" },
  ];

  const inputTypeOptions = [
    { value: "text", label: "Text box" },
    { value: "image", label: "Image upload" },
  ];

  const ImageDisplay = ({ item }) => (
    <div className="relative">
      <Image
        src={item.url}
        alt="Upload"
        fill
        className="object-cover rounded-lg"
      />
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleRemoveImage(
            watch("images").findIndex((img) => img.url === item.url)
          );
        }}
        className="absolute top-2 right-2 bg-red-500 rounded-full p-1 text-white hover:bg-red-600 z-10"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
  const handleOverlayClick = (e) => {
    // Check if the click was on the overlay (not the modal content)
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      onClick={handleOverlayClick}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
    >
      <div className="bg-white p-6 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <form
          onSubmit={handleSubmit(onSubmitForm)}
          className="bg-white p-4 w-full mx-auto font-sans"
        >
          <h1 className="text-xl font-medium mb-6">Add a Service</h1>

          <div className="space-y-6">
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Category
              </label>
              <div className="relative">
                <select
                  {...register("category", {
                    required: "Category is required",
                  })}
                  defaultValue={initialData.subcategory}
                  className="w-full p-2.5 border border-gray-300 hover:bg-gray-50 rounded-lg appearance-none bg-white pr-8 focus:outline-none"
                >
                  <option value="" disabled>
                    Select category
                  </option>
                  {availableSubcategories?.map((category, index) => (
                    <option key={index} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-3 h-4 w-4 text-gray-500 pointer-events-none" />
              </div>
              {errors.category && (
                <span className="text-red-500 text-sm">
                  {errors.category.message}
                </span>
              )}
            </div>

            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Images ({watch("images").length}/5)
                </label>
                <button
                  type="button"
                  onClick={() =>
                    setHelpModal({
                      isOpen: true,
                      title: "Images Help",
                      content:
                        "Choose up to 5 images showcasing your service. Use high-res images and avoid white backgrounds.",
                    })
                  }
                >
                  <HelpCircle className="h-4 w-4 text-[var(--color-primary)]" />
                </button>
              </div>

              {watch("images").length > 0 && (
                <div className="grid grid-cols-3 gap-4 mb-4">
                  {watch("images").map((image, index) => (
                    <div key={index} className="relative aspect-square">
                      <Image
                        src={image.url}
                        alt={`Upload ${index + 1}`}
                        fill
                        className="object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute top-2 right-2 bg-red-500 rounded-full p-1 text-white hover:bg-red-600 z-10"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {watch("images").length < 5 && (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-[var(--color-primary)] transition-colors h-32"
                >
                  <PlusIcon className="text-gray-400 h-6 w-6" />
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleImageUpload}
              />
            </div>

            <div className="mb-4">
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium">Information</label>
                <button
                  type="button"
                  onClick={() =>
                    setHelpModal({
                      isOpen: true,
                      title: "Service Information",
                      content:
                        "Describe your service. Add details about what information you need from clients for booking.",
                    })
                  }
                >
                  <HelpCircle className="h-4 w-4 text-primary" />
                </button>
              </div>
              <input
                type="text"
                {...register("title", { required: "Title is required" })}
                placeholder="Title"
                className="w-full p-3 border  border-gray-300 hover:bg-gray-50 focus:outline-none rounded-lg mb-2"
              />
              {errors.title && (
                <span className="text-red-500 text-sm">
                  {errors.title.message}
                </span>
              )}
              <textarea
                {...register("about", { required: "About is required" })}
                placeholder="About"
                rows={5}
                maxLength="500"
                className="resize-none w-full p-3 border border-gray-300 hover:bg-gray-50 focus:outline-none rounded-lg mb-2"
              />
              {errors.about && (
                <span className="text-red-500 text-sm">
                  {errors.about.message}
                </span>
              )}
            </div>

            <div className="mb-4 grid grid-cols-4 gap-4">
              <div className="col-span-2">
                <input
                  type="text"
                  {...register("defaultPrice", {
                    required: "Price is required",
                  })}
                  placeholder="Default price"
                  className="w-full p-3 border border-gray-300 hover:bg-gray-50 focus:outline-none rounded-full mb-2"
                />
                {errors.defaultPrice && (
                  <span className="text-red-500 text-sm">
                    {errors.defaultPrice.message}
                  </span>
                )}
              </div>
              <div className="col-span-2 relative">
                <select
                  {...register("priceUnit")}
                  className="w-full p-3 border border-gray-300 hover:bg-gray-50 focus:outline-none rounded-full appearance-none pr-8"
                >
                  {priceUnits.map((unit) => (
                    <option key={unit.value} value={unit.value}>
                      {unit.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              </div>
            </div>

            <div className="mb-4 grid grid-cols-2 gap-4">
              <div className="relative">
                <select
                  {...register("vat")}
                  className="w-full p-3 border border-gray-300 hover:bg-gray-50 focus:outline-none rounded-full appearance-none pr-8"
                >
                  {vatOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              </div>
              <div className="relative">
                <select
                  {...register("defaultDuration")}
                  className="w-full p-3 border border-gray-300 hover:bg-gray-50 focus:outline-none rounded-full appearance-none pr-8"
                >
                  {durationOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {toggleSettings.map((setting) => (
                <div
                  key={setting.name}
                  className={`flex justify-between items-center p-3 rounded-lg ${
                    setting.disabled ? "bg-gray-100 opacity-60" : "bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-sm ${
                        setting.disabled ? "text-gray-500" : ""
                      }`}
                    >
                      {setting.label}
                    </span>
                    {setting.help && (
                      <button
                        type="button"
                        onClick={() =>
                          setHelpModal({
                            isOpen: true,
                            title: setting.title,
                            content: setting.help,
                          })
                        }
                        disabled={setting.disabled}
                      >
                        <HelpCircle
                          className={`h-4 w-4 ${
                            setting.disabled
                              ? "text-gray-400"
                              : "text-[var(--color-primary)]"
                          }`}
                        />
                      </button>
                    )}
                  </div>
                  <label
                    className={`relative inline-flex items-center ${
                      setting.disabled ? "cursor-not-allowed" : "cursor-pointer"
                    }`}
                  >
                    <input
                      type="checkbox"
                      {...register(setting.name)}
                      disabled={setting.disabled}
                      className="sr-only"
                    />
                    <div
                      className={`w-10 h-6 rounded-full transition-colors ${
                        setting.disabled
                          ? "bg-gray-300"
                          : watch(setting.name)
                          ? "bg-[var(--color-primary)]"
                          : "bg-gray-200"
                      }`}
                    >
                      <div
                        className={`h-5 w-5 rounded-full bg-white transition-transform transform ${
                          setting.disabled
                            ? "translate-x-1"
                            : watch(setting.name)
                            ? "translate-x-4"
                            : "translate-x-1"
                        } mt-0.5`}
                      ></div>
                    </div>
                  </label>
                </div>
              ))}
            </div>

            <div className="mb-6 bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Add-ons</h2>
                <button
                  type="button"
                  className="p-2 rounded-full"
                  onClick={() =>
                    setHelpModal({
                      isOpen: true,
                      title: "Add-ons Help",
                      content:
                        "Add any add-ons to your service which clients can include in their booking request.",
                    })
                  }
                >
                  <HelpCircle className="h-4 w-4 text-[var(--color-primary)]" />
                </button>
              </div>

              <div className="space-y-2">
                {watch("addons").map((item, index) => (
                  <div key={index} className="flex justify-between gap-3 mb-2">
                    <input
                      type="text"
                      value={item.title}
                      readOnly
                      className="flex-grow p-3 focus:outline-none rounded-full bg-gray-50"
                    />
                    <input
                      type="text"
                      value={item.price}
                      readOnly
                      className="w-28 p-3 focus:outline-none rounded-full bg-gray-50"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveAddon(index)}
                      className="text-red-500 hover:text-red-600 cursor-pointer rounded-full"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex gap-3 mb-4 mt-3">
                <input
                  type="text"
                  placeholder="Title"
                  value={addon.title}
                  onChange={(e) =>
                    setAddon({ ...addon, title: e.target.value })
                  }
                  className="flex-1 px-4 py-3 rounded-full bg-gray-100 border-none focus:outline-none"
                />
                <div className="relative">
                  <input
                    type="number"
                    placeholder="Price"
                    value={addon.price}
                    onChange={(e) =>
                      setAddon({ ...addon, price: e.target.value })
                    }
                    className="w-40 px-4 py-3 rounded-full bg-gray-100 border-none focus:outline-none pr-12"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                    kr
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleAddAddon}
                className="w-6 h-6 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center hover:bg-[var(--color-primary)]/90 transition-colors"
              >
                <PlusIcon className="w-4 h-4" />
              </button>
            </div>

            <div className="mb-4 bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Input boxes</h2>
                <button
                  type="button"
                  className="p-2 rounded-full"
                  onClick={() =>
                    setHelpModal({
                      isOpen: true,
                      title: "Input Boxes Help",
                      content: `Add input boxes to your service for clients to fill out upon booking. Toggle Required / Optional.`,
                    })
                  }
                >
                  <HelpCircle className="h-4 w-4 text-[var(--color-primary)]" />
                </button>
              </div>

              <div className="space-y-3">
                {watch("inputFields").map((field, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <input
                      type="text"
                      placeholder="Enter field label"
                      value={field.label}
                      onChange={(e) =>
                        handleInputFieldChange(index, "label", e.target.value)
                      }
                      className="flex-grow p-3 rounded-full bg-white shadow-sm border-none focus:outline-none"
                    />

                    <div className="relative">
                      <select
                        value={field.type}
                        onChange={(e) =>
                          handleInputFieldChange(index, "type", e.target.value)
                        }
                        className="appearance-none bg-white p-3 pr-10 rounded-full shadow-sm border-none focus:outline-none w-40"
                      >
                        {inputTypeOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                    </div>

                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={field.enabled}
                        onChange={(e) =>
                          handleInputFieldChange(
                            index,
                            "enabled",
                            e.target.checked
                          )
                        }
                        className="sr-only"
                      />
                      <div
                        className={`w-12 h-6 rounded-full transition-colors ${
                          field.enabled ? "bg-primary" : "bg-gray-200"
                        }`}
                      >
                        <div
                          className={`h-6 w-6 rounded-full bg-white transition-transform transform ${
                            field.enabled ? "translate-x-6" : "translate-x-0"
                          } shadow`}
                        ></div>
                      </div>
                    </label>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={handleAddInputField}
                className="mt-4 w-6 h-6 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center hover:bg-[var(--color-primary)]/90 transition-colors"
              >
                <PlusIcon className="w-4 h-4" />
              </button>
            </div>

            <div className="flex space-x-4 pt-6">
              <button
                type="button"
                onClick={onCancel}
                disabled={isUploading}
                className={`cursor-pointer px-8 py-3 rounded-full flex-1 border border-gray-300 ${
                  isUploading
                    ? "text-gray-400"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isUploading}
                className={`cursor-pointer px-8 py-3 rounded-full flex-1 ${
                  isUploading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90"
                } text-white`}
              >
                {isUploading ? "Uploading..." : "Add Service"}
              </button>
            </div>
          </div>
        </form>
      </div>
      <HelpModal
        isOpen={helpModal.isOpen}
        onClose={() => setHelpModal({ isOpen: false, title: "", content: "" })}
        title={helpModal.title}
        content={helpModal.content}
      />
    </div>
  );
};

export default ServiceForm;
