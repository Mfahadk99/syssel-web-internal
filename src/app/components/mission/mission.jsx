"use client";
import React, { useEffect, useState } from "react";
import {
  MapPin,
  Star,
  ChevronRight,
  ChevronLeft,
  X,
  Heart,
  Check,
  Loader2,
} from "lucide-react";
import { useGetMissionById } from "@/app/hooks/useMission";
import { useParams } from "next/navigation";
import useAuthStore from "@/app/store/useAuthStore";
import useFavourite from "@/app/store/useFavourite";
import { useCreateBid, useGetAllBidsByMission } from "@/app/hooks/useBids";
import Image from "next/image";
// import { useLoader } from "@/app/context/LoaderContext";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

// Image Slider Modal component
const ImageSliderModal = ({ isOpen, onClose, images, initialIndex = 0 }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  if (!isOpen || !images || images.length === 0) return null;

  // Sample dummy images for testing when mission has only one image
  const allImages = images.length > 1 ? images : [images[0]];

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
      <div className="relative w-full max-w-4xl mx-auto">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 text-white hover:text-gray-300 z-10"
        >
          <X className="h-8 w-8" />
        </button>

        {/* Main image */}
        <div className="relative">
          <Image
            src={allImages[currentIndex]}
            alt={`Image ${currentIndex + 1}`}
            width={1200}
            height={800}
            className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
          />

          {/* Navigation arrows */}
          <button
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </div>

        {/* Thumbnails */}
        <div className="flex justify-center mt-4 space-x-2">
          {allImages.map((img, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-16 h-16 overflow-hidden rounded-md ${
                currentIndex === index ? "ring-2 ring-white" : "opacity-70"
              }`}
            >
              <Image
                src={img}
                alt={`Thumbnail ${index + 1}`}
                width={64}
                height={64}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

const Mission = () => {
  const { id } = useParams();
  // const { setLoading } = useLoader();
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const { mutate: createBid, isPending: isCreatingBid } = useCreateBid();
  const { data: bids, isLoading: isLoadingBids } = useGetAllBidsByMission(id);
  const [bidMessage, setBidMessage] = useState("");
  const [bidStatus, setBidStatus] = useState("idle"); // 'idle', 'loading', 'success', 'error'

  const { data: mission, isLoading: isLoadingMission } = useGetMissionById(id);
  const { currentProfile } = useAuthStore();
  const missionId = id;
  const profileId = currentProfile?._id;
  const profileType = currentProfile?.profileType;
  const { handleFavorite, isFavorite } = useFavourite();
  const queryClient = useQueryClient();
  // useEffect(() => {
  //   setLoading(isLoadingMission || isLoadingBids);
  // }, [isLoadingMission, isLoadingBids, setLoading]);

  let date = new Date(mission?.createdAt);
  let dateOnly = date.toLocaleDateString();
  // Dynamic data for the mission
  const missionData = {
    publisher: {
      name: mission?.buyer?.name,
      avatar: mission?.buyer?.image,
    },
    mission: {
      title: mission?.title,
      type: mission?.category?.name,
      location: mission?.location,
      date: dateOnly,
      description: mission?.about,
      address: "St. Olavs Gate 11, 0165 Oslo",
      image: mission?.images?.[0],
      images: mission?.images || [],
    },
    bids: bids?.data?.bids || [],
  };

  const hasPlacedBid = missionData.bids.some(
    (bid) =>
      bid.provider &&
      Array.isArray(bid.provider) &&
      bid.provider.some((p) => p._id === profileId)
  );

  const handleCreateBid = () => {
    if (!bidMessage.trim()) {
      toast.error("Please enter a message");
      return;
    }

    setBidStatus("loading");

    const bidData = {
      mission: missionId,
      provider: profileId,
      message: bidMessage.trim(),
    };

    createBid(bidData, {
      onSuccess: () => {
        
        setBidStatus("success");
        queryClient.invalidateQueries(["mission", id]);
        setTimeout(() => {
          setBidStatus("idle");
          setBidMessage(""); // Clear the message after successful submission
        }, 3000);
      },
      onError: (error) => {
        console.error("Error creating bid:", error);
        setBidStatus("error");
      },
    });
  };

  const getButtonContent = () => {
    switch (bidStatus) {
      case "loading":
        return (
          <>
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            Loading...
          </>
        );
      case "success":
        return (
          <>
            <Check className="w-5 h-5 mr-2" />
            Submitted
          </>
        );
      case "error":
        return "Retry";
      default:
        return "Make a Bid";
    }
  };

  const getButtonClass = () => {
    const baseClass =
      "w-full py-4 px-6 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 font-medium shadow-sm hover:shadow-md active:scale-[0.98] flex items-center justify-center";

    switch (bidStatus) {
      case "loading":
        return `${baseClass} bg-gray-400 text-white cursor-not-allowed`;
      case "success":
        return `${baseClass} bg-green-500 text-white hover:bg-green-600 focus:ring-green-500/50`;
      case "error":
        return `${baseClass} bg-red-500 text-white hover:bg-red-600 focus:ring-red-500/50`;
      default:
        return `${baseClass} bg-primary text-white hover:bg-primary/90 focus:ring-primary/50`;
    }
  };

  return (
    <div className="w-[95%] mx-auto mt-3">
      {/* Header */}
      <header className="sm:hidden p-4 flex bg-white shadow-sm rounded-lg mb-3 justify-between items-center">
        <div className="flex gap-2 items-center">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-300">
              {missionData.publisher.avatar ? (
                <Image
                  src={missionData.publisher.avatar}
                  alt="Profile"
                  width={40}
                  height={40}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-300" />
              )}
            </div>
          </div>
          <h2 className="font-semibold text-lg">
            {missionData.publisher.name}
          </h2>
        </div>
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleFavorite(id);
          }}
          className="p-2 rounded-full hover:bg-gray-100"
        >
          <Heart
            className={`w-6 h-6 ${
              isFavorite(id) ? "fill-red-500 text-red-500" : "text-gray-600"
            }`}
          />
        </button>
      </header>

      {/* Main Container */}
      <div className=" mx-auto">
        <div className="flex flex-col bg-white rounded-lg shadow-sm mb-3">
          {/* Event Image */}
          <div
            className="h-100 w-full relative rounded-lg overflow-hidden cursor-pointer"
            onClick={() => setIsImageModalOpen(true)}
          >
            {missionData.mission.image ? (
              <Image
                src={missionData.mission.image}
                alt="mission image"
                width={1200}
                height={800}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500">
                No Image Available
              </div>
            )}

            <div className="absolute top-0 left-0 hidden bg-black/50 sm:flex flex-col justify-between w-full h-full">
              {/* profile and name */}
              <div className="flex justify-between items-center w-full p-4">
                <div className="flex gap-2 items-center">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-300">
                      <Image
                        src={
                          missionData.publisher.avatar ||
                          "/images/default-avatar.png"
                        }
                        alt="Profile"
                        width={40}
                        height={40}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  <h2 className="font-semibold text-white text-lg">
                    {missionData.publisher.name}
                  </h2>
                </div>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleFavorite(id);
                  }}
                  className="p-2 rounded-full hover:bg-white/10"
                >
                  <Heart
                    className={`w-6 h-6 ${
                      isFavorite(id)
                        ? "fill-red-500 text-red-500"
                        : "text-white"
                    }`}
                  />
                </button>
              </div>

              {/* Event Details */}
              <div className=" text-white w-full rounded-lg bg-gradient-to-b from-black/0 to-black/80 p-6">
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2">
                  {missionData.mission.title}
                </h1>
                <div className="flex items-center gap-2 text-white mb-4">
                  <span>{missionData.mission.type}</span>
                  {missionData.mission.location && (
                    <>
                      <span className="mx-1">•</span>
                      <MapPin size={16} className="inline" />
                      <span>{missionData.mission.location}</span>
                    </>
                  )}
                  <span className="mx-1">•</span>
                  <span>{missionData.mission.date}</span>
                </div>

                {/* Indicator that images can be viewed */}
                <div className="absolute bottom-4 right-4 bg-white/30 text-white px-3 py-1 rounded-full text-sm">
                  View Images
                </div>

                <div className="bg-white rounded-lg py-2 px-3  inline-block">
                  <span className="text-lg text-primary font-bold flex items-center gap-2">
                    {missionData.bids.length} Bids
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Event Details */}
          <div className="sm:hidden w-full rounded-lg p-2">
            <h1 className="text-xl md:text-3xl lg:text-4xl font-bold mb-1">
              {missionData.mission.title}
            </h1>
            <div className="flex text-sm items-center gap-2 mb-4">
              <span>{missionData.mission.type}</span>
              {missionData.mission.location && (
                <>
                  <span className="mx-1">•</span>
                  <MapPin size={16} className="inline" />
                  <span>{missionData.mission.location}</span>
                </>
              )}
              <span className="mx-1">•</span>
              <span>{missionData.mission.date}</span>
            </div>
            <span className="text-lg text-primary font-bold flex items-center gap-2">
              {missionData.bids.length} Bids
            </span>
          </div>
        </div>

        {/* Bids Section  */}
        {profileType === "buyer" && (
          <div className="p-6 bg-white rounded-lg shadow-sm mb-3">
            <h2 className="font-bold text-xl mb-3">Bids</h2>

            {missionData.bids.map((bid, index) => (
              <div
                key={index}
                className={`py-4 flex items-center ${
                  index < missionData.bids.length - 1
                    ? "border-b border-gray-100"
                    : ""
                }`}
              >
                <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 mr-4">
                  <Image
                    src={bid.avatar}
                    alt={bid.name}
                    width={48}
                    height={48}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <div className="font-semibold">{bid.name}</div>
                  <div className="text-gray-500 text-sm">{bid.message}</div>
                </div>
                <div className="text-gray-700 font-medium">{bid.date}</div>
              </div>
            ))}
          </div>
        )}

        {/* About Section */}
        <div className="p-6 bg-white rounded-lg shadow-sm mb-3">
          <h2 className="font-bold text-xl mb-3">About</h2>
          <p className="text-gray-700">{missionData.mission.description}</p>
        </div>

        {/* Location Section */}
        <div className="p-6 bg-white rounded-lg shadow-sm mb-3">
          <h2 className="font-bold text-lg mb-3">Location</h2>
          <div className="flex items-center mb-4">
            <MapPin size={18} className="text-gray-500 mr-2" />
            <span>{missionData.mission.address}</span>
          </div>

          <div className="h-48 bg-gray-200 rounded-lg relative mb-4">
            <Image
              src="/api/placeholder/600/200"
              alt="Map"
              width={600}
              height={200}
              className="w-full h-full object-cover rounded-lg"
            />
          </div>
        </div>

        {/* Make a Bid Button - Only show for non-buyer profiles */}
        {profileType !== "buyer" && (
          <div className="p-6 bg-white rounded-lg shadow-sm mb-3">
            {!hasPlacedBid && (
              <>
                <h2 className="font-bold text-lg mb-3">Message</h2>
                <textarea
                  className="w-full h-24 p-2 mb-3 border border-gray-300 rounded-lg"
                  placeholder="Enter your message here"
                  value={bidMessage}
                  onChange={(e) => setBidMessage(e.target.value)}
                  disabled={
                    bidStatus === "loading" ||
                    bidStatus === "success" ||
                    hasPlacedBid
                  }
                />
              </>
            )}

            <button
              onClick={handleCreateBid}
              disabled={
                bidStatus === "loading" ||
                bidStatus === "success" ||
                hasPlacedBid
              }
              className={
                hasPlacedBid
                  ? "w-full py-4 px-6 rounded-xl bg-green-500 text-white font-medium flex items-center justify-center"
                  : getButtonClass()
              }
            >
              {hasPlacedBid ? (
                <>
                  <Check className="w-5 h-5 mr-2" />
                  Bid Placed
                </>
              ) : (
                getButtonContent()
              )}
            </button>
          </div>
        )}
      </div>

      {/* Image Slider Modal */}
      <ImageSliderModal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        images={missionData.mission.images}
      />
    </div>
  );
};

export default Mission;
