"use client";
import React from "react";
import dynamic from "next/dynamic";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import useAuthStore from "@/app/store/useAuthStore";
import { useGetAllBookingsByFilter } from "@/app/hooks/useBooking";
import { useGetServiceByProviderId } from "@/app/hooks/useServices";
import { useGetSettingsById } from "@/app/hooks/useSettings";
import { useSidebarStatus } from "@/app/context/SidebarStatus";

const BookingsCalendar = dynamic(
  () => import("@/app/components/Calender/Full Calendar/BookingsCalender"),
  {
    loading: () => (
      <div className="bg-[#f7f7f7] min-h-screen p-8">
        <div className="max-w-6xl mx-auto">
          {/* Title and subtitle */}
          <Skeleton height={36} width={340} style={{ marginBottom: 16 }} />
          <Skeleton height={20} width={420} style={{ marginBottom: 28 }} />
          {/* Large search/filter bar */}
          <div className="flex items-center justify-between mb-8">
            <Skeleton height={56} width={800} borderRadius={28} />
            <Skeleton height={48} width={180} borderRadius={24} />
          </div>
          {/* Calendar header */}
          <div className="flex gap-4 mb-2">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} height={32} width={110} borderRadius={8} />
            ))}
          </div>
          {/* Calendar grid with right sidebar */}
          <div
            className="flex rounded-lg bg-white overflow-x-auto"
            style={{ minHeight: 9 * 48 + 16 }}
          >
            {/* Calendar grid */}
            <div className="flex flex-col">
              {[...Array(9)].map((_, rowIdx) => (
                <div key={rowIdx} className="flex mb-2 last:mb-0">
                  {[...Array(8)].map((_, colIdx) => (
                    <Skeleton
                      key={colIdx}
                      height={44}
                      width={110}
                      borderRadius={8}
                      style={{ marginRight: colIdx < 7 ? 16 : 0 }}
                    />
                  ))}
                </div>
              ))}
            </div>
            {/* Right sidebar (details panel) */}
            <div className="ml-8 flex flex-col justify-start">
              <div
                className="bg-white rounded-lg"
                style={{ width: 320, height: 9 * 48 + 16 }}
              />
            </div>
          </div>
        </div>
      </div>
    ),
    ssr: false,
  }
);

const page = () => {
  const {
    currentProfile,
    isLoading: isAuthLoading,
    error: authError,
  } = useAuthStore();
  const providerId = currentProfile?._id;
  const settingId = currentProfile?.settingId;
  const {
    data: bookings,
    isLoading: bookingsLoading,
    isError: bookingsError,
  } = useGetAllBookingsByFilter("provider", providerId, {
    enabled: !!providerId,
  });
  const {
    data: settingsData,
    isLoading: settingsLoading,
    isError: settingsError,
  } = useGetSettingsById(providerId, { enabled: !!settingId });
  const settings = settingsData?.data;
  const {
    data: servicesData,
    isLoading,
    error,
  } = useGetServiceByProviderId(providerId, { enabled: !!providerId });
  const bookingsData = bookings?.data?.bookings;
  const providerTotalServices =
    servicesData?.data?.map((service) => ({
      id: service._id,
      name: service.name.trim(),
    })) || [];
  const { isOpen, isMobileOpen } = useSidebarStatus();

  if (authError || bookingsError || error) {
    return <div>Error...</div>;
  }

  return (
    <div>
      <BookingsCalendar
        bookingsData={bookingsData}
        providerTotalServices={providerTotalServices}
        providerId={providerId}
        settingId={settingId}
        isAuthLoading={isAuthLoading}
        bookingsLoading={bookingsLoading}
        isLoading={isLoading}
        settings={settings}
        isOpen={isOpen}
        isMobileOpen={isMobileOpen}
      />
    </div>
  );
};

export default page;
