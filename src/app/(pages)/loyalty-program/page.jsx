"use client";
import React from "react";
import dynamic from "next/dynamic";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const LoyaltySettings = dynamic(
  () => import("@/app/components/Settings/LoyaltySettings"),
  {
    loading: () => <Skeleton height={100} count={4} />,
    ssr: false,
  }
);

const page = () => {
  return <LoyaltySettings />;
};

export default page;
