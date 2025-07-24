"use client";
import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Share2,
  Edit,
  MapPin,
  Calendar,
  Star,
  Users,
  UserPlus,
  ChevronDown,
  Search,
  Check,
  Clock,
  Bell,
} from "lucide-react";
import SlidingButtons from "../Reusable/SlidingButtons";
import ShareButton from "../Reusable/ShareButton";
import Reviews from "../Reusable/Reviews";
import DummyProfileImage from "../../../../public/DummyProfileImage.png";
import Image from "next/image";
import {
  useGetAllProfilesByIds,
  useGetAllProfilesBySearch,
  useUpdateProfile,
} from "@/app/hooks/useProfile";
import useAuthStore from "@/app/store/useAuthStore";
import { useRouter } from "next/navigation";
import { useCreateFriendAction } from "@/app/hooks/useFriends";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import EditProfileModal from "./EditProfileModal";

// Add debounce hook before the component
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const BuyerProfile = ({ Profile, refetchProfile }) => {
  const { currentProfile } = useAuthStore();
  const viewer = currentProfile?._id === Profile?._id ? "self" : "buyer";
  const [activeTab, setActiveTab] = useState("reviews");
  const [viewerType, setViewerType] = useState(viewer); // 'self', 'buyer', 'Provider'
  const [sortType, setSortType] = useState("name"); // "name", "dateAsc", "dateDesc"
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [pendingRequests, setPendingRequests] = useState(new Set());
  const [sentRequests, setSentRequests] = useState(new Set());
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [acceptedRequests, setAcceptedRequests] = useState(new Set());
  const [rejectedRequests, setRejectedRequests] = useState(new Set());
  const [reload, setReload] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  console.log(
    Profile,
    "Profiledataaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
  );
  // Debounce the search query
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // Add null checks for all Profile properties
  const profile = {
    name: Profile?.name || "User",
    location: `${Profile?.city || ""}, ${Profile?.country || ""}`,
    avatar: Profile?.image || DummyProfileImage,
    memberSince: Profile?.createdAt || "Not specified",
    stats: {
      reviews: Profile?.ratings?.providerToBuyer?.totalReviews || 0,
      Friends: Profile?.Friends?.length || 0,
      following: Profile?.following?.length || 0,
    },
  };

  const { data: searchProfiles } =
    useGetAllProfilesBySearch(debouncedSearchQuery);

  // Add null check for reviews
  const dummyReviews = Profile?.ratings?.providerToBuyer?.reviews || [];

  // Get accepted friends from Profile
  const acceptedFriends =
    Profile?.friends?.filter((friend) => friend.status === "accepted") || [];
  const friendIds = acceptedFriends.map((friend) => friend.id);

  // Use the friend IDs to get their profiles
  const { data: friendsData, refetch: refetchFriends } =
    useGetAllProfilesByIds(friendIds);
  const friends = friendsData?.data?.profiles || [];

  // Replace dummyFriends with real friend data
  const realFriends = friends.map((friend) => ({
    _id: friend._id,
    name: friend.name,
    date: new Date(friend.createdAt).toLocaleDateString(),
    avatar: friend.image || DummyProfileImage,
  }));

  // Tab data for the animated category buttons
  const tabData = [
    { id: "reviews", label: "Reviews", icon: Star },
    { id: "Friends", label: "Friends", icon: Users },
    { id: "following", label: "Following", icon: UserPlus },
  ];
  const { data: following } = useGetAllProfilesByIds(Profile?.following);
  const Following = following?.data?.profiles;

  // Dummy data for following
  const dummyFollowing = Following?.map((following) => ({
    _id: following._id,
    name: following.name,
    date: following.createdAt,
    avatar: following.image || DummyProfileImage,
    products: following.products,
  }));

  // Add the mutation hook with Profile._id
  const createFriendMutation = useCreateFriendAction(Profile?._id);

  // Update the handleAddFriend function
  const handleAddFriend = (targetUserId) => {
    createFriendMutation.mutate(
      {
        targetUserId,
        action: "send",
      },
      {
        onSuccess: () => {
          // Add to sent requests set when successful
          setSentRequests((prev) => new Set([...prev, targetUserId]));
        },
      }
    );
  };

  // Function to handle add follower
  const handleAddFollower = () => {
    console.log("Add follower clicked");
  };

  // Add this function to check if a profile is already a friend
  const isAlreadyFriend = (profileId) => {
    return friendIds.includes(profileId);
  };

  // Add this function to check if a profile has a pending request
  const hasPendingRequest = (profileId) => {
    return Profile?.friends?.some(
      (friend) => friend.id === profileId && friend.status === "pending"
    );
  };

  // Filter out user's own profile from search results
  const filteredSearchProfiles =
    searchProfiles?.data?.profiles?.filter(
      (profile) => profile._id !== Profile._id
    ) || [];

  // Update the filter function to use realFriends instead of dummyFriends
  const getFilteredAndSortedFriends = () => {
    let filteredFriends = [...realFriends];

    if (searchQuery) {
      filteredFriends = filteredFriends.filter((follower) =>
        follower.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    switch (sortType) {
      case "name":
        return filteredFriends.sort((a, b) => a.name.localeCompare(b.name));
      case "dateAsc":
        return filteredFriends.sort(
          (a, b) => new Date(a.date) - new Date(b.date)
        );
      case "dateDesc":
        return filteredFriends.sort(
          (a, b) => new Date(b.date) - new Date(a.date)
        );
      default:
        return filteredFriends;
    }
  };

  // Filter and sort following based on search query and sort type
  const getFilteredAndSortedFollowing = () => {
    let filteredFollowing = [...dummyFollowing];

    if (searchQuery) {
      filteredFollowing = filteredFollowing.filter((Provider) =>
        Provider.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    switch (sortType) {
      case "name":
        return filteredFollowing.sort((a, b) => a.name.localeCompare(b.name));
      case "dateAsc":
        return filteredFollowing.sort(
          (a, b) => new Date(a.date) - new Date(b.date)
        );
      case "dateDesc":
        return filteredFollowing.sort(
          (a, b) => new Date(b.date) - new Date(a.date)
        );
      default:
        return filteredFollowing;
    }
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    setShowSearchResults(value.length > 0);
  };

  // Function to render action buttons based on viewer type
  const renderActionButtons = () => {
    return (
      <div className="flex gap-3 w-full sm:w-auto">
        <ShareButton
          title={`Check out ${profile.name}'s profile`}
          text={`I found this amazing service provider on our platform!`}
          className="bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 text-white rounded-xl px-4 py-2 text-sm font-medium flex items-center justify-center transition-all duration-300"
        >
          <Share2 className="w-4 h-4 mr-2" />
          Share
        </ShareButton>
        {viewerType === "self" ? (
          <button
            onClick={handleEditProfile}
            className="bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 text-white rounded-xl px-4 py-2 text-sm font-medium flex items-center justify-center transition-all duration-300"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit Profile
          </button>
        ) : viewerType === "buyer" ? (
          <button
            onClick={handleAddFollower}
            className="bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 text-white rounded-xl px-4 py-2 text-sm font-medium flex items-center justify-center transition-all duration-300"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Add Follower
          </button>
        ) : null}
      </div>
    );
  };

  // Get received pending requests
  const receivedPendingRequests =
    Profile?.friends?.filter(
      (friend) =>
        friend.status === "pending" && friend.requestStatus === "received"
    ) || [];

  // Get profiles of users who sent requests
  const pendingRequestIds = receivedPendingRequests.map((req) => req.id);
  const { data: pendingRequestProfiles } =
    useGetAllProfilesByIds(pendingRequestIds);
  const requestProfiles = pendingRequestProfiles?.data?.profiles || [];

  // Function to handle accept/reject requests
  const handleRequestAction = (targetUserId, action) => {
    createFriendMutation.mutate(
      {
        targetUserId,
        action,
      },
      {
        onSuccess: () => {
          if (action === "accept") {
            setAcceptedRequests((prev) => new Set([...prev, targetUserId]));
            // Refresh friends list after accepting
            refetchFriends();
          } else if (action === "reject") {
            setRejectedRequests((prev) => new Set([...prev, targetUserId]));
          }
          // Close modal if no more pending requests
          if (receivedPendingRequests.length <= 1) {
            setIsRequestModalOpen(false);
          }
        },
      }
    );
  };

  const handleUnfriend = (targetUserId) => {
    createFriendMutation.mutate(
      {
        targetUserId,
        action: "unfriend",
      },
      {
        onSuccess: () => {
          refetchProfile();
        },
      }
    );
  };

  const handleCancelRequest = (targetUserId) => {
    createFriendMutation.mutate(
      {
        targetUserId,
        action: "cancel",
      },
      {
        onSuccess: () => {
          setSentRequests((prev) => {
            const newSet = new Set(prev);
            newSet.delete(targetUserId);
            return newSet;
          });
          // Refresh search results if we're in search mode
          if (showSearchResults) {
            // You might want to trigger a refetch of search results here
            // This depends on how your search hook is implemented
          }
        },
      }
    );
  };

  const handleEditProfile = () => {
    setIsEditModalOpen(true);
  };

  const router = useRouter();

  return (
    <div className="min-h-screen p-2 sm:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Profile Section - Using primary color gradient */}
        <div className="bg-gradient-to-t from-[var(--color-secondary)] to-[var(--color-primary)] text-white rounded-2xl shadow-lg p-4 sm:p-8 mb-8">
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8">
            {/* Avatar with Rating Badge */}
            <div className="shrink-0 relative">
              <Image
                src={profile.avatar}
                alt={profile.name}
                width={96}
                height={96}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-4 border-white"
                onError={(e) => {
                  e.target.src = DummyProfileImage;
                }}
              />
              {/* Rating Badge - Moved to bottom-right */}
              <div className="absolute -bottom-2 -right-2 bg-white rounded-full shadow-lg p-1">
                <div className="flex items-center justify-center bg-skin w-6 h-6 rounded-full">
                  <span className="text-primary text-xs font-medium">
                    {Profile?.ratings?.providerToBuyer?.averageRating}
                  </span>
                </div>
              </div>
            </div>

            {/* Minimalistic Profile Info */}
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-xl sm:text-2xl font-bold mb-1">
                {profile.name}
              </h1>
              <div className="flex items-center justify-center sm:justify-start mb-4 text-purple-200">
                <MapPin className="w-4 h-4 mr-1" />
                <span>{profile.location}</span>
              </div>

              {/* Minimalistic Stats - Horizontal layout */}
              <div className="flex justify-center sm:justify-start gap-6">
                <div className="text-center">
                  <div className="text-xl font-bold">
                    {profile.stats.reviews}
                  </div>
                  <div className="text-xs text-purple-200">Reviews</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold">
                    {profile.stats.Friends}
                  </div>
                  <div className="text-xs text-purple-200">Friends</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold">
                    {profile.stats.following}
                  </div>
                  <div className="text-xs text-purple-200">Following</div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {renderActionButtons()}
          </div>
        </div>

        {/* Content Section - Using secondary color for active states */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="p-6 pb-0">
            <SlidingButtons
              buttons={tabData}
              activeButton={activeTab}
              setActiveButton={setActiveTab}
              className="bg-gray-100 max-w-fit mx-auto shadow-inner"
              buttonClassName="py-2 px-6 flex items-center justify-center gap-2"
              activeButtonClassName="text-white"
              inactiveButtonClassName="text-gray-500"
            />
          </div>

          {/* Content area with theme colors */}
          <div className="p-4 sm:p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {/* Content for Reviews Tab */}
                {activeTab === "reviews" && (
                  <div className="space-y-4 sm:space-y-6">
                    <h2 className="text-xl font-medium mb-6 text-[var(--color-primary)]">
                      Reviews & Ratings
                    </h2>

                    {/* Reviews component with adjusted margin */}
                    <motion.div className="-mb-6">
                      <Reviews
                        averageRating={
                          Profile?.ratings?.providerToBuyer?.averageRating
                        }
                        reviews={dummyReviews}
                        title="Average Rating"
                        profile={Profile}
                      />
                    </motion.div>
                  </div>
                )}

                {/* Content for Friends Tab */}
                {activeTab === "Friends" && (
                  <div className="space-y-4 sm:space-y-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                      <h2 className="text-xl font-medium text-[var(--color-primary)]">
                        Friends
                      </h2>

                      <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                        {viewerType === "self" && (
                          <>
                            <div className="relative flex-grow sm:flex-grow-0">
                              <input
                                type="text"
                                placeholder="Search Friends..."
                                value={searchQuery}
                                onChange={handleSearchChange}
                                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all"
                              />
                              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            </div>

                            {/* Friend Requests Button */}
                            <button
                              onClick={() => setIsRequestModalOpen(true)}
                              className="relative bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm font-medium hover:bg-gray-50 transition-colors flex items-center gap-2"
                            >
                              <Bell className="w-4 h-4" />
                              Friend Requests
                              {receivedPendingRequests.length > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                  {receivedPendingRequests.length}
                                </span>
                              )}
                            </button>
                          </>
                        )}

                        {/* Sort Dropdown - only show when not searching */}
                        {viewerType === "self" && !showSearchResults && (
                          <div className="relative">
                            <select
                              value={sortType}
                              onChange={(e) => setSortType(e.target.value)}
                              className="appearance-none bg-white border border-gray-200 rounded-xl px-4 py-2 pr-8 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] cursor-pointer"
                            >
                              <option value="name">Sort by Name</option>
                              <option value="dateAsc">
                                Date (Oldest First)
                              </option>
                              <option value="dateDesc">
                                Date (Newest First)
                              </option>
                            </select>
                            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Display search results when searching, otherwise show friends */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {showSearchResults ? (
                        // Search Results
                        filteredSearchProfiles.length > 0 ? (
                          filteredSearchProfiles.map((profile) => (
                            <motion.div
                              key={profile._id}
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ duration: 0.3 }}
                              className="flex items-center p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors"
                            >
                              <Image
                                src={profile.image || DummyProfileImage}
                                alt={profile.name}
                                width={48}
                                height={48}
                                className="w-12 h-12 rounded-full object-cover mr-4"
                              />
                              <div className="flex-1">
                                <h3 className="font-medium text-[var(--color-primary)]">
                                  {profile.name}
                                </h3>
                                <p className="text-sm text-[var(--color-secondary)]">
                                  {profile.city}, {profile.country}
                                </p>
                              </div>
                              {isAlreadyFriend(profile._id) ? (
                                <div className="text-xs bg-green-100 text-green-600 px-3 py-1 rounded-full flex items-center gap-1">
                                  <Check className="w-3 h-3" />
                                  Friend
                                </div>
                              ) : hasPendingRequest(profile._id) ||
                                sentRequests.has(profile._id) ? (
                                <motion.div
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  className="flex items-center gap-2"
                                >
                                  <button
                                    onClick={() =>
                                      handleCancelRequest(profile._id)
                                    }
                                    className="text-xs bg-red-500 text-white px-3 py-1 rounded-full hover:bg-red-600 transition-colors"
                                  >
                                    Cancel Request
                                  </button>
                                </motion.div>
                              ) : (
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => handleAddFriend(profile._id)}
                                  className="text-xs bg-[var(--color-primary)] text-white px-3 py-1 rounded-full hover:bg-[var(--color-secondary)] transition-colors flex items-center gap-1"
                                >
                                  <UserPlus className="w-3 h-3" />
                                  Add
                                </motion.button>
                              )}
                            </motion.div>
                          ))
                        ) : (
                          <div className="col-span-2 text-center py-8">
                            <p className="text-gray-500">No profiles found</p>
                          </div>
                        )
                      ) : // Regular Friends List
                      getFilteredAndSortedFriends().length > 0 ? (
                        getFilteredAndSortedFriends().map((follower) => (
                          <motion.div
                            key={follower.name}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3 }}
                            className="flex items-center p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors"
                          >
                            <Image
                              src={follower.avatar}
                              alt={follower.name}
                              width={48}
                              height={48}
                              className="w-12 h-12 rounded-full object-cover mr-4"
                            />
                            <div className="flex-1">
                              <h3 className="font-medium text-[var(--color-primary)]">
                                {follower.name}
                              </h3>
                              <p className="text-sm text-[var(--color-secondary)]">
                                Joined {follower.date}
                              </p>
                            </div>
                            {viewerType === "self" && (
                              <button
                                onClick={() => handleUnfriend(follower._id)}
                                className="text-xs bg-red-500 text-white px-3 py-1 rounded-full hover:bg-red-600 transition-colors"
                              >
                                Unfriend
                              </button>
                            )}
                          </motion.div>
                        ))
                      ) : (
                        <div className="col-span-2 text-center py-8">
                          <p className="text-gray-500">No friends found</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Content for Following Tab */}
                {activeTab === "following" && (
                  <div className="space-y-4 sm:space-y-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                      <h2 className="text-xl font-medium text-[var(--color-primary)]">
                        Following
                      </h2>

                      {/* Only show search and sort when viewerType is "self" */}
                      {viewerType === "self" && (
                        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                          {/* Search Input */}
                          <div className="relative flex-grow sm:flex-grow-0">
                            <input
                              type="text"
                              placeholder="Search following..."
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all"
                            />
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          </div>

                          {/* Sort Dropdown */}
                          <div className="relative">
                            <select
                              value={sortType}
                              onChange={(e) => setSortType(e.target.value)}
                              className="appearance-none bg-white border border-gray-200 rounded-xl px-4 py-2 pr-8 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] cursor-pointer"
                            >
                              <option value="name">Sort by Name</option>
                              <option value="dateAsc">
                                Date (Oldest First)
                              </option>
                              <option value="dateDesc">
                                Date (Newest First)
                              </option>
                            </select>
                            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Following Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {!Profile?.following || Profile.following.length === 0 ? (
                        <div className="col-span-2 text-center py-8">
                          <p className="text-gray-500">No following data</p>
                        </div>
                      ) : (
                        getFilteredAndSortedFollowing().map((Provider) => (
                          <motion.div
                            key={Provider._id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3 }}
                            className="flex items-center p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors"
                          >
                            <Image
                              src={Provider.avatar}
                              alt={Provider.name}
                              width={48}
                              height={48}
                              className="w-12 h-12 rounded-full object-cover mr-4"
                            />
                            <div className="flex-1">
                              <h3 className="font-medium text-[var(--color-primary)]">
                                {Provider.name}
                              </h3>
                              <p className="text-sm text-[var(--color-secondary)]">
                                {Provider.products} products
                              </p>
                            </div>
                            <button
                              className="text-xs bg-[var(--color-primary)] text-white px-3 py-1 rounded-full"
                              onClick={() =>
                                router.push(
                                  `/provider-profile/${Provider?._id}`
                                )
                              }
                            >
                              View
                            </button>
                          </motion.div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Friend Requests Modal */}
      <Transition appear show={isRequestModalOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-50"
          onClose={() => setIsRequestModalOpen(false)}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900 mb-4"
                  >
                    Friend Requests
                  </Dialog.Title>

                  <div className="space-y-4">
                    {requestProfiles.length > 0 ? (
                      requestProfiles.map((profile) => (
                        <div
                          key={profile._id}
                          className="flex items-center justify-between p-4 border border-gray-100 rounded-xl"
                        >
                          <div className="flex items-center gap-3">
                            <Image
                              src={profile.image || DummyProfileImage}
                              alt={profile.name}
                              width={40}
                              height={40}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                            <div>
                              <h4 className="font-medium text-gray-900">
                                {profile.name}
                              </h4>
                              <p className="text-sm text-gray-500">
                                {profile.city}, {profile.country}
                              </p>
                            </div>
                          </div>
                          {acceptedRequests.has(profile._id) ? (
                            <div className="text-xs bg-green-100 text-green-600 px-3 py-1 rounded-full">
                              Accepted
                            </div>
                          ) : rejectedRequests.has(profile._id) ? (
                            <div className="text-xs bg-red-100 text-red-600 px-3 py-1 rounded-full">
                              Rejected
                            </div>
                          ) : (
                            <div className="flex gap-2">
                              <button
                                onClick={() =>
                                  handleRequestAction(profile._id, "accept")
                                }
                                className="px-3 py-1 bg-green-500 text-white text-sm rounded-full hover:bg-green-600 transition-colors"
                              >
                                Accept
                              </button>
                              <button
                                onClick={() =>
                                  handleRequestAction(profile._id, "reject")
                                }
                                className="px-3 py-1 bg-red-500 text-white text-sm rounded-full hover:bg-red-600 transition-colors"
                              >
                                Reject
                              </button>
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-gray-500 py-4">
                        No pending friend requests
                      </p>
                    )}
                  </div>

                  <div className="mt-6">
                    <button
                      onClick={() => setIsRequestModalOpen(false)}
                      className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        profile={{ ...Profile, refetchProfile }}
      />
    </div>
  );
};

export default BuyerProfile;
