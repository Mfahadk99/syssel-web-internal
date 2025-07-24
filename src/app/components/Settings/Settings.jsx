"use client";
import React, { useState, useRef, useEffect } from "react";
import { FiArrowLeft, FiChevronRight } from "react-icons/fi";
import {
  MdEmail,
  MdLock,
  MdSecurity,
  MdLanguage,
  MdHelp,
  MdEdit,
  MdBusiness,
  MdCancel,
  MdLoyalty,
} from "react-icons/md";
import { IoRocketSharp, IoCalendarSharp } from "react-icons/io5";
import Image from "next/image";
import Link from "next/link";
import Changepass from "./Changepass";
import Radius from "./Radius";
import Language from "./Language";
import { useRouter } from "next/navigation";
import useAuthStore from "@/app/store/useAuthStore";
// import { useLoader } from "@/app/context/LoaderContext";

const Settings = ({ setttingsId, radiusSettings, missionSettings, language }) => {
  const { currentProfile } = useAuthStore();
  const profileType = currentProfile?.profileType;
  const [userType, setUserType] = useState(profileType); // Provider or Buyer
  // const { setLoading } = useLoader();
  

  useEffect(() => {
    setUserType(profileType);
  }, [profileType]);

  const { user } = useAuthStore();
  const [expandedSections, setExpandedSections] = useState({
    password: false,
    discover: false,
    mission: false,
    language: false,
  });
  const [currentLanguage, setCurrentLanguage] = useState(language);
  const router = useRouter();

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const image = "https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg";

  const settingsOptions = [
    {
      icon: <MdEmail size={22} />,
      label: "Email",
      value: user?.email,
      showArrow: false,
      hasValue: true,
    },
    {
      icon: <MdLock size={22} />,
      label: "Password",
      value: "••••••••••••",
      showArrow: true,
      hasValue: true,
      section: "password",
    },
    {
      icon: <IoRocketSharp size={22} />,
      label: "Mission Settings",
      showArrow: true,
      hasValue: false,
      section: "mission",
      userType: "provider",
    },
    {
      icon: <MdSecurity size={22} />,
      label: "Provider Settings",
      showArrow: true,
      hasValue: false,
      action: "/provider-settings",
      userType: "provider",
    },
    {
      icon: <MdBusiness size={22} />,
      label: "Company information",
      showArrow: true,
      hasValue: false,
      action: "/company-info",
      userType: "provider",
    },
    {
      icon: <MdCancel size={22} />,
      label: "Cancellation policy",
      showArrow: true,
      hasValue: false,
      action: "/cancellation-policy",
      userType: "provider",
    },
    {
      icon: <MdLoyalty size={22} />,
      label: "Loyalty program",
      showArrow: true,
      hasValue: false,
      action: "/loyalty-program",
      userType: "provider",
    },
    {
      icon: <IoCalendarSharp size={22} />,
      label: "Calender and Booking",
      showArrow: true,
      hasValue: false,
      action: "/calender-and-booking",
      userType: "provider",
    },
    {
      icon: <IoRocketSharp size={22} />,
      label: "Discover Settings",
      showArrow: true,
      hasValue: false,
      section: "discover",
      userType: "buyer",
    },
    {
      icon: <MdSecurity size={22} />,
      label: "Privacy & Security",
      showArrow: true,
      hasValue: false,
      action: "/policies",
    },
    {
      icon: <MdLanguage size={22} />,
      label: "Language",
      value: currentLanguage === "en" ? "English (US)" : "Norsk",
      showArrow: true,
      hasValue: true,
      section: "language",
    },
    {
      icon: <MdHelp size={22} />,
      label: "Support",
      showArrow: true,
      hasValue: false,
      action: "/support",
    },
  ];

  const filteredOptions = settingsOptions.filter((option) => !option.userType || option.userType === userType);

  // Component for expandable content
  const ExpandableContent = ({ isExpanded, section, children }) => {
    const [height, setHeight] = useState(0);
    const contentRef = useRef(null);

    useEffect(() => {
      if (contentRef.current) {
        setHeight(isExpanded ? contentRef.current.scrollHeight : 0);
      }
    }, [isExpanded]);

    return (
      <div
        className="mt-1 rounded-lg bg-white overflow-hidden transition-all duration-300 ease-in-out rounded-b-lg shadow-md"
        style={{ maxHeight: height, opacity: isExpanded ? 1 : 0 }}
      >
        <div ref={contentRef}>{children}</div>
      </div>
    );
  };

  // Add a navigation handler function
  const handleNavigation = (path) => {
    // setLoading(true);
    router.push(path);
    // setLoading(false);
  };

  return (
    <div className="bg-background min-h-screen mb-5">
      {/* Header */}
      <div className="flex items-center pt-6 px-6 pb-4">
        <h1 className="text-2xl font-bold text-gray-800 mx-auto">Settings</h1>
      </div>

      {/* Profile Section */}
      {/* <div className="rounded-lg mx-4 mt-4 mb-4 p-6 flex justify-center">
        <div className="flex flex-col items-center">
          <div className="relative">
            <div className="rounded-full overflow-hidden w-32 h-32 ring-2 ring-blue-100">
              <Image
                src={image}
                alt="Profile"
                width={112}
                height={112}
                className="w-full h-full object-cover object-center"
              />
            </div>
            <Link
              href="/"
              className="absolute bottom-0 right-0 bg-primary hover:bg-primary/80 p-1.5 rounded-full text-white shadow-md transition-colors"
            >
              <MdEdit size={14} />
            </Link>
          </div>
          <div className="mt-4 flex flex-col items-center">
            <h2 className="text-2xl font-semibold text-gray-800">{user?.name}</h2>
            {userType === "Provider" && <p className="text-md text-gray-500 mt-1">Professional Account</p>}
          </div>
        </div>
      </div> */}

      {/* Settings Options */}
      <div className="px-4 space-y-3">
        {filteredOptions.map((option, index) => (
          <div key={index}>
            <div
              onClick={() => {
                if (option.section) {
                  toggleSection(option.section);
                } else if (option.action) {
                  handleNavigation(option.action);
                }
              }}
              className={`shadow-sm options-border bg-white py-4 px-4 flex items-center transition-all duration-300 
                        ${option.section || option.action ? "cursor-pointer hover:shadow-md" : ""}
                        ${option.section && expandedSections[option.section] ? "rounded-b-none" : ""}`}
            >
              <div className="text-gray-500 mr-3">{option.icon}</div>
              <div className="flex-1">
                <p className={`text-sm ${option.hasValue ? "text-gray-500" : ""}`}>{option.label}</p>
                {option.hasValue && <p className="text-sm">{option.value}</p>}
              </div>
              {option.showArrow && (
                <FiChevronRight
                  size={20}
                  className={`text-gray-400 transition-transform duration-300 
                             ${option.section && expandedSections[option.section] ? "rotate-90" : ""}`}
                />
              )}
            </div>

            {option.section === "password" && (
              <ExpandableContent isExpanded={expandedSections.password}>
                <Changepass onCancel={() => toggleSection("password")} />
              </ExpandableContent>
            )}

            {option.section === "discover" && (
              <ExpandableContent isExpanded={expandedSections.discover}>
                <Radius title="Discover radius" id={setttingsId} radiusSettings={radiusSettings} />
              </ExpandableContent>
            )}

            {option.section === "mission" && (
              <ExpandableContent isExpanded={expandedSections.mission}>
                <Radius title="Mission radius" missionSettings={missionSettings} id={setttingsId} />
              </ExpandableContent>
            )}

            {option.section === "language" && (
              <ExpandableContent isExpanded={expandedSections.language}>
                <Language
                  currentLanguage={currentLanguage}
                  onLanguageChange={setCurrentLanguage}
                  language={language}
                  onCancel={() => toggleSection("language")}
                  settingsId={setttingsId}
                />
              </ExpandableContent>
            )}

            {option.section === "calender" && (
              <ExpandableContent isExpanded={expandedSections.calender}>
                <Radius title="Calender and Booking" />
              </ExpandableContent>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Settings;
