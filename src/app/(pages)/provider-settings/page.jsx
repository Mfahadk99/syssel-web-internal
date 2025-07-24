"use client";
import React from "react";
import dynamic from "next/dynamic";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const ProviderSettings = dynamic(
  () => import("../../components/Settings/ProviderSettings"),
  {
    loading: () => <Skeleton height={70} count={10} />,
    ssr: false,
  }
);

const page = () => {
  return (
    <div className="">
      <ProviderSettings />
    </div>
  );
};

export default page;
