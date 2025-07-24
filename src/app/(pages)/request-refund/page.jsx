"use client";
import React from "react";
import dynamic from "next/dynamic";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const RequestRefund = dynamic(
  () => import("@/app/components/Receipts/RequestRefund"),
  {
    loading: () => (
      <div className="bg-[#fdf4ee] min-h-screen flex items-center justify-center">
        <div className="w-full max-w-4xl mx-auto">
          {/* Card */}
          <div className="bg-white rounded-2xl shadow-md p-8 mt-8">
            {/* Title */}
            <div className="flex flex-col items-center mb-8">
              <Skeleton height={36} width={220} style={{ marginBottom: 24 }} />
            </div>
            {/* Order Info */}
            <div className="flex items-center bg-[#fcfcfc] rounded-xl p-4 mb-8">
              <Skeleton
                height={48}
                width={48}
                circle
                style={{ marginRight: 16 }}
              />
              <div className="flex-1">
                <Skeleton height={20} width={120} style={{ marginBottom: 8 }} />
                <Skeleton height={14} width={60} />
              </div>
              <Skeleton height={24} width={60} />
            </div>
            {/* Reason for refund */}
            <div className="mb-8">
              <Skeleton height={24} width={160} style={{ marginBottom: 16 }} />
              <Skeleton height={56} width="100%" borderRadius={28} />
            </div>
            {/* Summary section */}
            <div className="mb-8">
              <Skeleton height={28} width={120} style={{ marginBottom: 16 }} />
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex justify-between mb-3">
                  <Skeleton height={20} width={140} />
                  <Skeleton height={20} width={60} />
                </div>
              ))}
              {/* Total refund row */}
              <div className="flex justify-between mt-6 mb-2">
                <Skeleton height={28} width={160} />
                <Skeleton height={28} width={80} />
              </div>
            </div>
            {/* Button */}
            <Skeleton height={48} width="100%" borderRadius={24} />
          </div>
        </div>
      </div>
    ),
    ssr: false,
  }
);

const page = () => {
  return (
    <div className="w-[95%] mx-auto mt-3">
      <RequestRefund />
    </div>
  );
};

export default page;
