"use client";
import React, { useCallback } from "react";
import dynamic from "next/dynamic";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import {
  useGetProfileById,
  useGetAllProfilesByIds,
} from "@/app/hooks/useProfile";
import useAuthStore from "@/app/store/useAuthStore";
import { useGetServicesByProviderIds } from "@/app/hooks/useServices";
import useSearch from "@/app/store/useSearch";
import { Timer } from "@/app/utils/timer";
// import SimpleLogoLoader from "@/app/components/Loader/Loader";

const Header = dynamic(() => import("@/app/components/Header/Header"), {
  loading: () => <Skeleton height={60} count={1} />,
  ssr: false,
});

const Discover = dynamic(() => import("@/app/components/Discover/Discover"), {
  loading: () => <Skeleton height={300} count={1} />,
  ssr: false,
});

const Page = () => {
  const { currentProfile } = useAuthStore();
  const { searchQuery, setSearchQuery } = useSearch();
  const {
    data: profile,
    isLoading: isLoadingProfile,
    isError: isErrorProfile,
  } = useGetProfileById(currentProfile?._id);
  const BuyerProfile = profile?.data;
  const Buyerfollowing = BuyerProfile?.following;
  console.log(Buyerfollowing, "Buyerfollowing");
  const {
    data: providerServices,
    isLoading: isLoadingServices,
    isError: isErrorServices,
  } = useGetServicesByProviderIds(Buyerfollowing);

  const {
    data: providerProfiles,
    isLoading: isLoadingProfiles,
    isError: isErrorProfiles,
  } = useGetAllProfilesByIds(Buyerfollowing);

  let services = providerServices?.data?.services;
  let profiles = providerProfiles?.data?.profiles;

  console.log(services, "services");
  console.log(profiles, "profiles");

  // Filter by searchQuery if not empty
  if (searchQuery && searchQuery.trim() !== "") {
    const lowerSearch = searchQuery.toLowerCase();
    services =
      services?.filter((service) =>
        service?.name?.toLowerCase().includes(lowerSearch)
      ) || [];
    profiles =
      profiles?.filter((profile) =>
        profile?.name?.toLowerCase().includes(lowerSearch)
      ) || [];
  }

  const lastMinDealServices =
    services?.filter(
      (service) =>
        service?.sales?.length > 0 &&
        service?.sales?.some((sale) => sale?.lastMinDeal === true)
    ) || [];

  const followerExclusiveServices =
    services?.filter(
      (service) =>
        service?.sales?.length > 0 &&
        service?.sales?.some((sale) => sale?.followerExclusive === true)
    ) || [];

  const storesYouFollow =
    profiles?.map((profile) => ({
      name: profile.name,
      avatar:
        profile.image ||
        "https://uploads.padelmates.co/images/rn_image_picker_lib_temp_21729594-771d-4fcb-b11b-7074e539a2ab.jpg",
      rating: profile.rating?.average || 0,
      distance: 0,
      isVerified: profile.user?.isVerified || false,
    })) || [];

  const latestSales =
    services
      ?.filter(
        (service) =>
          Array.isArray(service?.sales) &&
          service.sales.length > 0 &&
          new Date(service?.sales?.[0]?.endDate) > new Date()
      )
      .map((service) => {
        const latestSale = service?.sales?.[0];
        return {
          _id: service?._id,
          name: service?.name,
          avatar:
            service?.images?.[0] ||
            "https://uploads.padelmates.co/images/rn_image_picker_lib_temp_21729594-771d-4fcb-b11b-7074e539a2ab.jpg",
          discountPercent: latestSale?.discountPercentage || 0,
          timeRemaining: latestSale?.endDate ? (
            <Timer endDate={latestSale?.endDate} />
          ) : (
            ""
          ),
          location: service?.provider?.city || "",
          distance: 0,
        };
      }) || [];

  const lastMinDeals =
    lastMinDealServices
      ?.filter(
        (service) =>
          Array.isArray(service?.sales) &&
          service.sales.length > 0 &&
          new Date(service?.sales?.[0]?.endDate) > new Date()
      )
      .map((service) => ({
        _id: service?._id,
        name: service?.name,
        avatar: service?.images?.[0] || "",
        discountPercent: service?.sales?.[0]?.discountPercentage || 0,
        timeRemaining: service?.sales?.[0]?.endDate ? (
          <Timer endDate={service?.sales?.[0]?.endDate} />
        ) : (
          ""
        ),
        location: service?.provider?.city || "",
        distance: 0,
      })) || [];

  const followerExclusiveDeals =
    followerExclusiveServices
      ?.filter(
        (service) =>
          Array.isArray(service?.sales) &&
          service.sales.length > 0 &&
          new Date(service?.sales?.[0]?.endDate) > new Date()
      )
      .map((service) => ({
        _id: service?._id,
        name: service?.name,
        avatar: service?.images?.[0] || "",
        discountPercent: service?.sales?.[0]?.discountPercentage || 0,
        timeRemaining: service?.sales?.[0]?.endDate ? (
          <Timer endDate={service?.sales?.[0]?.endDate} />
        ) : (
          ""
        ),
        location: service?.provider?.city || "",
        distance: 0,
      })) || [];

  const sections = [
    {
      title: "Stores You Follow",
      data: storesYouFollow,
      msg: "No stores you follow",
    },
    { title: "Latest Sales", data: latestSales, msg: "No latest sales found" },
    {
      title: "Last Minute Deals",
      data: lastMinDeals,
      msg: "No last minute deals found",
    },
    {
      title: "Followers Exclusive Deals",
      data: followerExclusiveDeals,
      msg: "No followers exclusive deals found",
    },
  ];

  const breakpoints = {
    320: { slidesPerView: 1.2, spaceBetween: 12 },
    480: { slidesPerView: 2.2, spaceBetween: 15 },
    640: { slidesPerView: 3.2, spaceBetween: 15 },
    768: { slidesPerView: 3.5, spaceBetween: 15 },
    1024: { slidesPerView: 4.3, spaceBetween: 20 },
  };

  const heading = { title: "Following" };

  // Use useCallback to prevent re-renders
  const handleSearch = useCallback(
    (query) => {
      setSearchQuery(query);
    },
    [setSearchQuery]
  );

  // if (isLoadingProfile) {
  //   return <SimpleLogoLoader />;
  // }

  if (isErrorProfile || isErrorServices || isErrorProfiles) {
    return <div>Error...</div>;
  }

  return (
    <div className="w-[95%] mx-auto mt-3">
      <Header heading={heading} showSearchBar={true} onSearch={handleSearch} />
      {/* This is Following page designed for the user to see the stores they follow */}
      <Discover
        sections={sections}
        breakpoints={breakpoints}
        heading={heading}
        showSearchBar={false}
      />
    </div>
  );
};

export default Page;
