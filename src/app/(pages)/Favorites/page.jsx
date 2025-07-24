"use client";
import {React} from "react";
// import Favorites from "@/app/components/Screens/Favorites";
import dynamic from "next/dynamic";
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

const Favorites = dynamic(() => import("@/app/components/Screens/Favorites"), {
  loading: () => <Skeleton count={6} height={100} />,
  ssr: false,
});


import useAuthStore from "@/app/store/useAuthStore";
import useFavourite from "@/app/store/useFavourite";
import { useGetMissionsByIds } from "@/app/hooks/useMission";
import { useGetServicesByIds } from "@/app/hooks/useServices";
import { Timer } from "@/app/utils/timer";
// import SimpleLogoLoader from "@/app/components/Loader/Loader";

const Page = () => {
  const { currentProfile } = useAuthStore();
  const { favorites } = useFavourite();
  const profileType = currentProfile?.profileType;

  // Only fetch data based on profile type
  const { data: missions, isLoading: missionsLoading, } = useGetMissionsByIds(
    profileType === "provider" ? favorites : []
  );
  const { data: services, isLoading: servicesLoading, } = useGetServicesByIds(
    profileType === "buyer" ? favorites : []
  );


  // Format missions data with proper image fallbacks
  const formattedMissions =
    missions?.missions?.map((mission) => ({
      _id: mission._id,
      name: mission.title,
      image: mission.image || "/api/placeholder/600/400",
      description: mission.about,
      provider: mission.buyer?.name || "Unknown",
      currency: "kr",
      distance: 200,
      isFavorite: true,
    })) || [];

  // Format services data with proper image fallbacks
  const formattedServices =
    services?.data?.services?.map((service) => {
      const sale = service.sales?.[0];
      const discountPercent = sale?.discountPercentage || "0";
      const originalPrice = sale?.originalPrice || service.defaultPrice || 0;
      const finalPrice = sale?.finalPrice || service.defaultPrice || 0;

      return {
        _id: service._id,
        idOfProvider: service.provider?._id,
        name: service.name,
        image: service.image || "/api/placeholder/600/400",
        description: service.description,
        provider: service.provider?.name || "Unknown",
        discountPercent: discountPercent.toString(),
        CancelPrice: originalPrice,
        ActualPrice: finalPrice,
        currency: "kr",
        timeRemaining: sale ? <Timer endDate={sale?.endDate} /> : "",
        distance: 200,
        isFavorite: true,
        PerHourPrice: service.defaultPrice,
      };
    }) || [];

  // Choose which data to display based on profile type
  let formattedData = profileType === "buyer" ? formattedServices : formattedMissions;

  // if (servicesLoading || missionsLoading) {
  //   return <SimpleLogoLoader />;
  // }

  return (
    <div>
      <Favorites 
        data={formattedData.map(item => ({
          ...item,
          image: item.image || "/api/placeholder/600/400"
        }))} 
        profileType={profileType} 
      />
    </div>
  );
};

export default Page;