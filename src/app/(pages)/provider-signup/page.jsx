"use client";
import React, { useEffect } from "react";
import dynamic from "next/dynamic";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import useLocation from "@/app/store/useLocation";

const Providersignup = dynamic(
  () => import("@/app/components/Providersignup/Providersignup"),
  {
    loading: () => <Skeleton height={300} count={6} />,
    ssr: false,
  }
);

const Page = () => {
  const setLocation = useLocation((state) => state.setLocation);
  const location = useLocation((state) => state.location);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.warn("Geolocation error:", error);
        }
      );
    }
  }, [setLocation]);

  console.log(location, "location from zustand store");

  return (
    <div>
      <Providersignup location={location} />
    </div>
  );
};

export default Page;
