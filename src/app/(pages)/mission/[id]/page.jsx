"use client";
import React from "react";
import dynamic from "next/dynamic";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const Mission = dynamic(() => import("@/app/components/mission/mission"), {
  loading: () => <Skeleton height={300} count={1} />,
  ssr: false,
});

const page = () => {
  return (
    <div>
      <Mission />
    </div>
  );
};

export default page;
