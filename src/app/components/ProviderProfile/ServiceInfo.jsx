"use client";

import { useState } from "react";
import {
  ChevronLeft,
  Heart,
  Share2,
  Info,
  Plus,
  Image as ImageIcon,
  ChevronRight,
} from "lucide-react";
import Image from "next/image";
import ServiceForm from "./ServiceForm";
import PutOnSale from "./PutOnSale";
import Calender from "../Modals/Slot/Calender";
import { useUpdateService } from "@/app/hooks/useServices";
import { useDeleteSale } from "@/app/hooks/useSales";
import toast from "react-hot-toast";
import useAuthStore from "@/app/store/useAuthStore";
import useFavourite from "@/app/store/useFavourite";
import ShareButton from "../Reusable/ShareButton";
import Ratings from "../Reusable/Ratings";
import { useQueryClient } from "@tanstack/react-query";
import { useCreateBooking } from "@/app/hooks/useBooking";
import { useRouter } from "next/navigation";

export default function ServiceInfo({
  serviceData,
  profileData,
  isCurrentUser,
  customerId,
  timings,
}) {
  const queryClient = useQueryClient();
  const [selectedAddons, setSelectedAddons] = useState({});
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [fieldImages, setFieldImages] = useState({});
  const [showPutOnSale, setShowPutOnSale] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const updateServiceMutation = useUpdateService();
  const deleteSaleMutation = useDeleteSale();
  const { currentProfile } = useAuthStore();
  const { isFavorite, handleFavorite } = useFavourite();
  const createBooking = useCreateBooking();
  const router = useRouter();

  const toggleAddon = (index) => {
    setSelectedAddons({
      ...selectedAddons,
      [index]: !selectedAddons[index],
    });
  };

  const handleEditService = () => {
    setShowServiceForm(true);
  };

  const handleCloseServiceForm = () => {
    setShowServiceForm(false);
  };

  const handleSubmitServiceForm = async (formData) => {
    try {
      const dataToUpdate = {
        id: serviceData.serviceId,
        ...formData,
      };

      await updateServiceMutation.mutateAsync(dataToUpdate);
      queryClient.invalidateQueries({ queryKey: ["services"] });
      // console.log(
      //   dataToUpdate,
      //   "dataToUpdateeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"
      // );

      setShowServiceForm(false);
      toast.success("Service update successfully");
    } catch (error) {
      console.error("Error updating service:", error);
      toast.error("Error updating service:", error);
    }
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === serviceData.images.length - 1 ? 0 : prev + 1
    );
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? serviceData.images.length - 1 : prev - 1
    );
  };

  const handleSelectTime = () => {
    setShowCalendar(true);
  };

  const handleRequestPrice = async () => {
    try {
      const loadingToast = toast.loading("Processing your booking...");

      const bookingData = {
        customer: customerId,
        provider: serviceData.providerId,
        service: serviceData.serviceId,
        slot: null,
        amount: serviceData.price,
        isManual: false,
        paymentMethod: "cash",
      };

      console.log("bookingData", bookingData);

      await createBooking.mutateAsync(bookingData);

      toast.dismiss(loadingToast);
      toast.success("Booking confirmed successfully!");

      // router.push(`/chat?profileId=${bookingData.provider}`);
      router.push(
        `/chat?profileId=${bookingData.provider}&currentUser=${bookingData.customer}`
      );

      // setSelectedSlot(null); // Clear selected slot
      todaySlotsQuery.refetch(); // Refresh slots
      onClose();
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error(error.response?.data?.message || "Failed to create booking");
    }
  };

  const handleCloseCalendar = () => {
    setShowCalendar(false);
  };

  const handleEndSale = async () => {
    if (serviceData.sales && serviceData.sales.length > 0) {
      const saleId = serviceData.sales[0].id; // Get the first sale ID
      try {
        await deleteSaleMutation.mutateAsync(saleId);
        toast.success("Sale ended successfully");
        // Refresh the service data
        queryClient.invalidateQueries({ queryKey: ["services"] });
      } catch (error) {
        console.error("Error ending sale:", error);
        toast.error("Failed to end sale");
      }
    }
  };

  console.log(
    serviceData,
    "serviceDataaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
  );

  console.log(
    profileData,
    "profileData1111111111111111111111111111111111111111"
  );
  return (
    <>
      <div className="bg-skin-primary p-12">
        {showServiceForm && (
          <ServiceForm
            onSubmit={handleSubmitServiceForm}
            onCancel={handleCloseServiceForm}
            initialData={serviceData}
            onClose={handleCloseServiceForm}
          />
        )}
        <div className="flex flex-col h-full bg-gray-50 text-gray-900 p-4 rounded-lg shadow-2xl relative">
          {/* Header Image */}
          <div className="relative w-full h-80 bg-gray-800 rounded-lg overflow-hidden group">
            {serviceData &&
              serviceData.images &&
              serviceData.images.length > 0 && (
                <div className="absolute inset-0">
                  <Image
                    src={
                      serviceData.images[currentImageIndex]?.url ||
                      "https://via.placeholder.com/400"
                    }
                    alt="Service image"
                    fill
                    className="object-cover transition-transform duration-500"
                    priority
                  />
                </div>
              )}

            {/* Navigation Arrows - only show if there are multiple images */}
            {serviceData &&
              serviceData.images &&
              serviceData.images.length > 1 && (
                <>
                  <button
                    onClick={handlePrevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-black/30 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <button
                    onClick={handleNextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-black/30 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  >
                    <ChevronRight size={24} />
                  </button>
                </>
              )}

            {/* Image Indicators */}
            {serviceData.images && serviceData.images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                {serviceData.images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      currentImageIndex === index
                        ? "bg-white w-4"
                        : "bg-white/50"
                    }`}
                  />
                ))}
              </div>
            )}

            <div className="absolute top-2 right-2 p-4 flex justify-between z-10">
              <div className="flex space-x-2 gap-2">
                <button
                  className={`w-8 h-8 flex items-center justify-center cursor-pointer bg-opacity-50 rounded-full bg-gray-200 text-gray-500 ${
                    isFavorite(serviceData.serviceId) ? "text-red-500" : ""
                  }`}
                  onClick={() => handleFavorite(serviceData.serviceId)}
                  aria-label={
                    isFavorite(serviceData.serviceId)
                      ? "Remove from favorites"
                      : "Add to favorites"
                  }
                >
                  <Heart
                    size={20}
                    fill={
                      isFavorite(serviceData.serviceId)
                        ? "currentColor"
                        : "none"
                    }
                  />
                </button>
                <ShareButton
                  className="w-8 h-8 flex items-center justify-center bg-opacity-50 rounded-full bg-gray-200 text-gray-500 cursor-pointer"
                  title={`Share ${serviceData.title}`}
                  text={`I found this amazing service provider on our platform!`}
                >
                  <Share2 size={20} />
                </ShareButton>
              </div>
              {/* {serviceData.price && (
                <div className="bg-gray-200 backdrop-blur-sm px-4 py-2 rounded-full shadow-md">
                  <span className="font-semibold text-gray-900">
                    {serviceData.price} kr
                  </span>
                  <span className="text-sm text-gray-600 ml-1">
                    {serviceData.priceUnit}
                  </span>
                </div>
              )}
              {serviceData.sales.length > 0 && (
                <div className="bg-gray-200 backdrop-blur-sm px-4 py-2 rounded-full shadow-md">
                  <span className="font-semibold text-gray-900">
                    {serviceData.sales[0].finalPrice} kr
                  </span>
                </div>
              )} */}
            </div>

            <div className="absolute bottom-4 left-4 flex items-center z-10">
              <div className="flex items-center gap-0">
                <div className="relative w-14 h-14 rounded-full overflow-hidden">
                  <Image
                    src={profileData.image || "https://via.placeholder.com/40"}
                    alt={profileData.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <span className="text-white font-lg px-3 py-1 rounded-full">
                  {profileData.name}
                </span>
              </div>
            </div>

            {/* Price Display */}
            <div className="absolute bottom-6 right-4 flex flex-col items-center">
              {/* Discount Badge - only show when sale is active */}
              {serviceData.sales.length > 0 ? (
                // When sale is active, show original price with strikethrough and sale price
                <div className="text-center bg-gray-200 p-2 rounded-full shadow-md">
                  <span className="font-semibold text-gray-600 line-through mr-2">
                    {serviceData.price} kr
                  </span>
                  <span className="font-bold text-gray-900">
                    {serviceData.price - (serviceData.price * serviceData.sales[0].discountPercentage / 100)} kr
                  </span>
                </div>
              ) : (
                // When no sale, show normal price
                <div className="text-center bg-gray-200 p-2 rounded-full shadow-md ">
                  <span className="font-semibold text-gray-900">
                    {serviceData.price} kr
                  </span>
                  <span className="text-sm text-gray-600 ml-1">
                    {serviceData.priceUnit}
                  </span>
                </div>
              )}
              {/* Discount Badge - only show when sale is active */}
              {serviceData.sales.length > 0 && (
                <div className="bg-primary text-white px-4 py-2 rounded-full shadow-md mt-2">
                  {serviceData.sales[0].lastMinDeal === true ? (
                    <span className="font-semibold">Last Min Deal</span>
                  ) : (
                    <span className="font-semibold">
                      {serviceData.sales[0].discountPercentage}% Discount
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto px-4 pb-10">
            <div className="flex justify-between items-center mt-4">
              <div className="flex-1">
                <h1 className="text-lg font-medium">{serviceData.title}</h1>
                <div className="flex items-center text-sm text-gray-500">
                  <span>
                    {serviceData.category} - {serviceData.subcategory}
                  </span>
                </div>
                {serviceData.allowRating && (
                  <div className="flex items-center mt-1">
                    <Ratings
                      rating={profileData.ratings.buyerToProvider.averageRating}
                      size={16}
                    />
                  </div>
                )}
              </div>
              <button className="bg-gray-100 text-sm rounded-lg px-4 py-2 text-gray-800">
                {serviceData.sales.length > 0
                  ? serviceData.sales[0].finalPrice
                  : serviceData.price}
                kr{" "}
                {serviceData.sales.length > 0
                  ? serviceData.sales[0].priceUnit
                  : serviceData.priceUnit}
              </button>
            </div>

            {/* Add-ons */}
            {serviceData.addons.length > 0 && (
              <div className="mt-6">
                <h2 className="text-base font-medium mb-2">Add-ons</h2>
                <div className="space-y-2">
                  {serviceData.addons.map((addon, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200"
                    >
                      <div className="flex items-center">
                        <button
                          className={`w-6 h-6 flex items-center justify-center rounded-full border ${
                            selectedAddons[index]
                              ? "bg-primary border-primary"
                              : "border-gray-300"
                          }`}
                          onClick={() => toggleAddon(index)}
                        >
                          {selectedAddons[index] && (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 text-white"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          )}
                        </button>
                        <span className="ml-3 text-sm">{addon.title}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-sm">+ {addon.price} kr</span>
                        <div className="ml-2 w-4 h-4 bg-secondary/10 rounded-full flex items-center justify-center">
                          <Info size={12} className="text-secondary" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* About */}
            <div className="mt-6">
              <h2 className="text-base font-medium mb-2">About</h2>
              <p className="text-sm text-gray-600">{serviceData.description}</p>
            </div>

            {currentProfile.profileType === "buyer" && (
              <>
                {/* Input Fields */}
                {serviceData.inputFields.map((field, index) => (
                  <div className="mt-6" key={index}>
                    <h2 className="text-base font-medium mb-2">
                      {field.label}
                    </h2>
                    <div className="bg-white border border-gray-200 rounded-lg p-3">
                      {field.type === "text-box" ? (
                        <input
                          type="text"
                          className="w-full text-sm outline-none"
                          placeholder="Type here..."
                        />
                      ) : (
                        field.type === "image" && (
                          <div className="flex flex-col gap-4">
                            <div className="flex flex-wrap gap-4">
                              {/* Existing Images */}
                              {fieldImages[index]?.map((image, imageIndex) => (
                                <ImagePreview
                                  key={imageIndex}
                                  image={image}
                                  onDelete={() => {
                                    const newImages = { ...fieldImages };
                                    newImages[index] = newImages[index].filter(
                                      (_, idx) => idx !== imageIndex
                                    );
                                    setFieldImages(newImages);
                                  }}
                                />
                              ))}

                              {/* Upload Button */}
                              {(fieldImages[index]?.length || 0) < 5 && (
                                <UploadButton
                                  id={`image-upload-${index}`}
                                  imagesCount={fieldImages[index]?.length || 0}
                                  onUpload={(file) => {
                                    const reader = new FileReader();
                                    reader.onloadend = () => {
                                      setFieldImages((prev) => ({
                                        ...prev,
                                        [index]: [
                                          ...(prev[index] || []),
                                          reader.result,
                                        ],
                                      }));
                                    };
                                    reader.readAsDataURL(file);
                                  }}
                                />
                              )}
                            </div>

                            {/* Image Counter */}
                            <ImageCounter
                              count={fieldImages[index]?.length || 0}
                            />
                          </div>
                        )
                      )}
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>

          {/* Footer Button */}
          <div className="bg-white border-t border-gray-200 z-10">
            {isCurrentUser === false ? (
              <button
                onClick={
                  serviceData.allowClientDirectBooking
                    ? handleSelectTime
                    : handleRequestPrice
                }
                className="w-full py-4 bg-primary hover:bg-primary-hover transition-all duration-300 text-white font-semibold rounded-full shadow-lg cursor-pointer"
              >
                {serviceData.allowClientDirectBooking
                  ? "Select time"
                  : "Request Price"}
              </button>
            ) : (
              <div className="flex gap-4 p-4">
                <button
                  onClick={handleEditService}
                  className="flex-1 py-4 bg-primary hover:bg-primary-hover transition-all duration-300 text-white font-semibold rounded-full shadow-lg cursor-pointer"
                >
                  Edit Service
                </button>
                {serviceData.sales && serviceData.sales.length > 0 ? (
                  <button
                    onClick={handleEndSale}
                    disabled={deleteSaleMutation.isPending}
                    className="flex-1 py-4 bg-primary hover:bg-primary-hover transition-all duration-300 text-white font-semibold rounded-full shadow-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {deleteSaleMutation.isPending
                      ? "Ending Sale..."
                      : "End Sale"}
                  </button>
                ) : (
                  <button
                    onClick={() => setShowPutOnSale(true)}
                    className="flex-1 py-4 bg-primary hover:bg-primary-hover transition-all duration-300 text-white font-semibold rounded-full shadow-lg cursor-pointer"
                  >
                    Put on Sale
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Calendar Modal */}
      <Calender
        isOpen={showCalendar}
        onClose={handleCloseCalendar}
        provider={serviceData.providerId}
        service={serviceData.serviceId}
        customer={customerId}
        amount={serviceData.price}
        timings={timings}
      />

      {/* Move the PutOnSale modal here, outside the main container */}
      {showPutOnSale && (
        <div className="fixed inset-0 z-50">
          <PutOnSale
            onClose={() => setShowPutOnSale(false)}
            data={serviceData}
            profileData={profileData}
          />
        </div>
      )}
    </>
  );
}

const ImagePreview = ({ image, onDelete }) => (
  <div className="relative w-40 h-40 group">
    <Image
      src={image}
      alt="Preview"
      fill
      className="object-cover rounded-xl shadow-md"
    />
    <button
      onClick={onDelete}
      className="absolute top-2 right-2 bg-red-500 text-white w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-10"
    >
      ×
    </button>
  </div>
);

const UploadButton = ({ id, imagesCount, onUpload }) => (
  <div className="w-40 h-40">
    <label
      htmlFor={id}
      className="flex flex-col items-center justify-center w-full h-full border-3 border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors"
    >
      <Plus size={32} className="text-gray-400" />
      <span className="text-sm text-gray-500 mt-2">
        {imagesCount ? "Add More" : "Add Image"}
      </span>
      <span className="text-xs text-gray-400 mt-1">
        {5 - imagesCount} remaining
      </span>
    </label>
    <input
      type="file"
      accept="image/*"
      id={id}
      className="hidden"
      onChange={(e) => {
        const file = e.target.files?.[0];
        if (file) {
          onUpload(file);
          e.target.value = "";
        }
      }}
    />
  </div>
);

const ImageCounter = ({ count }) => (
  <div className="text-sm text-gray-500 flex items-center gap-2">
    <div className="flex -space-x-1">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="w-2 h-2 rounded-full bg-primary" />
      ))}
    </div>
    <span>{count} of 5 images</span>
  </div>
);
