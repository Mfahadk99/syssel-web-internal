"use client";
import React, { useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
// import { useQueryClient } from "@tanstack/react-query";
import { useGetAllMissionsByCategory } from "@/app/hooks/useMission";
import useAuthStore from "@/app/store/useAuthStore";
import { useRouter } from "next/navigation";
// import { useLoader } from "@/app/context/LoaderContext";
import useSearch from "@/app/store/useSearch";

const Header = dynamic(() => import("@/app/components/Header/Header"), {
  loading: () => <Skeleton height={60} count={1} />,
  ssr: false,
});

const Discover = dynamic(() => import("@/app/components/Discover/Discover"), {
  loading: () => <Skeleton height={300} count={1} />,
  ssr: false,
});

const page = () => {
  const router = useRouter();
  const { searchQuery, setSearchQuery } = useSearch();
  // const { loading, setLoading } = useLoader();
  const { currentProfile } = useAuthStore();
  // const queryClient = useQueryClient();

  if (currentProfile?.profileType === "buyer") {
    router.push("/");
  }

  const {
    data: missionsData,
    isLoading,
    error,
    // refetch,
  } = useGetAllMissionsByCategory(currentProfile?.category?._id);

  // Function to manually refetch missions data
  // const refreshMissionsData = () => {
  //   queryClient.invalidateQueries({ queryKey: ["missions"] });
  //   refetch();
  // };

  // Filter missions based on search query
  const filteredMissions =
    missionsData?.missions?.filter((mission) =>
      mission.title.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

  // Format missions data to match the expected structure
  const formatMissions = (missions) => {
    if (!missions || !missions.length) return [];

    return missions.map((mission) => ({
      _id: mission._id,
      missionId: mission._id,
      missionName: mission.title,
      missionAdvertiser: mission.buyer?.name || "Unknown",
      avatar: mission.images?.[0],
      bids: mission.bidCount || 0,
      distance: Math.floor(Math.random() * 90) + 10,
      verified: false,
      category: mission.category?.name,
      isRecommended: mission.isRecommended,
      isClosest: mission?.isClosest,
    }));
  };

  // Format mission data - now using filtered missions
  const allMissions = formatMissions(filteredMissions);

  // Filter recommended missions
  const recommendedMissions = allMissions.filter(
    (mission) => mission?.isRecommended
  );

  // Filter closest missions
  const closestMissions = allMissions.filter((mission) => mission?.isClosest);

  const sections = [
    {
      title: "Recommended Missions",
      data: recommendedMissions.length > 0 ? recommendedMissions : "",
      msg: "No recommended missions found",
    },
    {
      title: "Missions Near You",
      data: closestMissions.length > 0 ? closestMissions : "",
      msg: "No missions near you found",
    },
    {
      title: `${missionsData?.missions?.[0]?.category?.name || "All"} Missions`,
      data: allMissions,
      msg: "No missions found",
    },
  ];

  const breakpoints = {
    320: { slidesPerView: 1.2, spaceBetween: 12 },
    480: { slidesPerView: 2.2, spaceBetween: 15 },
    640: { slidesPerView: 3.2, spaceBetween: 15 },
    768: { slidesPerView: 3.5, spaceBetween: 15 },
    1024: { slidesPerView: 4.3, spaceBetween: 20 },
  };

  const heading = { title: "Missions", subtitle: "Oslo" };

  // Use useCallback to prevent re-renders
  const handleSearch = useCallback(
    (query) => {
      setSearchQuery(query);
    },
    [setSearchQuery]
  );

  // Loader
  // useEffect(() => {
  //   setLoading(isLoading);
  // }, [isLoading, setLoading]);

  if (error) {
    return <div>error: something went wrong...</div>;
  }

  return (
    <div className="w-[95%] mx-auto mt-3">
      <Header heading={heading} showSearchBar={true} onSearch={handleSearch} />
      <Discover
        data={allMissions}
        sections={sections}
        breakpoints={breakpoints}
        heading={heading}
        showSearchBar={true}
        showAds={false}
      />
    </div>
  );
};

export default page;
