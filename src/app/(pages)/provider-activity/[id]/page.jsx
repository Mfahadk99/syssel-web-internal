"use client";
import React, { useCallback, useEffect } from "react";
import dynamic from "next/dynamic";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { useGetAllBidsByProvider } from "@/app/hooks/useBids";
import useAuthStore from "@/app/store/useAuthStore";
// import { useLoader } from "@/app/context/LoaderContext";
import { useParams } from "next/navigation";
import useSearch from "@/app/store/useSearch";

const Header = dynamic(() => import("@/app/components/Header/Header"), {
  loading: () => <Skeleton height={60} count={1} />,
  ssr: false,
});

const Activity = dynamic(
  () => import("../../../components/Activity/Activity"),
  {
    loading: () => <Skeleton height={300} count={1} />,
    ssr: false,
  }
);

// Function to group bids by time category
function groupBidsByTimeCategory(bids = []) {
  if (!Array.isArray(bids)) {
    return [];
  }

  const today = new Date();
  const thisWeekStart = new Date(today);
  thisWeekStart.setDate(today.getDate() - 7); // 7 days ago

  const result = [
    { id: 1, category: "today", orders: [] },
    { id: 2, category: "this week", orders: [] },
    { id: 3, category: "older", orders: [] },
  ];

  bids.forEach((bid) => {
    const createdAt = new Date(bid.createdAt);
    const isToday = createdAt.toDateString() === today.toDateString();
    const isThisWeek = createdAt >= thisWeekStart && createdAt < today;

    const bidItem = {
      id: bid.mission?.id,
      title: bid.mission?.title || "Mission Title",
      business: bid.mission?.category?.name || "General",
      description: bid.mission?.about || "No description",
      price: bid.amount || "Request Price",
      days: bid.mission?.remainingDays !== null ? bid.mission.remainingDays : 0,
      image: bid.mission?.images?.[0] || null,
      status: bid.status,
      bids: 1, // Each bid represents one bid
      bidMessage: bid.message,
      provider: bid.provider?.[0]?.name || "Provider Name",
    };

    if (isToday) {
      result[0].orders.push(bidItem);
    } else if (isThisWeek) {
      result[1].orders.push(bidItem);
    } else {
      result[2].orders.push(bidItem);
    }
  });

  // Remove empty categories
  return result.filter((category) => category.orders.length > 0);
}

const Page = () => {
  // const { isLoading, setLoading } = useLoader();
  const { searchQuery, setSearchQuery } = useSearch();
  const { id } = useParams();
  const { currentProfile } = useAuthStore();
  const profileId = currentProfile?._id;
  const { data: providerOrders, isLoading: isLoadingProviderOrders } =
    useGetAllBidsByProvider(id);

  // Filter providerBids based on search query
  const providerBids =
    providerOrders?.data?.bids?.filter(
      (bid) =>
        bid.status === "pending" &&
        bid.mission?.title?.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

  // Loader
  // useEffect(() => {
  //   setLoading(isLoadingProviderOrders);
  // }, [isLoadingProviderOrders, setLoading]);

  // Process bids data only if it exists
  const bidsData =
    providerBids.length > 0 ? groupBidsByTimeCategory(providerBids) : [];

  // Keep the original activity data for now
  const activityData = [
    {
      id: 1,
      category: "today",
      messages: [
        {
          id: 101,
          name: "Privé Hair",
          avatar: "/images/avatars/prive-hair.jpg",
          message:
            "Hi again Thomas! Looking forward to our appointment next week. I wanted to confirm if you'd prefer the classic haircut style we discussed or if you'd like to try something new. We have some exciting new trending styles that I think would suit your face shape perfectly. Let me know your thoughts!",
          time: "12:24",
          unread: true,
        },
      ],
    },
  ];

  console.log(bidsData, "bidsData");

  const heading = { title: "Activity" };

  // Use useCallback to prevent re-renders
  const handleSearch = useCallback(
    (query) => {
      setSearchQuery(query);
    },
    [setSearchQuery]
  );

  return (
    <div className="w-[95%] mx-auto mt-3">
      <Header heading={heading} showSearchBar={true} onSearch={handleSearch} />
      <Activity
        activityData={activityData}
        heading={"Activity"}
        searchBar={true}
        orderData={bidsData}
      />
    </div>
  );
};

export default Page;
