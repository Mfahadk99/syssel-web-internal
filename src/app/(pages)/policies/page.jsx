"use client";
import React from "react";
import dynamic from "next/dynamic";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const Policy = dynamic(() => import("@/app/components/Settings/Policy"), {
  loading: () => (
    <div className="bg-[#fef3ec] min-h-screen flex justify-center items-start p-6">
      <div className="bg-white/80 rounded-2xl shadow-lg w-full max-w-4xl mx-auto p-8">
        {/* Title */}
        <Skeleton height={40} width="30%" style={{ marginBottom: 24 }} />
        {/* Paragraphs */}
        <Skeleton height={18} width="100%" style={{ marginBottom: 8 }} />
        <Skeleton height={18} width="95%" style={{ marginBottom: 8 }} />
        <Skeleton height={18} width="98%" style={{ marginBottom: 8 }} />
        <Skeleton height={18} width="92%" style={{ marginBottom: 8 }} />
        <Skeleton height={18} width="90%" style={{ marginBottom: 32 }} />
        {/* Accordion sections */}
        <Skeleton
          height={56}
          width="100%"
          style={{ marginBottom: 16, borderRadius: 12 }}
        />
        <Skeleton
          height={56}
          width="100%"
          style={{ marginBottom: 16, borderRadius: 12 }}
        />
        <Skeleton
          height={56}
          width="100%"
          style={{ marginBottom: 16, borderRadius: 12 }}
        />
        <Skeleton
          height={56}
          width="100%"
          style={{ marginBottom: 16, borderRadius: 12 }}
        />
      </div>
    </div>
  ),
  ssr: false,
});

const page = () => {
  return (
    <div>
      <Policy />
    </div>
  );
};

export default page;
