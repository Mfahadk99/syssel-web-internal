"use client";
import React, { useEffect } from "react";
import dynamic from "next/dynamic";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import useLocation from "@/app/store/useLocation";

const Buyersignup = dynamic(
  () => import("@/app/components/Buyersignup/Buyersignup"),
  {
    loading: () => <Skeleton height={300} count={1} />,
    ssr: false,
  }
);

const page = () => {
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
      <Buyersignup location={location} />
    </div>
  );
};

export default page;
