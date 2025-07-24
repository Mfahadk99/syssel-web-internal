"use client";
import React from "react";
import dynamic from "next/dynamic";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const CompanyInfo = dynamic(
  () => import("@/app/components/Settings/CompanyInfo"),
  {
    loading: () => (
      <div className="bg-[#fef3ec] min-h-screen flex flex-col items-center p-6">
        {/* Page Title */}
        <Skeleton height={36} width={320} style={{ margin: "32px auto" }} />
        {/* Cover image */}
        <div className="relative w-full max-w-4xl mx-auto">
          <Skeleton height={180} width="100%" borderRadius={24} />
          {/* Avatar */}
          <div
            style={{
              position: "absolute",
              left: "50%",
              bottom: -60,
              transform: "translateX(-50%)",
            }}
          >
            <Skeleton circle height={120} width={120} />
          </div>
        </div>
        {/* Company name and subtitle */}
        <div style={{ marginTop: 80, marginBottom: 24, textAlign: "center" }}>
          <Skeleton height={32} width={220} style={{ margin: "0 auto 8px" }} />
          <Skeleton height={20} width={180} style={{ margin: "0 auto" }} />
        </div>
        {/* Form fields */}
        <div className="bg-white rounded-2xl shadow-lg w-full max-w-2xl p-8 space-y-6">
          <Skeleton height={24} width={140} />
          <Skeleton height={44} width="100%" borderRadius={8} />
          <Skeleton height={24} width={180} />
          <Skeleton height={44} width="100%" borderRadius={8} />
          <Skeleton height={24} width={160} />
          <Skeleton height={44} width="100%" borderRadius={8} />
        </div>
      </div>
    ),
    ssr: false,
  }
);

const page = () => {
  return <CompanyInfo />;
};

export default page;
