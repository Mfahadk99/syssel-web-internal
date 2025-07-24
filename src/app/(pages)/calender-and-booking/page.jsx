"use client";
import React from "react";
import dynamic from "next/dynamic";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import useAuthStore from "@/app/store/useAuthStore";
import { useGetSettingsById } from "@/app/hooks/useSettings";
// import SimpleLogoLoader from "@/app/components/Loader/Loader";

const CalenderAndBooking = dynamic(
  () => import("@/app/components/Calender/Booking Calendar/CalenderAndBooking"),
  {
    loading: () => <Skeleton height={100} count={6} />,
    ssr: false,
  }
);

const page = () => {
  const { currentProfile } = useAuthStore();
  const Id = currentProfile?._id;
  const settingId = currentProfile?.settingId;
  const {
    data: settings,
    isLoading: settingsLoading,
    error: settingsError,
  } = useGetSettingsById(Id, { enabled: !!Id });
  const calendarSettings = settings?.data?.calendarAndBooking || {};

  // if (settingsLoading || !settings) {
  //   return <SimpleLogoLoader />;
  // }

  return (
    <CalenderAndBooking
      settingId={settingId}
      calendarSettings={calendarSettings}
    />
  );
};

export default page;
