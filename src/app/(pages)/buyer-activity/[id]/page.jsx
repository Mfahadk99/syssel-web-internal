"use client";
import React, { useEffect, useCallback } from "react";
import { useGetAllMissionsByBuyer } from "@/app/hooks/useMission";
import { useGetAllBookingbyCustomer } from "@/app/hooks/useBooking";
import useAuthStore from "@/app/store/useAuthStore";
import { useParams } from "next/navigation";
import useSearch from "@/app/store/useSearch";
// import SimpleLogoLoader from "@/app/components/Loader/Loader";
import dynamic from "next/dynamic";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const Header = dynamic(() => import("@/app/components/Header/Header"), {
  loading: () => <Skeleton height={60} count={1} borderRadius={24} style={{ marginTop: 28 }}/>,
  ssr: false,
});

const Activity = dynamic(
  () => import("../../../components/Activity/Activity"),
  {
    loading: () => (
    <div>
      <Skeleton height={200} count={1} borderRadius={24} style={{ marginTop: 10 }}/>
      <Skeleton height={100} count={4} borderRadius={24} style={{ marginTop: 28 }}/>
    </div>
    ),
    ssr: false,
  }
);

// Function to group missions by time category
function groupMissionsByTimeCategory(missions = []) {
  if (!Array.isArray(missions)) {
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

  missions.forEach((mission) => {
    const createdAt = new Date(mission.createdAt);
    const isToday = createdAt.toDateString() === today.toDateString();
    const isThisWeek = createdAt >= thisWeekStart && createdAt < today;

    const missionItem = {
      id: mission._id,
      title: mission.title,
      business: mission.category?.name || "General",
      description: mission.about,
      date: mission.deadline
        ? new Date(mission.deadline).toLocaleDateString()
        : "No deadline",
      days: mission.remainingDays !== null ? mission.remainingDays : 0,
      image: mission.images[0],
      status: mission.status,
      bids: mission.bidCount || 0,
    };

    if (isToday) {
      result[0].orders.push(missionItem);
    } else if (isThisWeek) {
      result[1].orders.push(missionItem);
    } else {
      result[2].orders.push(missionItem);
    }
  });

  // Remove empty categories
  return result.filter((category) => category.orders.length > 0);
}

// Function to group orders by time category and status
function groupOrdersByTimeCategory(orders = []) {
  if (!Array.isArray(orders)) {
    return [];
  }

  const today = new Date();
  const thisWeekStart = new Date(today);
  thisWeekStart.setDate(today.getDate() - 7); // 7 days ago

  const result = [
    { id: 1, category: "today", orders: [] },
    { id: 2, category: "this week", orders: [] },
    { id: 3, category: "upcoming", orders: [] },
    { id: 4, category: "completed", orders: [] },
  ];

  orders.forEach((order) => {
    // console.log(order)
    const createdAt = new Date(order.createdAt);
    const slotDate = new Date(order.slot?.date);
    const isToday = slotDate.toDateString() === today.toDateString();
    const isThisWeek = slotDate >= thisWeekStart && slotDate < today;
    const isCompleted = order.status === "completed";
    const isUpcoming = !isCompleted && slotDate > today;

    const orderItem = {
      id: order._id,
      title: order.service?.name || "Service Name",
      business: order.provider?.name || "Provider Name",
      description: order.service?.description || "Description",
      price: `${order.amount || 0} kr`,
      date: order.slot?.date
        ? new Date(order.slot.date).toLocaleDateString()
        : "No date", // Using slot date
      time:
        order.slot?.startTime && order.slot?.endTime
          ? `${order.slot.startTime} - ${order.slot.endTime}`
          : "No time", // Hardcoded: time range from slot
      days: Math.ceil((slotDate - today) / (1000 * 60 * 60 * 24)), // Calculate days difference
      image: order.service?.images,
      status: order.status,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      isManual: order.isManual,
    };

    // Group by status and time
    if (isCompleted) {
      result[3].orders.push(orderItem); // completed
    } else if (isToday) {
      result[0].orders.push(orderItem); // today
    } else if (isThisWeek) {
      result[1].orders.push(orderItem); // this week
    } else if (isUpcoming) {
      result[2].orders.push(orderItem); // upcoming
    }
  });

  // Remove empty categories
  return result.filter((category) => category.orders.length > 0);
}

const Page = () => {
  const { id } = useParams();
  const { searchQuery, setSearchQuery } = useSearch();
  // const { currentProfile } = useAuthStore();
  // const profileId = currentProfile?._id;

  const {
    data: missions,
    isLoading: missionsLoading,
    isError: missionsError,
    refetch: refetchMissions,
  } = useGetAllMissionsByBuyer(id);

  const {
    data: orders,
    isLoading: ordersLoading,
    isError: ordersError,
    refetch: refetchOrders,
  } = useGetAllBookingbyCustomer(id);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await Promise.all([refetchMissions(), refetchOrders()]);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
      }
    };

    fetchData();
  }, [id, refetchMissions, refetchOrders]);

  if (missionsError || ordersError) {
    return <div className="text-red-500">Error loading missions or orders</div>;
  }

  // Process missions data only if it exists
  const missionsData = missions?.missions
    ? groupMissionsByTimeCategory(
        missions.missions.filter((mission) =>
          mission.title.toLowerCase().includes(searchQuery.toLowerCase())
        )
      )
    : [];

  // Process orders data only if it exists
  const orderData = orders?.data?.bookings
    ? groupOrdersByTimeCategory(
        orders.data.bookings.filter((order) =>
          (order.service?.name || "")
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
        )
      )
    : [];

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

  // Use useCallback to prevent re-renders
  const handleSearch = useCallback(
    (query) => {
      setSearchQuery(query);
    },
    [setSearchQuery]
  );

  const heading = { title: "Activity" };

  // if (missionsLoading || ordersLoading || !missions || !orders) {
  //   return <SimpleLogoLoader />;
  // }

  if (missionsError || ordersError) {
    return <div>error: something went wrong...</div>;
  }

  return (
    <div className="w-[95%] mx-auto mt-3">
      <Header heading={heading} showSearchBar={true} onSearch={handleSearch} />
      <Activity
        activityData={activityData}
        heading={"Activity"}
        searchBar={true}
        missionData={missionsData}
        orderData={orderData}
      />
    </div>
  );
};

export default Page;
