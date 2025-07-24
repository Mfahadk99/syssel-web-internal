"use client";
import React from "react";
import dynamic from "next/dynamic";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const PurchaseMoreBids = dynamic(
  () => import("@/app/components/PurchaseMoreBids/PurchaseMoreBids"),
  {
    loading: () => (
      <div className="flex justify-center items-center min-h-[70vh] bg-[#fef3ec] p-6">
        <div className="bg-white rounded-2xl shadow-lg flex flex-col md:flex-row w-full max-w-5xl p-6 md:p-12 gap-8">
          {/* Left illustration skeleton */}
          <div className="flex-1 flex justify-center items-center">
            <Skeleton height={350} width={350} borderRadius={24} />
          </div>
          {/* Right content skeleton */}
          <div className="flex-1 flex flex-col items-center justify-center">
            <Skeleton height={36} width={260} style={{ marginBottom: 16 }} />
            <Skeleton height={20} width={220} style={{ marginBottom: 32 }} />
            <div className="grid grid-cols-2 gap-6">
              <Skeleton height={120} width={160} borderRadius={16} />
              <Skeleton height={120} width={160} borderRadius={16} />
              <Skeleton height={120} width={160} borderRadius={16} />
              <Skeleton height={120} width={160} borderRadius={16} />
            </div>
          </div>
        </div>
      </div>
    ),
    ssr: false,
  }
);

const page = () => {
  return (
    <div>
      <PurchaseMoreBids />
    </div>
  );
};

export default page;
