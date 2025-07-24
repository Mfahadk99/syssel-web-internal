"use client";

import { useState, useEffect } from "react";
import SlidingButtons from "../Reusable/SlidingButtons";
import { motion, AnimatePresence } from "framer-motion";
import DummyProfileImage from "../../../../public/DummyProfileImage.png";
import Image from "next/image";
import {
  Star,
  PlusCircle,
  Camera,
  MapPin,
  MessageSquare,
  User,
  Heart,
  LayoutGrid,
  Home,
  Edit,
  FileText,
  ImageIcon,
  Plus,
  X,
  Share2,
  CheckCircle,
} from "lucide-react";
import { HiBadgeCheck } from "react-icons/hi";
import { ConsultationCard } from "../Reusable/Card";
import ReusableSwiper from "../Reusable/Swiper";
import { IoIosArrowDroprightCircle } from "react-icons/io";
import Section from "./NewSection";
import NewServiceAndVoucherCard from "./NewServiceAndVoucherCard";
import ServiceForm from "./ServiceForm";
import VoucherForm from "./VoucherForm";
import ProviderInfo from "./ProviderInfo";
import ProviderGalary from "./ProviderGalary";
import Ratings from "../Reusable/Ratings";
import ShareButton from "../Reusable/ShareButton";
import Reviews from "../Reusable/Reviews";
import { useRouter } from "next/navigation";
import { useCreateService } from "@/app/hooks/useServices";
import { useCreateVoucher } from "@/app/hooks/useVoucher";
import { useGetSettingsById } from "@/app/hooks/useSettings";
import { useGetProfileById } from "@/app/hooks/useProfile";
import useAuthStore from "@/app/store/useAuthStore";
import {
  useFollow,
  useUnfollow,
} from "@/app/hooks/useFollow";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";

