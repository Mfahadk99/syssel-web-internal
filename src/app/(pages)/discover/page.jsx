"use client";
import React, { useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const Discover = dynamic(() => import("../../components/Discover/Discover"), {
  loading: () => (
    <div className="w-full">
      <div className="flex gap-4 mb-6">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} height={40} width={100} />
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4, 5, 6, 8].map((i) => (
          <div key={i} className="flex flex-col gap-2">
            <Skeleton height={200} />
            <Skeleton width={150} />
            <Skeleton width={100} />
          </div>
        ))}
      </div>
    </div>
  ),
});

import { useInfiniteServicesBySearchFilter } from "@/app/hooks/useServices";
import {
  useGetProfilesBySearchFilter,
  useGetProfileById,
} from "@/app/hooks/useProfile";
import useAuthStore from "@/app/store/useAuthStore";
import { useRouter } from "next/navigation";
import Header from "@/app/components/Header/Header";
import useSearch from "@/app/store/useSearch";
import SimpleLogoLoader from "@/app/components/Loader/Loader";
import { Timer } from "@/app/utils/timer";

const MainPage = () => {
  const { currentProfile } = useAuthStore();
  const router = useRouter();
  const { searchQuery, setSearchQuery } = useSearch();

  useEffect(() => {
    if (currentProfile?.profileType === "provider") {
      router.push("/missions");
    }
  }, [currentProfile, router]);

  const {
    data: profile,
    isLoading: profileLoading,
    error: profileError,
  } = useGetProfileById(currentProfile?._id);
  const followings = profile?.data?.following || [];

  // Services infinite query
  const {
    data: services,
    fetchNextPage: fetchMoreServices,
    hasNextPage: hasNextPageServices,
    isFetchingNextPage: isFetchingNextPageServices,
    isLoading: servicesLoading,
    error: servicesError,
  } = useInfiniteServicesBySearchFilter("search", searchQuery);

  // Providers infinite query - NOW WITH INFINITE SCROLL SUPPORT
  const {
    data: provider,
    fetchNextPage: fetchMoreProviders,
    hasNextPage: hasNextPageProviders,
    isFetchingNextPage: isFetchingNextPageProviders,
    isLoading: providerLoading,
    error: providerError,
  } = useGetProfilesBySearchFilter("search", searchQuery);

  // Extract data from infinite query pages
  const providerData = (
    provider?.pages?.flatMap((page) => page.profiles) || []
  ).filter((profile) => profile.profileType === "provider");
  const servicesData = services?.pages?.flatMap((page) => page.services) || [];
  const closestProviders = providerData.filter(
    (provider) => provider?.isClosest === true
  );
  // console.log(servicesData, "servicesDataaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa")
  const featuredProviders = providerData.filter(
    (provider) => provider?.isRecommended === true
  );
  const closestServices = servicesData.filter(
    (service) => service?.provider?.isClosest === true
  );
  const featuredServices = servicesData.filter(
    (service) => service?.provider?.isRecommended === true
  );
  const dealServices = servicesData.filter(
    (service) =>
      service.sales.length > 0 &&
      service.sales.some((sale) => {
        if (!sale.lastMinDeal) return false;
        if (!sale.createdAt) return false;
        const createdAt = new Date(sale.createdAt).getTime();
        const now = Date.now();
        const twelveHours = 12 * 60 * 60 * 1000;
        return now - createdAt <= twelveHours;
      })
  );
  console.log(dealServices, "dealServicesssssssssssssssssssssssssssssssssssssssssss")
  const closestDealServices = servicesData.filter(
    (service) =>
      service.sales.length > 0 && service.provider?.isClosest === true
  );
  const featuredDealServices = servicesData.filter(
    (service) =>
      service.sales.length > 0 && service.provider?.isRecommended === true
  );

  // Transform API services data to match expected format
  const transformApiData = (apiServices) => {
    return apiServices.map((service) => ({
      provider: service?.provider?._id,
      _id: service?._id,
      serviceId: service?._id,
      name: service?.name,
      currency: service?.currency || "kr",
      price: service?.defaultPrice || 0,
      avatar:
        service?.images?.[0] ||
        "https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      coverpic:
        service?.images?.[0] ||
        "https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      rating: service?.rating?.average || Math.floor(Math.random() * 5) + 1,
      distance: Math.floor(Math.random() * 500) + 100,
      isVerified: service?.provider?.isRecommended || false,
    }));
  };

  const transformedServices =
    servicesData.length > 0 ? transformApiData(servicesData) : "";
  const transformedClosestServices =
    closestServices.length > 0 ? transformApiData(closestServices) : "";
  const transformedFeaturedServices =
    featuredServices.length > 0 ? transformApiData(featuredServices) : "";

  // Transform API provider data to match expected format
  const transformProviderData = (apiProviders) => {
    return apiProviders.map((provider) => ({
      _id: provider._id,
      providerId: provider._id,
      name: provider.name,
      avatar:
        provider.image ||
        "https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      coverpic:
        provider.image ||
        "https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      rating: provider.rating?.average || 0,
      distance: Math.floor(Math.random() * 500) + 100,
      isVerified: provider.isRecommended || false,
    }));
  };

  const transformedProviders =
    providerData.length > 0 ? transformProviderData(providerData) : "";
  const transformedClosestProviders =
    closestProviders.length > 0 ? transformProviderData(closestProviders) : "";
  const transformedFeaturedProviders =
    featuredProviders.length > 0
      ? transformProviderData(featuredProviders)
      : "";

  const transformSalesData = (apiSales) => {
    return apiSales.map((sale) => {
      const endDate = sale.sales?.[0]?.endDate || null;
      let timeRemaining = 0;
      if (endDate) {
        const endDateTime = new Date(endDate).getTime();
        const currentTime = new Date().getTime();
        // timeRemaining = endDateTime > currentTime ? endDateTime - currentTime : 0;
        timeRemaining = <Timer endDate={endDate} />;
      }

      return {
        // idOfProvider: sale.provider._id,
        _id: sale._id,
        providerId: sale?.provider?._id,
        name: sale?.name || "No name available",
        description: sale?.description || "No description available",
        provider: sale?.provider?.name || "Faiz",
        avatar:
          sale?.images?.[0] ||
          "https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
        originalPrice: sale?.defaultPrice || 0,
        finalPrice: sale?.sales?.[0]?.finalPrice || sale?.defaultPrice,
        currency: "kr",
        discountPercent: sale?.sales?.[0]?.discountPercentage || null,
        timeRemaining: timeRemaining || 0,
        location: sale?.provider?.location || "Oslo, Norway",
        distance: Math.floor(Math.random() * 500) + 100,
        isFavorite: false,
      };
    });
  };

  const transformedSales = transformSalesData(dealServices);
  const transformedClosestSales = transformSalesData(closestDealServices);
  const transformedFeaturedSales = transformSalesData(featuredDealServices);

  const sections = {
    stores: [
      {
        title: "Recommended Stores",
        data: transformedProviders,
        msg: "No stores available",
      },
      {
        title: "Stores Near You",
        data: transformedClosestProviders,
        msg: "No nearby stores available",
      },
      {
        title: "Featured Providers",
        data: transformedFeaturedProviders,
        msg: "No featured stores available",
      },
    ],
    services: [
      {
        title: "Recommended Services",
        data: transformedServices,
        msg: "No services available",
      },
      {
        title: "Services Near You",
        data: transformedClosestServices,
        msg: "No nearby services available",
      },
      {
        title: "Featured Services",
        data: transformedFeaturedServices,
        msg: "No featured services available",
      },
    ],
    sales: [
      {
        title: "Last Minute Deals",
        data: transformedSales,
        msg: "No sales available",
      },
      {
        title: "Sales Near You",
        data: transformedClosestSales,
        msg: "No nearby sales available",
      },
      {
        title: "Recommended Sales",
        data: transformedFeaturedSales,
        msg: "No featured sales available",
      },
    ],
  };

  const breakpoints = {
    320: { slidesPerView: 1.2, spaceBetween: 12 },
    480: { slidesPerView: 2.2, spaceBetween: 15 },
    640: { slidesPerView: 3.2, spaceBetween: 15 },
    768: { slidesPerView: 3.5, spaceBetween: 15 },
    1024: { slidesPerView: 4.3, spaceBetween: 20 },
  };

  const heading = { title: "Discover", subtitle: "Oslo" };

  // Use useCallback to prevent re-renders
  const handleSearch = useCallback(
    (query) => {
      setSearchQuery(query);
    },
    [setSearchQuery]
  );

  // if (servicesLoading || providerLoading || profileLoading || !services || !provider || !profile) {
  //   return <SimpleLogoLoader />;
  // }

  if (servicesError || providerError || profileError) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-gray-500">Error: something went wrong...</p>
      </div>
    );
  }

  return (
    <div className="w-[95%] mx-auto mt-3">
      <Header heading={heading} showSearchBar={true} onSearch={handleSearch} />
      <Discover
        sections={sections}
        breakpoints={breakpoints}
        showAds={true}
        followings={followings}
        // Services infinite scroll props
        fetchMoreServices={fetchMoreServices}
        hasNextPageServices={hasNextPageServices}
        isFetchingNextPageServices={isFetchingNextPageServices}
        // Providers infinite scroll props
        fetchMoreProviders={fetchMoreProviders}
        hasNextPageProviders={hasNextPageProviders}
        isFetchingNextPageProviders={isFetchingNextPageProviders}
      />
    </div>
  );
};

export default MainPage;
