"use client";
import React from "react";
import dynamic from "next/dynamic";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { useParams } from "next/navigation";

const Notifications = dynamic(
  () => import("../../../components/Screens/Notifications"),
  {
    loading: () => <Skeleton height={100} count={6} />,
    ssr: false,
  }
);

const page = () => {
  const { id } = useParams();
  return (
    <div>
      <Notifications id={id} />
    </div>
  );
};

export default page;
