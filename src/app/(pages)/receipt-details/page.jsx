"use client";
import React from "react";
import dynamic from "next/dynamic";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const ReceiptDetails = dynamic(
  () => import("../../components/Receipts/ReceiptDetails"),
  {
    loading: () => (
        <div className="bg-[#fef3ec] min-h-screen flex justify-center items-start p-6 md:p-10">
          <div className="bg-white rounded-xl shadow-md p-6 md:p-10 w-full max-w-3xl space-y-6">
            {/* Title */}
            <Skeleton height={36} width="40%" />
    
            {/* Business Info */}
            <div className="flex items-center space-x-4">
              <Skeleton height={60} width={60} borderRadius={12} />
              <div className="space-y-2">
                <Skeleton height={20} width={150} />
                <Skeleton height={16} width={120} />
              </div>
            </div>
    
            {/* Order Number */}
            <Skeleton height={24} width={120} />
    
            {/* Service Card */}
            <div className="flex space-x-4">
              <Skeleton height={120} width={120} borderRadius={16} />
              <div className="flex-1 space-y-3">
                <Skeleton height={20} width="60%" />
                <Skeleton height={16} width="40%" />
                <Skeleton height={16} width="30%" />
              </div>
            </div>
    
            {/* Divider line */}
            <div className="border-t pt-4 space-y-3">
              {[...Array(4)].map((_, i) => (
                <div className="flex justify-between items-center" key={i}>
                  <Skeleton height={16} width="30%" />
                  <Skeleton height={16} width="15%" />
                </div>
              ))}
            </div>
          </div>
        </div>
    ),
    ssr: false,
  }
);

const page = () => {
  const data = [
    {
      _id: "1",
      name: "Amundsen Elektro",
      avatar:
        "https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      coverpic:
        "https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      rating: 4.3,
      distance: 500,
      url: "/place/amundsen-elektro",
      isVerified: true,
      location: "Oslo, Norway",
      stats: {
        reviews: 100,
        followers: 1000,
        following: 100,
      },
    },
    {
      _id: "2",
      name: "BLEKK Tattoo & Piercing",
      avatar:
        "https://images.pexels.com/photos/2244746/pexels-photo-2244746.jpeg?auto=compress&cs=tinysrgb&w=600",
      coverpic:
        "https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      rating: 4.0,
      distance: 250,
      url: "/place/blekk-tattoo",
      isVerified: true,
      location: "Oslo, Norway",
      stats: {
        reviews: 100,
        followers: 1000,
        following: 100,
      },
    },
    {
      _id: "3",
      name: "Trond G",
      avatar:
        "https://images.pexels.com/photos/169391/pexels-photo-169391.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      rating: null, // No rating visible in image
      coverpic:
        "https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      distance: 200,
      url: "/place/trond-g",
      isVerified: true,
      location: "Oslo, Norway",
      stats: {
        reviews: 100,
        followers: 1000,
        following: 100,
      },
    },
    {
      _id: "4",
      name: "Sutra Yoga Studio",
      avatar:
        "https://images.pexels.com/photos/1267315/pexels-photo-1267315.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      coverpic:
        "https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      rating: 4.5,
      distance: 300,
      url: "/place/sutra-yoga",
      isVerified: true,
      location: "Oslo, Norway",
      stats: {
        reviews: 100,
        followers: 1000,
        following: 100,
      },
    },
    {
      _id: "5",
      name: "DJ Ruben VAAGA",
      avatar:
        "https://images.pexels.com/photos/209230/pexels-photo-209230.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      coverpic:
        "https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      rating: 4.8,
      distance: 200,
      url: "/place/dj-ruben",
      isVerified: false,
      location: "Oslo, Norway",
      stats: {
        reviews: 100,
        followers: 1000,
        following: 100,
      },
    },
    {
      _id: "6",
      name: "Simen Ru",
      avatar:
        "https://images.pexels.com/photos/6196225/pexels-photo-6196225.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      coverpic:
        "https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      rating: null, // Not visible in image
      distance: 200,
      url: "/place/simen-ru",
      isVerified: false,
      location: "Oslo, Norway",
      stats: {
        reviews: 100,
        followers: 1000,
        following: 100,
      },
    },
  ];

  return (
    <div className="w-[95%] mx-auto mt-3">
      <ReceiptDetails data={data} />
    </div>
  );
};

export default page;
