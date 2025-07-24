"use client";
import React from "react";
// import Vouchers from "@/app/components/Screens/Vouchers";
import { useGetVouchers } from "@/app/hooks/useVoucher";
import useAuthStore from "@/app/store/useAuthStore";
import { useGetAllProfilesByIds, useGetProfileById } from "@/app/hooks/useProfile";
// import { useLoader } from "@/app/context/LoaderContext";
import dynamic from "next/dynamic";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";


const Vouchers = dynamic(
  () => import("@/app/components/Screens/Vouchers"),
  {
    loading: () => <Skeleton height={100} count={4} borderRadius={24} style={{ marginTop: 28 }}/>,
    ssr: false,
  }
);

const page = () => {
  const { currentProfile, isLoading: profileLoading, error } = useAuthStore();
  // const { setLoading } = useLoader();
  const {
    data: vouchers,
    isLoading: vouchersLoading,
    isError,
  } = useGetVouchers("buyer", currentProfile?._id, !!currentProfile?._id);
  const { data: profileData, isLoading, isError: profileError } = useGetProfileById(currentProfile?._id)
  const friendIds = profileData?.data.friends?.map(friend => friend.id) || [];
  const {data: friends, isLoading: friendsLoading, isError: friendsError} = useGetAllProfilesByIds(friendIds)
  const friendsProfiles = friends?.data?.profiles
  console.log(friendsProfiles, "eeeeeeeeeeeeeeeeee")
  const vouchersData = vouchers?.data?.vouchers;
  // console.log(friendIds, "yyyyyyyyyyyyyyyyyyyyyyyy")
  const data = vouchersData?.map(voucher => ({
    _id: voucher?._id,
    name: voucher?.providerId?.name,
    image: voucher?.images[0],
    rating: 4.3,
    description: voucher?.about,
    price: `${voucher?.voucherValue}% off`,
    distance: 500,
    url: `/place/${voucher?.providerId?.name?.toLowerCase().replace(/\s+/g, '-')}`,
    expiryDate: `Expiry ${new Date(voucher?.validity).toLocaleDateString('en-GB')}`,
  })) || [];

  // if (isLoading || profileLoading || vouchersLoading) {
  //   setLoading(true);
  // } else {
  //   setLoading(false);
  // }
  if (error || isError || profileError) return <p>Something went wrong</p>;

  return (
    <div>
      <Vouchers data={data} currentId={currentProfile?._id} friends={friendsProfiles}/>
    </div>
  );
};
export default page;