export default function ProviderProfile({
  initialSections,
  breakpoints,
  providerId,
  providerData,
  galleryData,
  subcategories,
  isCurrentProfile,
  userType,
  providerTotalServices,
}) {
  const [activeTab, setActiveTab] = useState("Services");
  const [sections, setSections] = useState(
    initialSections.map((section) => ({
      ...section,
      ProviderServices: section.ProviderServices || [],
      vouchers: section.vouchers || [],
    }))
  );
  const queryClient = useQueryClient();
  const [expandedSections, setExpandedSections] = useState({});
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [showVoucherForm, setShowVoucherForm] = useState(false);
  const [activeSectionForForm, setActiveSectionForForm] = useState(null);
  const router = useRouter();
  const createServiceMutation = useCreateService();
  const createVoucherMutation = useCreateVoucher();

  const { data: settingsData } = useGetSettingsById(providerData?.id);
  console.log(settingsData, "settingsData");
  const { user } = useAuthStore();
  const { currentProfile } = useAuthStore();
  const userId = user?.id;

  const { data: profileData } = useGetProfileById(currentProfile?._id);
  const followings = profileData?.data?.following || [];

  const followedProviders = followings || [];

  // Check if this provider is followed
  const isFollowed = followedProviders.includes(providerId);

  const [isFollowing, setIsFollowing] = useState(isFollowed);

  // Follow/unfollow hooks
  const followMutation = useFollow();
  const unfollowMutation = useUnfollow();

  // Handle follow/unfollow click
  const handleFollowClick = async (e) => {
    e.stopPropagation();
    e.preventDefault();
    try {
      if (isFollowed) {
        await unfollowMutation.mutateAsync({ providerId, userId });
        setIsFollowing(false);
      } else {
        await followMutation.mutateAsync({ providerId, userId });
        setIsFollowing(true);
      }
      // refetch(); // Refresh the followed providers list
    } catch (error) {
      console.error("Error following/unfollowing:", error);
      setIsFollowing(!isFollowing);
    }
  };

  const handleExpandSection = (sectionTitle, sectionId) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionTitle]: !prev[sectionTitle],
    }));
    // Store the section ID when expanded
    if (!expandedSections[sectionTitle]) {
      setActiveSectionForForm(sectionId);
    }
  };

  // Tab navigation
  const tabData = [
    { id: "Services", label: "Services", icon: LayoutGrid },
    { id: "Info", label: "Info", icon: FileText },
    { id: "Gallery", label: "Gallery", icon: ImageIcon },
    { id: "Reviews", label: "Reviews", icon: Star },
  ];

  const profile = {
    name: providerData?.name || "T.B. Carpentry",
    location:
      `${settingsData?.data?.location?.address || ""}, ${providerData?.city}, ${providerData?.country}` ||
      "Oslo, Norway",
    address: settingsData?.data?.location?.address || "",
    city: providerData?.city || "",
    country: providerData?.country || "",
    rating: providerData?.ratings?.buyerToProvider?.averageRating || 0,
    description: providerData?.description || "Description",
    isVerified: providerData?.isVerified || true,
    avatar: providerData?.image || DummyProfileImage,
    coverpic:
      providerData?.coverImage ||
      "https://images.pexels.com/photos/31303471/pexels-photo-31303471/free-photo-of-protest-for-feminism-and-anticolonialism-in-city.jpeg",
    memberSince:
      new Date(providerData?.createdAt).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      }) || "Jan 2023",
    stats: {
      reviews: providerData?.ratings?.buyerToProvider?.totalReviews || 0,
      friends: providerData?.followers?.length || 0,
      following: providerData?.following?.length || 0,
    },
  };

  // console.log(providerData, "dataaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa");

  const handleUpdateSections = (updatedSections) => {
    // Ensure each section has both ProviderServices and vouchers arrays
    const formattedSections = updatedSections.map((section) => ({
      ...section,
      ProviderServices: section.ProviderServices || [],
      vouchers: section.vouchers || [],
    }));
    setSections(formattedSections);
  };

  const handleAddItem = async (sectionTitle, newItem) => {
    try {
      const apiData = {
        ...newItem,
        provider: providerId,
      };

      let response;
      if (newItem.type === "STORE" || newItem.type === "SERVICE") {
        apiData.sectionId = [activeSectionForForm];
        response = await createVoucherMutation.mutateAsync(apiData);
        queryClient.invalidateQueries({ queryKey: ['vouchers'] });
      } else {
        apiData.sections = [activeSectionForForm];
        response = await createServiceMutation.mutateAsync(apiData);
        queryClient.invalidateQueries({ queryKey: ['services'] });
      }

      // Format the item based on whether it's a service or voucher
      const formattedItem = {
        ...newItem,
        imageUrl:
          newItem.images?.[0]?.preview || newItem.images?.[0]?.url || "",
        images: newItem.images?.map((img) => ({
          url: img.preview || img.url,
          id: Math.random().toString(36).substr(2, 9),
        })),
      };

      // Update sections state
      setSections(
        sections.map((section) => {
          if (section.title === sectionTitle) {
            if (newItem.type === "STORE" || newItem.type === "SERVICE") {
              return {
                ...section,
                vouchers: [...(section.vouchers || []), formattedItem],
              };
            } else {
              return {
                ...section,
                ProviderServices: [
                  ...(section.ProviderServices || []),
                  formattedItem,
                ],
              };
            }
          }
          return section;
        })
      );

      // Reset form states
      setShowServiceForm(false);
      setShowVoucherForm(false);
      setActiveSectionForForm(null);
      toast.success("Item created successfully!");
      // window.location.reload();
    } catch (error) {
      console.error("Error creating item:", error);
      toast.error("Failed to create item. Please try again.");
    }
  };

  // Helper function to render action buttons based on viewerType
  const renderActionButtons = () => {
    return (
      <div className="absolute top-6 right-6 flex gap-2">
        <ShareButton
          title={`Check out ${profile.name}'s profile`}
          text={`I found this amazing service provider on our platform!`}
          className="bg-white/10 cursor-pointer backdrop-blur-sm border border-white/20 hover:bg-white/20 text-white rounded-xl px-4 py-2 text-sm font-medium flex items-center justify-center transition-all duration-300"
        >
          <Share2 className="w-4 h-4 mr-2" />
          Share
        </ShareButton>

        {isCurrentProfile && (
          <button
            onClick={() => router.push("/company-info")}
            className="cursor-pointer bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 text-white rounded-xl px-4 py-2 text-sm font-medium flex items-center justify-center transition-all duration-300"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit Profile
          </button>
        )}

        {userType === "buyer" && (
          <button
            onClick={handleFollowClick}
            className="bg-white/10 cursor-pointer backdrop-blur-sm border border-white/20 hover:bg-white/20 text-white rounded-xl px-4 py-2 text-sm font-medium flex items-center justify-center transition-all duration-300"
          >
            {isFollowing ? (
              <>
                <User className="w-4 h-4 mr-2" />
                Unfollow
              </>
            ) : (
              <>
                <User className="w-4 h-4 mr-2" />
                Follow
              </>
            )}
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen p-2">
      <div className="mx-auto">
        {/* Profile Section */}
        <div className="relative p-4 m-1">
          <div className="rounded-2xl bg-gradient-to-t from-[var(--color-secondary)] to-[var(--color-primary)]">
            {/* Cover profile section */}
            <div className="flex h-48 bg-gradient-to-b from-[var(--color-gradientlight)] to-[var(--color-gradientdark)] rounded-2xl relative">
              <Image
                src={profile.coverpic}
                alt={profile.name}
                fill
                className="object-cover opacity-50 rounded-t-xl"
                priority
              />

              {/* Action Buttons */}
              {renderActionButtons()}
            </div>

            <div className="rounded-b-xl">
              <div className="text-white rounded-2xl">
                <div className="flex">
                  {/* Profile picture with rating badge */}
                  <div className="relative w-40">
                    {/* Profile Picture Container */}
                    <div className="absolute top-[-80px] left-10 w-20 h-20 sm:w-28 sm:h-28 rounded-full shadow-lg">
                      <Image
                        src={profile.avatar}
                        alt={profile.name}
                        width={112}
                        height={112}
                        className="w-full h-full rounded-full object-cover border-4 border-white"
                      />
                      {/* Rating Badge - Even smaller and repositioned */}
                      <div className="absolute -bottom-0 right-1 transform translate-x-1/4 bg-white rounded-full shadow-md border-2 border-gray-200">
                        <div className="flex items-center justify-center w-7 h-7 rounded-full bg-white">
                          <span className="text-primary font-bold text-[13px]">
                            {profile.rating}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-2">
                    <h1 className="text-xl sm:text-2xl font-bold mb-1 mt-2">
                      {profile.name}
                      {profile.isVerified && (
                        <span className="inline-flex ml-1">
                          <HiBadgeCheck className="w-5 h-5 text-white" />
                        </span>
                      )}
                    </h1>
                  </div>
                </div>

                <p className="text-sm sm:text-base text-gray-100 mt-1 ml-8 mr-6">
                  {profile.description}
                </p>
                <div className="flex-1 text-center sm:text-left">
                  <div className="flex ml-8 mt-2 items-center justify-center sm:justify-start text-purple-200">
                    <MapPin className="w-4 h-4 mr-1" />
                    {profile.address && <span>{profile.address}, </span>}
                    {profile.city && <span>{profile.city}, </span>}
                    {profile.country && <span>{profile.country}</span>}
                  </div>

                  {/* Minimalistic Stats - Horizontal layout */}
                  <div className="flex justify-center sm:justify-center gap-16 ml-6 pb-4">
                    <div className="text-center">
                      <div className="text-xl font-bold">
                        {profile.stats.reviews}
                      </div>
                      <div className="text-xs text-purple-200">Reviews</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold">
                        {profile.stats.friends}
                      </div>
                      <div className="text-xs text-purple-200">Followers</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold">
                        {profile.stats.following}
                      </div>
                      <div className="text-xs text-purple-200">Recommends</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden ml-4 mr-4">
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

          <AnimatePresence mode="wait">
            {activeTab === "Services" && (
              <motion.div
                key="services"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="p-6">
                  {/* Only show Section component for non-buyer viewers */}
                  {isCurrentProfile && (
                    <Section
                      initialSections={sections}
                      breakpoints={breakpoints}
                      onUpdateSections={handleUpdateSections}
                      providerId={providerId}
                      providerTotalServices={providerTotalServices}
                      subcategories={subcategories}
                    />
                  )}
                </div>
                <div className="p-4">
                  {sections.map((section, index) => (
                    <div
                      key={index}
                      className={`mb-8 ${
                        Object.values(expandedSections).some(Boolean) &&
                        !expandedSections[section.title]
                          ? "hidden"
                          : ""
                      }`}
                    >
                      <div className="flex items-center mb-4">
                        <h2 className="text-2xl font-bold">{section.title}</h2>
                        <button
                          onClick={() =>
                            handleExpandSection(
                              section.title,
                              section.sectionId
                            )
                          }
                          className="ml-auto"
                        >
                          <IoIosArrowDroprightCircle
                            className={`text-3xl text-primary cursor-pointer transition-transform duration-300 ${
                              expandedSections[section.title] ? "rotate-90" : ""
                            }`}
                          />
                        </button>
                      </div>

                      <div className="w-[95%] mx-auto">
                        {expandedSections[section.title] ? (
                          <div className="flex flex-col gap-6">
                            <div className="grid gap-4">
                              {section.ProviderServices?.map((item, index) => (
                                <ConsultationCard
                                  key={index}
                                  item={item}
                                  routePrefix={"/service-info"}
                                  isExpanded={true}
                                />
                              ))}
                              {section.vouchers?.map((voucher, index) => (
                                <ConsultationCard
                                  key={index}
                                  item={voucher}
                                  routePrefix={"/voucher-view"}
                                  isExpanded={true}
                                />
                              ))}
                            </div>
                            {/* Only show NewServiceAndVoucherCard for non-buyer viewers */}
                            {userType !== "buyer" && (
                              <NewServiceAndVoucherCard
                                onServiceClick={() => {
                                  setShowServiceForm(true);
                                  setActiveSectionForForm(section.sectionId);
                                }}
                                onVoucherClick={() => {
                                  setShowVoucherForm(true);
                                  setActiveSectionForForm(section.sectionId);
                                }}
                              />
                            )}
                          </div>
                        ) : (
                          <div>
                            {(section.ProviderServices?.length > 0 ||
                              section.vouchers?.length > 0) && (
                              <ReusableSwiper
                                data={[
                                  ...(section.ProviderServices || []),
                                  ...(section.vouchers || []),
                                ]}
                                Component={ConsultationCard}
                                slidesPerView="auto"
                                spaceBetween={12}
                                id={`section-services-${index}`}
                                className="consultations-swiper"
                                noWrap={true}
                                breakpoints={breakpoints}
                              />
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === "Info" && (
              <motion.div
                key="info"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <ProviderInfo userType={userType} providerData={providerData} />
              </motion.div>
            )}

            {activeTab === "Gallery" && (
              <motion.div
                key="gallery"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <ProviderGalary
                  galleryData={galleryData}
                  viewerType={userType}
                  providerData={providerData}
                />
              </motion.div>
            )}

            {activeTab === "Reviews" && (
              <motion.div
                key="reviews"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="p-6">
                  {/* General Reviews Component */}
                  <Reviews
                    averageRating={
                      providerData?.ratings?.buyerToProvider?.averageRating
                    }
                    reviews={providerData?.ratings?.buyerToProvider?.reviews}
                    title="Average Ratings"
                    profile={providerData}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Forms */}
      {showServiceForm && (
        <ServiceForm
          providerId={providerId}
          providerSetting={settingsData}
          subcategories={subcategories}
          initialSections={sections}
          sectionId={activeSectionForForm}
          onSubmit={(formData) => handleAddItem(activeSectionForForm, formData)}
          onCancel={() => {
            setShowServiceForm(false);
            setActiveSectionForForm(null);
          }}
        />
      )}

      {showVoucherForm && (
        <VoucherForm
          providerId={providerId}
          providerTotalServices={providerTotalServices}
          initialSections={sections}
          onSubmit={(formData) => handleAddItem(activeSectionForForm, formData)}
          onCancel={() => {
            setShowVoucherForm(false);
            setActiveSectionForForm(null);
          }}
        />
      )}
    </div>
  );
}
