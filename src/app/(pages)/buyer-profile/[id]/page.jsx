"use client";
import React from "react";
import dynamic from "next/dynamic";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { useGetProfileById } from "@/app/hooks/useProfile";
import useAuthStore from "@/app/store/useAuthStore";
import { useParams } from "next/navigation";

const BuyerProfile = dynamic(
  () => import("@/app/components/BuyerProfile/BuyerProfile"),
  {
    loading: () => (
      <div className="bg-[#fdf4ee] min-h-screen">
        {/* Cover section */}
        <div className="relative max-w-6xl mx-auto mt-8">
          <Skeleton height={180} borderRadius={32} />
          {/* Buttons top right */}
          <div className="absolute top-8 right-8 flex gap-4">
            <Skeleton height={44} width={110} borderRadius={16} />
            <Skeleton height={44} width={140} borderRadius={16} />
          </div>
          {/* Avatar and badge */}
          <div className="absolute left-8 -bottom-12 flex items-center">
            <Skeleton
              height={96}
              width={96}
              circle
              style={{ marginRight: 16 }}
            />
            <Skeleton
              height={32}
              width={32}
              circle
              style={{ marginLeft: -40, zIndex: 10, border: "4px solid #fff" }}
            />
          </div>
          {/* Name, location, stats */}
          <div className="absolute left-48 bottom-4 flex flex-col gap-2">
            <Skeleton height={32} width={180} style={{ marginBottom: 4 }} />
            <Skeleton height={20} width={140} style={{ marginBottom: 8 }} />
            <div className="flex gap-8 mt-2">
              <Skeleton height={24} width={60} />
              <Skeleton height={24} width={60} />
              <Skeleton height={24} width={60} />
            </div>
          </div>
        </div>
        {/* Main card */}
        <div className="max-w-5xl mx-auto mt-24">
          {/* Tab bar */}
          <div className="flex gap-4 mb-8">
            <Skeleton height={44} width={120} borderRadius={24} />
            <Skeleton height={44} width={120} borderRadius={24} />
            <Skeleton height={44} width={140} borderRadius={24} />
          </div>
          {/* Reviews card */}
          <div className="bg-white rounded-2xl shadow-md p-8">
            <Skeleton height={28} width={180} style={{ marginBottom: 16 }} />
            <Skeleton height={20} width={120} style={{ marginBottom: 24 }} />
            {/* Ratings bar chart */}
            <div className="mb-8">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 mb-2">
                  <Skeleton height={18} width={60} />
                  <Skeleton height={16} width={320} borderRadius={8} />
                </div>
              ))}
            </div>
            {/* Average rating circle */}
            <div className="flex justify-center mt-8">
              <Skeleton height={120} width={120} circle />
            </div>
          </div>
        </div>
      </div>
    ),
    ssr: false,
  }
);

const Page = () => {
  const { id } = useParams();
  const { currentProfile } = useAuthStore();
  const {
    data: profile,
    isLoading,
    refetch,
    error,
  } = useGetProfileById(id || currentProfile?._id);
  const MyProfile = profile?.data;

  return (
    <div>
      <BuyerProfile Profile={MyProfile} refetchProfile={refetch} />
    </div>
  );
};

export default Page;
