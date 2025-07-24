import ReusableSwiper from "../Reusable/Swiper";
import { ReusableCard } from "../Reusable/Card";
import DiscoverInfos from "./DiscoverInfos";
import { IoIosArrowDroprightCircle } from "react-icons/io";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { ServicesCard, SalesCard } from "../Reusable/Card";

const DisplayCards = ({ 
  sections, 
  breakpoints, 
  activeTab, 
  expandedSection, 
  setExpandedSection, 
  followings,
  // Services infinite scroll props
  fetchMoreServices,
  hasNextPageServices,
  isFetchingNextPageServices,
  // Providers infinite scroll props
  fetchMoreProviders,
  hasNextPageProviders,
  isFetchingNextPageProviders
}) => {
  const pathname = usePathname();

  const handleViewAll = (sectionTitle) => {
    setExpandedSection(expandedSection === sectionTitle ? null : sectionTitle);
  };

  const path =
    activeTab === "services" || activeTab === "sales"
      ? "/service-info"
      : pathname === "/" || pathname === "/discover"
      ? "/provider-profile"
      : "/mission";
  
  const scrollToHeading = () => {
    document.getElementById("target-heading").scrollIntoView({
      behavior: "smooth",
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {sections.map((section) => (
        <div key={section.title} className={expandedSection && expandedSection !== section.title ? "hidden" : ""}>
          <div className="flex items-center text-2xl font-bold mb-6 mt-6">
            <h2 id="target-heading">{section.title}</h2>
            {section?.data?.length > 0 && (
              <button
                onClick={() => {
                  handleViewAll(section.title);
                  scrollToHeading();
                }}
                className="ml-auto"
              >
                {pathname === "/following" || pathname === "/missions" ? (
                  <span className="text-brown hover:text-brown/80 text-base underline cursor-pointer">
                    {expandedSection === section.title ? "Hide All" : "View All"}
                  </span>
                ) : (
                  <IoIosArrowDroprightCircle
                    className={`text-3xl text-primary cursor-pointer transition-transform duration-300 ${
                      expandedSection === section.title ? "rotate-90" : ""
                    }`}
                  />
                )}
              </button>
            )}
          </div>

          {section?.data?.length === 0 ? (
            <div className="flex justify-center items-center p-28">
              <p className="text-center text-gray-500">{section?.msg}</p>
            </div>
          ) : expandedSection === section.title ? (
            <DiscoverInfos data={section.data} activetab={activeTab} />
          ) : (
            <ReusableSwiper
              data={section.data}
              Component={
                activeTab === "stores" || section.title === "Stores You Follow"
                  ? ReusableCard
                  : activeTab === "services"
                  ? ServicesCard
                  : activeTab === "sales" ||
                    section.title === "Last Minute Deals" ||
                    section.title === "Followers Exclusive Deals" ||
                    section.title === "Latest Sales"
                  ? SalesCard
                  : ReusableCard
              }
              breakpoints={breakpoints}
              routePrefix={path}
              followings={followings}
              // Conditional infinite scroll props based on activeTab
              onReachEnd={
                activeTab === "stores" 
                  ? fetchMoreProviders
                  : activeTab === "services" 
                  ? fetchMoreServices
                  : activeTab === "sales" 
                  ? fetchMoreServices
                  : undefined
              }
              hasNextPage={
                activeTab === "stores" 
                  ? hasNextPageProviders
                  : activeTab === "services" 
                  ? hasNextPageServices
                  : activeTab === "sales" 
                  ? hasNextPageServices
                  : false
              }
              isFetchingNextPage={
                activeTab === "stores" 
                  ? isFetchingNextPageProviders
                  : activeTab === "services" 
                  ? isFetchingNextPageServices
                  : activeTab === "sales" 
                  ? isFetchingNextPageServices
                  : false
              }
            />
          )}
        </div>
      ))}
    </div>
  );
};

export default DisplayCards;
