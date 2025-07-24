"use client";
import React from 'react'
// import VoucherView from '@/app/components/ProviderPrSimpleLogoLoaderofile/VoucherView'
import { useParams } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import { useGetVoucherById } from '@/app/hooks/useVoucher';
import { useGetProfileById } from '@/app/hooks/useProfile';
// import SimpleLogoLoader from "@/app/components/Loader/Loader";
import dynamic from "next/dynamic";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";


const VoucherView = dynamic(
  () => import("@/app/components/ProviderProfile/VoucherView"),
  {
    loading: () => (
      <div className="bg-[#fdf4ee] min-h-screen flex items-center justify-center">
        <div className="w-full max-w-5xl mx-auto">
          <div className="bg-white rounded-2xl shadow-md p-8 mt-8">
            {/* Cover image */}
            <div className="relative mb-8">
              <Skeleton height={260} width="100%" borderRadius={18} />
              {/* Avatar and company name at bottom left */}
              <div className="absolute left-8 bottom-8 flex items-center">
                <Skeleton
                  height={56}
                  width={56}
                  circle
                  style={{ marginRight: 16 }}
                />
                <Skeleton height={24} width={160} />
              </div>
              {/* Price at bottom right */}
              <div className="absolute right-8 bottom-8">
                <Skeleton height={40} width={120} borderRadius={20} />
              </div>
              {/* Top right icons */}
              <div className="absolute right-8 top-8 flex gap-4">
                <Skeleton height={36} width={36} circle />
                <Skeleton height={36} width={36} circle />
              </div>
            </div>
            {/* Title, subtitle, rating */}
            <div className="mb-6">
              <Skeleton height={28} width={120} style={{ marginBottom: 8 }} />
              <Skeleton height={18} width={180} style={{ marginBottom: 8 }} />
              <div className="flex items-center gap-2 mb-2">
                <Skeleton height={18} width={90} />
                <Skeleton height={18} width={30} />
              </div>
            </div>
            {/* Add-ons section */}
            <div className="mb-2">
              <Skeleton height={22} width={90} style={{ marginBottom: 12 }} />
              <div className="rounded-xl border px-4 py-3 flex items-center gap-4">
                <Skeleton height={24} width={24} circle />
                <Skeleton height={18} width={80} />
                <div className="flex-1" />
                <Skeleton height={18} width={40} />
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    ssr: false,
  }
);

const page = () => {
  
  // ids
  const params = useParams();
  const id = params.id;
  const searchParams = useSearchParams();
  const paramsId = searchParams.get("provider");
  
  // queries
  const { data: voucher, isLoading, isError } = useGetVoucherById(id);
  const { data: provider, isLoading: providerLoading, isError: providerError } = useGetProfileById(paramsId);
  const voucherData = voucher?.data;
  const providerData = provider?.data;

  console.log(voucherData, "voucherData");
  console.log(providerData, "providerData");

  if (isLoading || providerLoading) {
    return null;
  }

  if (isError || providerError) {
    return <div>Error loading voucher or provider data</div>;
  } 

  return (
    <VoucherView data={voucherData} providerData={providerData}/>
  )
}

export default page