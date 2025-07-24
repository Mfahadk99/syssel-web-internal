"use client";
import React, { useEffect } from "react";
import Header from "../Header/Header";
import { OngoingSaleCard } from "../Reusable/Card";
import { useGetAllSalesByProviderId } from "@/app/hooks/useSales";
import useAuthStore from "@/app/store/useAuthStore";
// import { useLoader } from "@/app/context/LoaderContext";

const OngoingSales = () => {
  const { currentProfile } = useAuthStore();
  const {
    data: sales,
    isLoading,
    error,
  } = useGetAllSalesByProviderId(currentProfile?._id);
  // const { setLoading } = useLoader();
  console.log(sales, "sales");

  // useEffect(() => {
  //   if (isLoading) {
  //     setLoading(true);
  //   } else {
  //     setLoading(false);
  //   }
  // }, [isLoading, setLoading]);

  // useEffect(() => {
  //   if (error) {
  //     setLoading(false);
  //   }
  // }, [error, setLoading]);

  // Transform API data for the card
  const salesData = (sales?.data?.sales || []).map((item) => ({
    image: item?.service?.images?.[0] || "https://via.placeholder.com/150",
    title: item?.service?.name || "No Title",
    company: item?.subcategory?.name || "",
    description: item?.service?.description || "",
    distance: 0, // You can replace this with actual distance if available
    oldPrice: item?.originalPrice,
    newPrice: item?.finalPrice,
    discount: Math.round(item?.discountPercentage),
  }));

  return (
    <div className="w-[95%] mx-auto my-5">
      <Header heading={{ title: "Ongoing Sales" }} showSearchBar={false} />
      <div className="flex flex-col gap-4 mt-6">
        {salesData.length === 0 ? (
          <div className="text-center text-gray-500 mt-10">
            No ongoing sales exist.
          </div>
        ) : (
          salesData.map((sale, idx) => (
            <OngoingSaleCard key={idx} data={sale} />
          ))
        )}
      </div>
    </div>
  );
};

export default OngoingSales;
