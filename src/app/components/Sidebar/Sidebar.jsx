"use client";
import React, { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  Heart,
  Percent,
  FileText,
  Settings,
  LogOut,
  Menu,
  Plus,
  X,
  Bell,
  Activity,
  Rocket,
  Users,
  CircleUser,
  CalendarDays,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import useAuthStore from "@/app/store/useAuthStore";
import DummyProfileImage from "../../../../public/DummyProfileImage.png";
import { useGetAllProfilesByUserIds } from "@/app/hooks/useProfile";
// import { useLoader } from "@/app/context/LoaderContext";
import { useSidebarStatus } from "@/app/context/SidebarStatus";

const Sidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showProfileSwitcher, setShowProfileSwitcher] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [activeItem, setActiveItem] = useState("Home");

  // Use the sidebar status context
  const {
    isOpen,
    isMobileOpen,
    toggleSidebar,
    toggleMobileSidebar,
    closeMobileSidebar,
  } = useSidebarStatus();

  // Add refs for the modals
  const profileSwitcherRef = useRef(null);
  const logoutConfirmRef = useRef(null);

  // Add click outside handlers
  const handleClickOutside = (event, ref, setShow) => {
    if (ref.current && !ref.current.contains(event.target)) {
      setShow(false);
    }
  };

  // Add useEffect for click outside listeners
  useEffect(() => {
    const handleProfileSwitcherClickOutside = (event) =>
      handleClickOutside(event, profileSwitcherRef, setShowProfileSwitcher);
    const handleLogoutConfirmClickOutside = (event) =>
      handleClickOutside(event, logoutConfirmRef, setShowLogoutConfirm);

    if (showProfileSwitcher) {
      document.addEventListener("mousedown", handleProfileSwitcherClickOutside);
    }
    if (showLogoutConfirm) {
      document.addEventListener("mousedown", handleLogoutConfirmClickOutside);
    }

    return () => {
      document.removeEventListener(
        "mousedown",
        handleProfileSwitcherClickOutside
      );
      document.removeEventListener(
        "mousedown",
        handleLogoutConfirmClickOutside
      );
    };
  }, [showProfileSwitcher, showLogoutConfirm]);

  const {
    currentProfile,
    logout,
    isLoading,
    error,
    rememberedUsers,
    switchUser,
    user,
    createProfileByFilter,
    setCurrentProfile,
    isAuthenticated,
  } = useAuthStore();
  // const { setLoading } = useLoader();
  const Id = currentProfile?._id;

  const {
    data: rememberedProfiles,
    isLoading: isLoadingProfiles,
    refetch: refetchProfiles,
  } = useGetAllProfilesByUserIds([
    ...rememberedUsers.map((user) => user.id),
    ...(user?.id && !rememberedUsers.some((u) => u.id === user.id)
      ? [user.id]
      : []),
  ]);

  // useEffect(() => {
  //   setLoading(isLoadingProfiles || isLoading);
  // }, [isLoadingProfiles, isLoading, setLoading]);

  // Auto-load current profile if user is authenticated but currentProfile is null
  // useEffect(() => {
  //   const loadCurrentProfile = async () => {
  //     if (user && isAuthenticated && !currentProfile && !isLoading) {
  //       try {
  //         console.log("Loading current profile for user:", user.id);
  //         await createProfileByFilter({ id: user.id });
  //         // Refetch profiles after loading current profile
  //         await refetchProfiles();
  //       } catch (error) {
  //         console.error("Failed to load current profile:", error);
  //       }
  //     }
  //   };

  //   loadCurrentProfile();
  // }, [
  //   user,
  //   isAuthenticated,
  //   currentProfile,
  //   isLoading,
  //   createProfileByFilter,
  //   refetchProfiles,
  // ]);

  // Debug logging
  useEffect(() => {
    console.log("Current Profile:", currentProfile);
    console.log("User:", user);
    console.log("Is Authenticated:", isAuthenticated);
    console.log(
      "Remembered Profiles Data:",
      rememberedProfiles?.data?.profiles || []
    );
  }, [currentProfile, user, isAuthenticated, rememberedProfiles]);

  // Invalidate queries when currentProfile changes
  useEffect(() => {
    if (currentProfile) {
      console.log("Invalidating queries due to currentProfile change");
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
    }
  }, [currentProfile, queryClient]);

  // Ensure current user is in rememberedUsers for profile fetching
  useEffect(() => {
    if (
      user &&
      isAuthenticated &&
      currentProfile &&
      rememberedUsers.length > 0
    ) {
      const isUserInRemembered = rememberedUsers.some((u) => u.id === user.id);
      if (!isUserInRemembered) {
        console.log("Current user not in rememberedUsers, adding...");
        // This will trigger a re-render and the profile query will include the current user
        queryClient.invalidateQueries({ queryKey: ["profiles"] });
      }
    }
  }, [user, isAuthenticated, currentProfile, rememberedUsers, queryClient]);

  // if (error) return <p>Something went wrong</p>;

  const remembersProfilesData = rememberedProfiles?.data?.profiles || [];

  const authPages = [
    "/signin",
    "/signup",
    "/forgot-pass",
    "/confirm-email",
    "/reset-pass",
    "/provider-signup",
    "/buyer-signup",
    "/Profile-type"
  ];
  if (authPages.includes(pathname)) return null;
  let menuItems;
  {
    currentProfile?.profileType === "buyer"
      ? (menuItems = [
          { name: "Notifications", icon: <Bell size={25} /> },
          { name: "Activity", icon: <Activity size={25} /> },
          { name: "Discover", icon: <Rocket size={25} /> },
          { name: "Following", icon: <Users size={25} /> },
          { name: "My Profile", icon: <CircleUser size={25} /> },
          { name: "Favorites", icon: <Heart size={25} /> },
          { name: "Sales", icon: <Percent size={25} /> },
          { name: "Receipts", icon: <FileText size={25} /> },
          { name: "Settings", icon: <Settings size={25} /> },
          { name: "Log out", icon: <LogOut size={25} /> },
        ])
      : (menuItems = [
          { name: "Notifications", icon: <Bell size={25} /> },
          { name: "Activity", icon: <Activity size={25} /> },
          { name: "Missions", icon: <Rocket size={25} /> },
          { name: "Favorites", icon: <Heart size={25} /> },
          { name: "Calender", icon: <CalendarDays size={25} /> },
          { name: "My Profile", icon: <CircleUser size={25} /> },
          { name: "Sales", icon: <Percent size={25} /> },
          { name: "Receipts", icon: <FileText size={25} /> },
          { name: "Settings", icon: <Settings size={25} /> },
          { name: "Log out", icon: <LogOut size={25} /> },
        ]);
  }

  // Update the profiles array creation logic - only show remembered users
  const profiles = (remembersProfilesData || []).map((user) => ({
    id: user.user._id,
    name: user.name,
    role: user.profileType || "User",
    rating: Number((user.rating?.average).toFixed(1) || 0),
    active: user.user._id === currentProfile?._id,
    avatar: user.image || DummyProfileImage,
  }));

  console.log("Profiles array (only remembered users):", profiles);
  console.log("Current Profile:", currentProfile);

  const selectedProfile =
    profiles.find((profile) => profile.id === user?.id) || profiles[0];

  const handleProfileClick = () => setShowProfileSwitcher(!showProfileSwitcher);

  const handleProfileSwitch = async (profileId) => {
    // setLoading(true);
    try {
      const selectedUser = rememberedUsers.find(
        (user) => user.id === profileId
      );
      if (selectedUser) {
        // Switch to the selected user
        switchUser(selectedUser);

        // Fetch and set the profile for the selected user
        const profile = await createProfileByFilter(selectedUser);
        setCurrentProfile(profile);
        if (profile.profileType === "buyer") {
          router.push("/");
        }
        if (profile.profileType === "provider") {
          router.push("/missions");
        }
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      // setLoading(false);
    }
    setShowProfileSwitcher(false);
  };

  const handleMenuClick = (itemName) => {
    setActiveItem(itemName);
    if (itemName === "Log out") {
      setShowLogoutConfirm(true);
    }
    if (itemName === "Notifications") {
      router.push(`/Notifications/${currentProfile?._id}`);
    }
    if (itemName === "Favorites") {
      router.push("/Favorites");
    }
    if (itemName === "Activity" && currentProfile?.profileType === "buyer") {
      router.push(`/buyer-activity/${currentProfile?._id}`);
    }
    if (itemName === "Activity" && currentProfile?.profileType === "provider") {
      router.push(`/provider-activity/${currentProfile?._id}`);
    }
    if (
      itemName === "My Profile" &&
      currentProfile?.profileType === "provider"
    ) {
      router.push(`/provider-profile/${currentProfile?._id}`);
    }
    if (itemName === "My Profile" && currentProfile?.profileType === "buyer") {
      router.push(`/buyer-profile/${currentProfile?._id}`);
    }
    if (itemName === "Sales") {
      router.push(`/sales`);
    }
    if (itemName === "Following") {
      router.push("/following");
    }
    if (itemName === "Discover") {
      router.push("/");
    }
    if (itemName === "Calender") {
      router.push("/bookings");
    }
    if (itemName === "Missions") {
      router.push("/missions");
    }
    if (itemName === "Receipts") {
      router.push("/receipts");
    }
    if (itemName === "Settings") {
      router.push(`/Settings/${Id}`);
    }
  };

  const handleLogout = async () => {
    // setLoading(true);
    try {
      await logout();
      setShowLogoutConfirm(false);
    } finally {
      // setLoading(false);
    }
  };

  const renderMenuItems = (isDesktop = false) => (
    <div className="flex flex-col mt-auto mb-6 max-h-[50vh] scrollbar-design overflow-y-auto">
      {menuItems.map((item) => (
        <div
          key={item.name}
          className={`
            relative  border-b border-white/20 py-3 flex items-center  cursor-pointer transition-all text-white
            ${!isDesktop || isOpen ? "" : "justify-center"}
            ${
              activeItem === item.name
                ? "bg-[var(--color-primary)] bg-opacity-30"
                : "hover:bg-[var(--color-primary)] hover:bg-opacity-20"
            }
          `}
          onClick={() => {
            handleMenuClick(item.name);
          }}
        >
          <div className={`${!isDesktop || isOpen ? "mx-4" : "mx-0"}`}>
            {item.icon}
          </div>
          {(!isDesktop || isOpen) && (
            <span className="text-sm text-white">{item.name}</span>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <>
      <button
        onClick={toggleMobileSidebar}
        className="fixed top-4 left-4 z-50 p-2 text-white bg-[var(--color-primary)] rounded-lg md:hidden"
      >
        {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <div
        className={`
          md:hidden fixed inset-y-0 left-0 z-40 w-64 h-screen bg-gradient-to-b from-[var(--color-gradientlight)] to-[var(--color-gradientdark)] shadow-lg transition-all duration-300 ease-in-out
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Logo */}
        <div className="pt-2 mt-12 mb-auto ">
          <div className="flex items-center justify-start relative">
            <Image
              src="/Logo.png"
              alt="Logo"
              width={160}
              height={160}
              className="fill-current text-white"
            />
          </div>
        </div>

        {/* Menu Items */}

        {renderMenuItems()}

        {/* Profile Section */}
        <div className="mt-auto">
          <div
            className="px-4 py-2 flex items-center cursor-pointer text-white hover:bg-[var(--color-primary)] hover:bg-opacity-20"
            onClick={handleProfileClick}
          >
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-gray-300 overflow-hidden border-2 border-white">
                <Image
                  src={selectedProfile?.avatar || DummyProfileImage}
                  alt="User avatar"
                  width={48}
                  height={48}
                />
              </div>
              <div className="absolute -bottom-1 -right-1 bg-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold text-[var(--color-primary)]">
                {selectedProfile?.rating}
              </div>
            </div>
            <div className="ml-3">
              <div className="text-sm font-medium">{selectedProfile?.name}</div>
              <div className="text-xs opacity-80">{selectedProfile?.role}</div>
            </div>
          </div>
        </div>
      </div>

      {isMobileOpen && (
        <div
          className="md:hidden fixed inset-0 backdrop-blur-[2px] z-30"
          onClick={closeMobileSidebar}
        />
      )}

      <div className="hidden md:grid md:grid-cols-[auto,1fr] min-h-screen">
        <div
          className={`
          sticky top-0 z-40 ${
            isOpen ? "w-64" : "w-20"
          } h-screen bg-gradient-to-b from-[var(--color-gradientlight)] to-[var(--color-gradientdark)] shadow-lg transition-all duration-300 ease-in-out
        `}
        >
          <button
            onClick={toggleSidebar}
            className={`absolute top-4 ${
              isOpen ? "right-4" : "right-1/2 transform translate-x-1/2"
            } p-2 text-white hover:bg-[var(--color-primary)] hover:bg-opacity-20 rounded-lg transition-all hidden md:flex items-center justify-center`}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Logo */}
          <div className="mt-10 mb-auto">
            <div
              className={`flex items-center ${
                isOpen ? "justify-start" : "justify-center"
              } relative`}
            >
              <Image
                src="/Logo.png"
                alt="Logo"
                width={130}
                height={130}
                className={`fill-current text-white ${isOpen ? "left-10" : ""}`}
              />
            </div>
          </div>

          {/* Menu Items */}
          {renderMenuItems(true)}

          {/* Desktop Profile Section */}
          <div
            className={`mt-auto mb-3 ${
              isOpen ? "px-4" : "px-0"
            } py-2 flex justify-center items-center cursor-pointer hover:bg-[var(--color-primary)] hover:bg-opacity-20`}
            onClick={() => setShowProfileSwitcher(true)}
          >
            <div className="relative">
              <div className="w-14 h-14 rounded-full bg-gray-300 overflow-hidden border-2 border-white">
                <Image
                  src={selectedProfile?.avatar || DummyProfileImage}
                  alt={`${selectedProfile?.name} avatar`}
                  width={48}
                  height={48}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-1 -right-1 bg-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold text-[var(--color-primary)]">
                {selectedProfile?.rating}
              </div>
            </div>
            {isOpen && (
              <div className="ml-3 text-white">
                <div className="text-sm font-medium">
                  {selectedProfile?.name}
                </div>
                <div className="text-xs opacity-80">
                  {selectedProfile?.role}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showProfileSwitcher && (
        <>
          <div className="fixed inset-0 bg-black/50 z-50" />
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div
              ref={profileSwitcherRef}
              className="w-64 bg-white rounded-2xl shadow-xl"
            >
              <div className="p-3">
                {/* Add Account Button */}
                <div
                  className="flex items-center p-2 rounded-lg hover:bg-gray-100 cursor-pointer mb-2"
                  onClick={() => {
                    setShowProfileSwitcher(false);
                    router.push("/signin");
                  }}
                >
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                    <Plus size={20} className="text-gray-500" />
                  </div>
                  <span className="text-sm text-gray-700">Add account</span>
                </div>

                {/* User Profiles */}
                {profiles.map((profile) => (
                  <div
                    key={profile.id}
                    className={`flex items-center p-2 rounded-4xl cursor-pointer ${
                      profile.active
                        ? "bg-[var(--color-gradientdark)] text-white"
                        : "hover:bg-[var(--color-gradientlight)] text-[var(--color-gradientdark)]"
                    }`}
                    onClick={() => handleProfileSwitch(profile.id)}
                  >
                    <div className="relative mr-3">
                      <div className="w-10 h-10 rounded-full bg-gray-300 overflow-hidden">
                        <Image
                          src={profile.avatar || DummyProfileImage}
                          alt={`${profile.name} avatar`}
                          width={48}
                          height={48}
                        />
                      </div>
                      <div className="absolute -bottom-1 -right-1 bg-white rounded-full w-4 h-4 flex items-center justify-center text-xs font-bold text-[var(--color-primary)]">
                        {profile.rating}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium">{profile.name}</div>
                      <div
                        className={`text-xs ${
                          profile.active
                            ? "text-[var(--color-gradientlight)]"
                            : "text-[var(--color-gradientdark)]"
                        }`}
                      >
                        {profile.role}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {showLogoutConfirm && (
        <>
          <div className="fixed inset-0 bg-black/50 z-50" />
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div
              ref={logoutConfirmRef}
              className="w-64 bg-white rounded-2xl shadow-xl"
            >
              <div className="p-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                    <LogOut size={20} className="text-gray-500" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-700">
                      Confirm Logout
                    </div>
                    <div className="text-xs text-gray-500">
                      Are you sure you want to logout?
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowLogoutConfirm(false)}
                    className="cursor-pointer flex-1 px-4 py-2 text-sm rounded-4xl bg-gray-100 text-gray-700 hover:bg-gray-200 border border-[var(--color-primary)]"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleLogout}
                    className="cursor-pointer flex-1 px-4 py-2 text-sm rounded-4xl bg-[var(--color-primary)] text-white hover:bg-opacity-90 hover:bg-primary-hover transition-all duration-300"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Sidebar;
