"use client";
import React from "react";
import dynamic from "next/dynamic";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const CancellationPolicy = dynamic(
  () => import("@/app/components/Settings/CancellationPolicy"),
  {
    loading: () => <Skeleton height={100} count={4} />,
    ssr: false,
  }
);

const page = () => {
  return <CancellationPolicy />;
};

export default page;
