"use client";
import React, { useEffect, useState } from "react";
import SlidingButtons from "../Reusable/SlidingButtons";
import { FiMessageSquare, FiShoppingCart, FiMapPin } from "react-icons/fi";
import { usePathname, useRouter } from "next/navigation";
import ChatTabV1 from "./ChatTabV1";
import OrdersTab from "./ordersTab";
import MissionsTab from "./MissionsTab";
import { OptionsButton } from "../Modals/Options/Options";
import ActivityCard from "./ActivityCard";
import { useGetAllBidsByMission } from "@/app/hooks/useBids";
import useAuthStore from "@/app/store/useAuthStore";
import Image from "next/image";
import {
  useGetRecentConversation,
  useCreateMessage,
} from "@/app/hooks/useChat";
import { X, CheckCircle, AlertCircle } from "lucide-react";

// Bid Message Modal Component
const BidMessageModal = ({
  isOpen,
  onClose,
  bidData,
  onCreateChat,
  isLoading,
}) => {
  const [buttonState, setButtonState] = useState("idle"); // idle, loading, success, error

  const handleClick = async () => {
    setButtonState("loading");
    try {
      const result = await onCreateChat();
      if (result !== false) {
        setButtonState("success");
        setTimeout(() => {
          setButtonState("idle");
          onClose();
        }, 1200);
      } else {
        setButtonState("error");
        setTimeout(() => setButtonState("idle"), 1200);
      }
    } catch {
      setButtonState("error");
      setTimeout(() => setButtonState("idle"), 1200);
    }
  };

  if (!isOpen || !bidData) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-black/40">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-xl border border-gray-100 animate-fadeIn">
        {/* Header */}
        <div className="flex justify-between items-center pt-5 px-6 border-b pb-3">
          <h2 className="text-xl font-semibold text-gray-800">Bid Message</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={buttonState === "loading"}
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex items-center gap-4 mb-5">
            <div className="w-14 h-14 bg-gradient-to-br from-primary/30 to-primary/60 rounded-full flex items-center justify-center text-primary font-bold text-2xl shadow-md uppercase">
              <Image
                src={bidData.provider[0]?.image}
                alt={bidData.provider[0]?.name}
                width={50}
                height={50}
                className="w-full h-full object-cover rounded-full"
              />
              {/* {bidData.provider[0]?.image || bidData.provider[0]?.name?.charAt(0)} */}
            </div>
            <div>
              <h3 className="font-medium text-gray-900 text-lg">
                {bidData.provider[0]?.name || "Provider"}
              </h3>
              <p className="text-sm text-gray-500">
                {new Date(bidData.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="bg-gray-100 rounded-xl p-4 mb-4 border border-gray-200">
            <p className="text-gray-700 text-sm leading-relaxed">
              {bidData.message}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6">
          <button
            onClick={handleClick}
            disabled={buttonState === "loading" || buttonState === "success"}
            className={`w-full py-3 rounded-full font-semibold flex items-center justify-center gap-2 transition-all duration-200
              ${
                buttonState === "loading"
                  ? "bg-primary/70 text-white cursor-wait"
                  : buttonState === "success"
                  ? "bg-green-500 text-white"
                  : buttonState === "error"
                  ? "bg-red-500 text-white"
                  : "bg-primary text-white hover:bg-primary/90"
              }
            `}
          >
            {buttonState === "loading" && (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            )}
            {buttonState === "success" && <CheckCircle size={20} />}
            {buttonState === "error" && <AlertCircle size={20} />}
            {buttonState === "loading"
              ? "Creating..."
              : buttonState === "success"
              ? "Created"
              : buttonState === "error"
              ? "Try Again"
              : "Create Chat"}
          </button>
        </div>
      </div>
    </div>
  );
};

const Activity = ({
  activityData,
  heading,
  searchBar,
  optionButtonsData = [],
  optionButtonTitle = "Options",
  missionData = [],
  orderData = [],
}) => {
  const { currentProfile } = useAuthStore();
  const [activeTab, setActiveTab] = useState("chat");
  const [activeFilter, setActiveFilter] = useState("all");
  const [orderStatus, setOrderStatus] = useState("recent");
  const [selectedMissionId, setSelectedMissionId] = useState(null);
  const [showBidModal, setShowBidModal] = useState(false);
  const [selectedBid, setSelectedBid] = useState(null);
  const pathname = usePathname();
  const router = useRouter();

  // Add enabled condition to only fetch when selectedMissionId exists
  const {
    data: bidsResponse,
    isLoading: isBidsLoading,
    error: bidsError,
    refetch: refetchBids,
  } = useGetAllBidsByMission(selectedMissionId, {
    enabled: !!selectedMissionId, // Only fetch when selectedMissionId is not null
  });

  // Create message mutation
  const { mutate: createMessage, isLoading: isCreatingChat } =
    useCreateMessage();

  const tabDataBuyer = [
    { id: "chat", icon: FiMessageSquare, label: "Chat" },
    { id: "orders", icon: FiShoppingCart, label: "Orders" },
    { id: "missions", icon: FiMapPin, label: "Missions" },
  ];

  const tabDataProvider = [
    { id: "chat", icon: FiMessageSquare, label: "Chat" },
    { id: "orders", icon: FiShoppingCart, label: "Orders" },
  ];

  // Function to navigate to chat with mission data
  const navigateToChat = (rooms, providerId, bidData) => {
    console.log("bidData", bidData);

    // Search for room that contains the specific provider
    const existingRoom = rooms?.find((room) =>
      room.participants.some(
        (participant) =>
          participant._id === providerId || participant.id === providerId
      )
    );

    if (existingRoom) {
      router.push(`/chat?profileId=${providerId}&currentUser=${bidData.buyer}`);
    } else {
      // console.log("No room exists with this provider");
      // Show modal with bid message
      setSelectedBid(bidData);
      setShowBidModal(true);
    }
  };

  // Function to create chat
  const handleCreateChat = () => {
    if (!selectedBid) return;

    const chatData = {
      buyerProfileId: selectedBid.buyer,
      sellerProfileId: selectedBid.provider[0]._id,
      senderProfileId: selectedBid.provider[0]._id,
      type: "mission",
      content: selectedBid.message,
      missionId: selectedMissionId,
    };

    console.log("Creating chat with data:", chatData);

    createMessage(chatData, {
      onSuccess: (response) => {
        console.log("Chat created successfully:", response);
        setShowBidModal(false);
        setSelectedBid(null);

        // Optionally navigate to the new chat room

        if (response?.data?.roomId) {
          window.location.href = `/chat?profileId=${response.data.message.sender}&currentUser=${selectedBid.buyer}`;
        }
      },
      onError: (error) => {
        console.error("Error creating chat:", error);
        // Handle error (show toast, etc.)
      },
    });
  };

  const renderActivityList = () => {
    return activityData.map((section) => (
      <div key={section.id} className="mb-8">
        <h2 className="text-sm font-medium mb-3 text-gray-500 uppercase tracking-wider">
          {section.category}
        </h2>
        <div className="space-y-4 ">
          {section.messages.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl transition-all duration-200 cursor-pointer relative"
            >
              <div className="relative w-14 h-14 rounded-full overflow-hidden shadow-sm">
                <div className="w-14 h-14 bg-gradientlight rounded-full flex items-center justify-center text-primary font-medium text-lg">
                  {item.name.charAt(0)}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-1">
                  <h3 className="font-semibold text-gray-800">{item.name}</h3>
                  <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    {item.time}
                  </span>
                </div>
                <p className="w-[90%] text-sm text-gray-600 truncate">
                  {item.message}
                </p>
              </div>
              {item.unread && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 bg-primary rounded-full ring-2 ring-indigo-100"></div>
              )}
            </div>
          ))}
        </div>
      </div>
    ));
  };

  const renderCard = (data) => {
    return (
      <ActivityCard
        data={data}
        activeTab={activeTab}
        selectedMissionId={selectedMissionId}
        setSelectedMissionId={setSelectedMissionId}
        RenderBidsList={RenderBidsList}
      />
    );
  };

  const RenderBidsList = ({ missionId, missionData }) => {
    if (isBidsLoading)
      return <div className="mt-4 text-center">Loading bids...</div>;
    if (bidsError)
      return (
        <div className="mt-4 text-center text-red-500">Error loading bids</div>
      );

    // Extract bids from the response
    const bids = bidsResponse?.data?.bids || [];

    console.log("bids", bids);

    const { data: roomExist } = useGetRecentConversation(bids[0]?.buyer, {
      enabled: !!bids[0]?.buyer,
    });

    return (
      <div className="mt-4">
        <div className="flex items-center mb-4">
          <h2 className="text-2xl text-secondary font-bold mx-3">Bids</h2>
          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
            <span className="text-sm font-bold">{bids.length}</span>
          </div>
        </div>

        <div className="space-y-4">
          {bids.length === 0 ? (
            <div className="text-center text-gray-500">No bids yet</div>
          ) : (
            bids.map((bid) => (
              <div
                key={bid._id}
                className="flex items-start gap-4 p-4 bg-white rounded-xl cursor-pointer hover:bg-gray-50"
                onClick={() => {
                  navigateToChat(
                    roomExist?.data?.rooms,
                    bid.provider[0]._id,
                    bid
                  );
                }}
              >
                <div className="w-14 h-14 bg-gray-200 rounded-full overflow-hidden flex-shrink-0">
                  <div className="w-full h-full flex items-center justify-center text-primary font-medium text-lg">
                    <Image
                      src={bid.provider[0]?.image}
                      alt={bid.provider[0]?.name}
                      width={50}
                      height={50}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <h3 className="font-bold text-gray-800">
                      {bid.provider[0]?.name || "Provider"}
                    </h3>
                    <span className="text-sm text-gray-500">
                      {new Date(bid.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-600 mt-1">{bid.message}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  return (
    <div>
      {/* Category tabs with sliding indicator using SlidingButtons component */}
      {pathname === `/buyer-activity/${currentProfile?._id}` ? (
        <div className="mb-2">
          <SlidingButtons
            buttons={tabDataBuyer}
            activeButton={activeTab}
            setActiveButton={setActiveTab}
          />
        </div>
      ) : (
        pathname === `/provider-activity/${currentProfile?._id}` && (
          <div className="mb-2">
            <SlidingButtons
              buttons={tabDataProvider}
              activeButton={activeTab}
              setActiveButton={setActiveTab}
            />
          </div>
        )
      )}

      {/* chat tab */}
      {(pathname === `/provider-activity/${currentProfile?._id}` ||
        pathname === `/buyer-activity/${currentProfile?._id}`) && (
        <div className="relative">
          {/* chat tab */}
          <ChatTabV1
            activeTab={activeTab}
            activeFilter={activeFilter}
            setActiveFilter={setActiveFilter}
            renderActivityList={renderActivityList}
          />

          {/* orders tab */}
          <OrdersTab
            activeTab={activeTab}
            orderStatus={orderStatus}
            setOrderStatus={setOrderStatus}
            orderData={orderData}
            activeFilter={activeFilter}
            setActiveFilter={setActiveFilter}
            renderCard={renderCard}
          />

          {/* missions tab */}
          <MissionsTab
            activeTab={activeTab}
            orderStatus={orderStatus}
            setOrderStatus={setOrderStatus}
            missionData={missionData}
            activeFilter={activeFilter}
            setActiveFilter={setActiveFilter}
            renderCard={renderCard}
          />
        </div>
      )}

      {pathname === `/Notifications/${currentProfile?._id}` && (
        <div className="mt-10">{renderActivityList()}</div>
      )}

      {/* Bid Message Modal */}
      <BidMessageModal
        isOpen={showBidModal}
        onClose={() => {
          setShowBidModal(false);
          setSelectedBid(null);
        }}
        bidData={selectedBid}
        onCreateChat={handleCreateChat}
        isLoading={isCreatingChat}
      />
    </div>
  );
};

export default Activity;
