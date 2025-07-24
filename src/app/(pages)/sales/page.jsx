"use client"
import React from 'react'
import dynamic from "next/dynamic";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";


const OngoingSales = dynamic(
  () => import("@/app/components/OngoingSales/OngoingSales"),
  {
    loading: () => <Skeleton height={100} count={4} borderRadius={24} style={{ marginTop: 28 }}/>,
    ssr: false,
  }
);


const page = () => {
  return (
    <div>
        <OngoingSales />
    </div>
  )
}

export default page