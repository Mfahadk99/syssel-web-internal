"use client";
import React from "react";
import dynamic from "next/dynamic";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const ProfileType = dynamic(
  () => import("@/app/components/ProfileType/ProfileType"),
  {
    loading: () => <Skeleton height={300} count={1} />,
    ssr: false,
  }
);

const page = () => {
  return (
    <div className="flex items-center justify-center h-screen">
      <ProfileType /> {/* This is the ProfileType component */}
    </div>
  );
};

export default page;
