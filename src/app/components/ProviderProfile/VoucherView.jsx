"use client";
import { ArrowLeft, Heart, Share2, User } from "lucide-react";
import { useState } from "react";
import Image from "next/image";
import { useUpdateVoucher, useGetVouchersByIds } from "../../hooks/useVoucher";
import useAuthStore from "@/app/store/useAuthStore";
import { toast } from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";

export default function VoucherView({ data, providerData }) {
  const { currentProfile } = useAuthStore();
  const userId = currentProfile?._id;
  console.log(userId, "userIdddddddddddddddddddddddddddddddddddd");

  const voucherData = {
    provider: {
      name: data.providerId.name,
      logo: data.providerId.name.charAt(0),
      logoColor: "black",
      backgroundImage: data.images[0],
    },
    voucher: {
      title: data.title,
      price: `${data.voucherValue} kr`,
      description: data.about,
      validUntil: new Date(data.validity).toLocaleDateString(),
      category: data.type,
      location: data.sectionId[0]?.name || "Not specified",
    },
  };

  const [isLiked, setIsLiked] = useState(false);
  const updateVoucher = useUpdateVoucher();
  const queryClient = useQueryClient();
  const { data: voucherQuery } = useGetVouchersByIds([data._id]);
  const latestVoucher = voucherQuery?.data?.[0] || data;
  const hasPurchased = latestVoucher?.buyers?.includes(userId);

  const handleBack = () => {
    console.log("Back clicked");
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
  };

  const handleShare = () => {
    console.log("Share clicked");
  };

  const handleBuyVoucher = async () => {
    if (!userId) return;
    updateVoucher.mutate(
      {
        id: data._id,
        buyers: { add: [userId] },
      },
      {
        onSuccess: () => {
          toast.success("Voucher purchased successfully!");
          queryClient.invalidateQueries({ queryKey: ["vouchers", [data._id]] });
        },
        onError: () => {
          toast.error("Failed to purchase voucher.");
        },
      }
    );
  };

  return (
    <div className="p-10 m-5 rounded-lg mx-auto bg-white w-[90%] min-h-screen">
      {/* Header with provider image and icons */}
      <div className="relative">
        {/* Provider's large background image */}
        <div className="h-80 flex items-center justify-center relative overflow-hidden">
          <Image
            src={voucherData.provider.backgroundImage}
            alt="Provider background"
            fill
            className="object-cover"
            priority
          />

          {/* Provider info */}
          <div className="flex absolute bottom-5 right-5 w-[95%] justify-between gap-3 z-10">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ backgroundColor: voucherData.provider.logoColor }}
              >
                <span className="w-12 h-12 rounded-full bg-gray-300 overflow-hidden border-2 border-white relative">
                  <Image
                    src={voucherData.provider.backgroundImage}
                    alt="Logo"
                    fill
                    className="object-cover"
                  />
                </span>
              </div>
              <div>
                <h2 className="font-semibold text-lg text-gray-900">
                  {voucherData.provider.name}
                </h2>
              </div>
            </div>

            {/* Price */}
            <div className="bg-gray-100 rounded-full px-4 py-2 inline-block">
              <span className="font-semibold text-lg">
                {voucherData.voucher.price}
              </span>
            </div>
          </div>

          {/* Top navigation icons */}
          <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
            <button
              onClick={handleBack}
              className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur-sm"
            >
              <ArrowLeft className="w-5 h-5 text-primary" />
            </button>

            <div className="flex gap-3">
              <button
                onClick={handleLike}
                className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur-sm"
              >
                <Heart
                  className={`w-5 h-5 ${
                    isLiked ? "text-red-500 fill-red-500" : "text-primary"
                  }`}
                />
              </button>
              <button
                onClick={handleShare}
                className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur-sm"
              >
                <Share2 className="w-5 h-5 text-primary" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content section */}
      <div className="px-6 py-6 space-y-6">
        {/* Voucher title */}
        <div>
          <h3 className="font-medium text-gray-900 mb-1">
            {voucherData.voucher.title}
          </h3>
        </div>

        {/* About section */}
        <div className="space-y-2">
          <h4 className="font-semibold text-gray-900">About</h4>
          <p className="text-gray-600 leading-relaxed">
            {voucherData.voucher.description}
          </p>
        </div>

        {/* Additional voucher details */}
        <div className="space-y-2">
          <h4 className="font-semibold text-gray-900">Voucher Details</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Voucher Number</p>
              <p className="font-medium">{data.voucherNumber}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Valid Until</p>
              <p className="font-medium">{voucherData.voucher.validUntil}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Type</p>
              <p className="font-medium">{voucherData.voucher.category}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Location</p>
              <p className="font-medium">{voucherData.voucher.location}</p>
            </div>
          </div>
        </div>

        {/* Buy Voucher Button */}
        <div className="pt-4 flex justify-end">
          <div className="w-full">
            {hasPurchased ? (
              <button
                className="w-full py-4 bg-primary hover:bg-primary-hover transition-all duration-300 text-white font-semibold rounded-full shadow-lg cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                disabled
              >
                Already Purchased
              </button>
            ) : (
              <button
                onClick={handleBuyVoucher}
                disabled={updateVoucher.isLoading}
                className="w-full py-4 bg-primary hover:bg-primary-hover transition-all duration-300 text-white font-semibold rounded-full shadow-lg cursor-pointer"
              >
                {updateVoucher.isLoading ? "Processing..." : "Get Voucher"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
