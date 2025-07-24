import { useState, useMemo, useEffect } from "react";
import { Calendar } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import Image from "next/image";
import toast from "react-hot-toast";
import { useCreateSale } from "@/app/hooks/useSales";
import { useQueryClient } from "@tanstack/react-query";

export default function ServiceSaleModal({
  onClose,
  data: service,
  profileData,
}) {
  const queryClient = useQueryClient();
  const createSale = useCreateSale();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      lastMinDeal: false,
      followerExclusive: false,
      discountPercentage: "10",
      endDateTime: "",
    },
  });
  const serviceData = {
    title: service?.title,
    price: service?.price,
    image: service?.images[0]?.url,
    rating: profileData?.ratings?.buyerToProvider?.averageRating,
    reviewCount: profileData?.ratings?.buyerToProvider?.totalReviews,
  };

  // Watch form values for preview
  const watchedValues = watch();

  // Watch lastMinDeal value
  const lastMinDeal = watch("lastMinDeal");

  // Effect to handle lastMinDeal changes
  useEffect(() => {
    if (lastMinDeal) {
      // Set end date to 24 hours from now
      const endDate = new Date();
      // Add 24 hours in milliseconds
      endDate.setTime(endDate.getTime() + 24 * 60 * 60 * 1000);

      // Format the date for the input
      const year = endDate.getFullYear();
      const month = String(endDate.getMonth() + 1).padStart(2, "0");
      const day = String(endDate.getDate()).padStart(2, "0");
      const hours = String(endDate.getHours()).padStart(2, "0");
      const minutes = String(endDate.getMinutes()).padStart(2, "0");

      const formattedDate = `${year}-${month}-${day}T${hours}:${minutes}`;
      setValue("endDateTime", formattedDate);
    }
  }, [lastMinDeal, setValue]);

  // Calculate discounted price in real time
  const discountedPrice = useMemo(() => {
    const discount = parseInt(watchedValues.discountPercentage) || 0;
    return serviceData.price - (serviceData.price * discount) / 100;
  }, [watchedValues.discountPercentage, serviceData.price]);

  // Format end date for display
  const formattedEndDate = useMemo(() => {
    if (!watchedValues.endDateTime) return null;
    return new Date(watchedValues.endDateTime).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    });
  }, [watchedValues.endDateTime]);

  const onSubmit = async (data) => {
    const saleData = {
      service: service?.serviceId,
      discountPercentage: parseInt(data?.discountPercentage),
      lastMinDeal: data?.lastMinDeal,
      followerExclusive: data?.followerExclusive,
      endDate: new Date(data?.endDateTime).toISOString(),
      status: "pending",
    };

    try {
      await createSale.mutateAsync(saleData);
      toast.success("Service put on sale!");
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      // window.location.reload();
      onClose();
    } catch (error) {
      toast.error("Failed to put service on sale. Please try again.");
      console.error("Error creating sale:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative">
        <form onSubmit={handleSubmit(onSubmit)} className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">
              Put Service on Sale
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1 hover:bg-gray-100 rounded-full"
            >
              ✕
            </button>
          </div>

          <div className="space-y-4">
            {/* Toggle buttons in a row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-3 rounded-xl">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last minute deal
                </label>
                <input
                  type="checkbox"
                  {...register("lastMinDeal")}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full 
                    ${
                      watchedValues.lastMinDeal ? "bg-primary" : "bg-gray-200"
                    }`}
                />
              </div>

              <div className="bg-gray-50 p-3 rounded-xl">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Follower exclusive
                </label>
                <input
                  type="checkbox"
                  {...register("followerExclusive")}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full 
                    ${
                      watchedValues.followerExclusive
                        ? "bg-primary"
                        : "bg-gray-200"
                    }`}
                />
              </div>
            </div>

            {/* Discount and DateTime in a row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-3 rounded-xl">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Discount
                </label>
                <select
                  {...register("discountPercentage", {
                    required: "Discount is required",
                  })}
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary/20 transition-all duration-200 bg-white"
                >
                  <option value="5">5%</option>
                  <option value="10">10%</option>
                  <option value="15">15%</option>
                  <option value="20">20%</option>
                  <option value="25">25%</option>
                  <option value="30">30%</option>
                  <option value="50">50%</option>
                </select>
                {errors.discountPercentage && (
                  <span className="text-red-500 text-xs mt-1">
                    {errors.discountPercentage.message}
                  </span>
                )}
              </div>

              <div className="bg-gray-50 p-3 rounded-xl">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End date
                </label>
                <div className="relative">
                  <input
                    type="datetime-local"
                    {...register("endDateTime", {
                      required: "End date is required",
                    })}
                    disabled={lastMinDeal}
                    className={`block w-full rounded-lg border-gray-300 pl-8 shadow-sm focus:border-primary focus:ring focus:ring-primary/20 transition-all duration-200 bg-white ${
                      lastMinDeal ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                    min={new Date().toISOString().slice(0, 16)}
                  />
                  <div className="absolute inset-y-0 left-0 flex items-center pl-2 pointer-events-none">
                    <Calendar className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
                {errors.endDateTime && (
                  <span className="text-red-500 text-xs mt-1">
                    {errors.endDateTime.message}
                  </span>
                )}
                {lastMinDeal && (
                  <span className="text-xs text-gray-500 mt-1">
                    End date automatically set to 24 hours from now
                  </span>
                )}
              </div>
            </div>

            {/* Preview card */}
            <div className="bg-gray-50 p-4 rounded-xl">
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                Preview
              </h3>
              <div className="bg-white border border-gray-200 rounded-xl p-3">
                <div className="flex gap-3">
                  <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden relative">
                    <Image
                      src={serviceData.image}
                      alt="Service"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-800 truncate">
                      {serviceData.title}
                    </h4>
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <span>★</span>
                      <span className="ml-1">{serviceData.rating}</span>
                      <span className="ml-1">({serviceData.reviewCount})</span>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-red-500 font-medium">
                        ${discountedPrice.toFixed(2)}
                      </span>
                      <span className="text-gray-400 text-sm line-through">
                        ${serviceData.price.toFixed(2)}
                      </span>
                      <span className="bg-red-100 text-red-800 text-xs px-2 py-0.5 rounded">
                        {watchedValues.discountPercentage}% OFF
                      </span>
                    </div>
                    {formattedEndDate && (
                      <div className="mt-2 text-xs text-gray-500">
                        Ends on {formattedEndDate}
                      </div>
                    )}
                    {watchedValues.lastMinDeal && (
                      <span className="mt-2 inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded">
                        Last Minute Deal
                      </span>
                    )}
                    {watchedValues.followerExclusive && (
                      <span className="mt-2 ml-2 inline-block bg-purple-100 text-purple-800 text-xs px-2 py-0.5 rounded">
                        Followers Only
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100">
            <button
              type="submit"
              className="w-full bg-primary text-white py-3 px-4 rounded-xl hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 transition-all duration-200 font-medium shadow-sm hover:shadow-md active:scale-[0.98]"
            >
              Put on Sale
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
