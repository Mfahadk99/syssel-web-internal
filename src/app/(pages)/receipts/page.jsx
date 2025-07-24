"use client"
import React from 'react'
// import Receipts from '@/app/components/Receipts/Receipts'
import dynamic from "next/dynamic";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";


const Receipts = dynamic(
  () => import("@/app/components/Receipts/Receipts"),
  {
    loading: () => <Skeleton height={100} count={4} borderRadius={24} style={{ marginTop: 28 }}/>,
    ssr: false,
  }
);

const page = () => {
  return (
    <div className='w-[95%] mx-auto mt-3'>
      <Receipts />
    </div>
  )
}

export default page