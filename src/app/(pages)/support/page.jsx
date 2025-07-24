"use client";
import React from "react";
import dynamic from "next/dynamic";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import useAuthStore from "@/app/store/useAuthStore";

const Support = dynamic(() => import("@/app/components/Support/Support"), {
  loading: () => (
    <div className="bg-[#fdf4ee] min-h-screen flex flex-col">
      {/* Top bar with back arrow and title */}
      <div className="flex items-center px-8 pt-8 pb-2">
        <Skeleton height={32} width={32} circle style={{ marginRight: 16 }} />
        <div className="flex-1 flex justify-center">
          <Skeleton height={32} width={120} style={{ borderRadius: 8 }} />
        </div>
      </div>
      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center">
        {/* Icon */}
        <Skeleton height={72} width={72} circle style={{ marginBottom: 20 }} />
        {/* Subtitle: Need help? */}
        <Skeleton height={28} width={120} style={{ marginBottom: 8 }} />
        {/* Help text */}
        <Skeleton height={18} width={420} style={{ marginBottom: 32 }} />
        {/* Dropdown */}
        <Skeleton
          height={56}
          width={420}
          borderRadius={12}
          style={{ marginBottom: 16 }}
        />
        {/* Textarea */}
        <Skeleton
          height={100}
          width={420}
          borderRadius={12}
          style={{ marginBottom: 12 }}
        />
        {/* Attachment */}
        <div className="w-[420px] flex items-center mb-10">
          <Skeleton height={20} width={28} style={{ marginRight: 8 }} />
          <Skeleton height={18} width={120} />
        </div>
        {/* Buttons */}
        <div className="w-[420px] flex gap-8 mt-2">
          <Skeleton height={48} width="50%" borderRadius={24} />
          <Skeleton height={48} width="50%" borderRadius={24} />
        </div>
      </div>
    </div>
  ),
  ssr: false,
});

const page = () => {
  const { currentProfile, isLoading, error } = useAuthStore();
  const customerName = currentProfile?.name;
  const customerId = currentProfile?._id;

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return <Support customerName={customerName} customerId={customerId} />;
};

export default page;
