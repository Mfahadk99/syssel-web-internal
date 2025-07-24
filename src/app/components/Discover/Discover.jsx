"use client";
import React, { useState, useEffect } from "react";
import { FiSearch, FiShoppingBag, FiTool, FiTag } from "react-icons/fi";
import ReusableSwiper from "../Reusable/Swiper";
import DisplayCards from "./DisplayCards";
import SlidingButtons from "../Reusable/SlidingButtons";
import { usePathname } from "next/navigation";
import Advertisement from "../Discover/Advertisement";

const Discover = ({ 
  sections, 
  breakpoints, 
  showAds, 
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
  const [activeTab, setActiveTab] = useState("");
  const [activeCategory, setActiveCategory] = useState(null);
  const [activeSubcategory, setActiveSubcategory] = useState(null);
  const [expandedSection, setExpandedSection] = useState(null);
  const pathname = usePathname();
  

  useEffect(() => {
    if (pathname === '/discover' || pathname === '/') {
      setActiveTab("stores");
    } else {
      setActiveTab("");
    }
  }, [pathname]);
  
  const tabData = [
    { id: "stores", icon: FiShoppingBag, label: "Stores" },
    { id: "services", icon: FiTool, label: "Services" },
    { id: "sales", icon: FiTag, label: "Sales" },
  ];

  const categories = [
    { id: "all", name: "All" },
    { id: "tattoo", name: "Tattoo" },
    { id: "hair-beauty", name: "Hair & Beauty" },
    { id: "skincare", name: "Skincare" },
    { id: "makeup-cosmetics", name: "Makeup & Cosmetics" },
    { id: "health-wellness", name: "Health & Wellness" },
    { id: "fitness", name: "Fitness" },
    { id: "yoga-meditation", name: "Yoga & Meditation" },
    { id: "nutrition-diet", name: "Nutrition & Diet" },
    { id: "home-decor", name: "Home Decor" },
    { id: "furniture-interior", name: "Furniture & Interior" },
    { id: "gardening", name: "Gardening" },
    { id: "smart-home", name: "Smart Home" },
  ];

  const subcategoriesMap = {
    All: [],
    Tattoo: [
      { id: "traditional", name: "Traditional" },
      { id: "realism", name: "Realism" },
      { id: "watercolor", name: "Watercolor" },
      { id: "tribal", name: "Tribal" },
    ],
    "Hair & Beauty": [
      { id: "hairstyling", name: "Hairstyling" },
      { id: "coloring", name: "Coloring" },
      { id: "extensions", name: "Extensions" },
      { id: "treatments", name: "Treatments" },
    ],
    Skincare: [
      { id: "cleansers", name: "Cleansers" },
      { id: "moisturizers", name: "Moisturizers" },
      { id: "serums", name: "Serums" },
      { id: "masks", name: "Masks" },
      { id: "sun-protection", name: "Sun Protection" },
    ],
    "Makeup & Cosmetics": [
      { id: "face", name: "Face" },
      { id: "eyes", name: "Eyes" },
      { id: "lips", name: "Lips" },
      { id: "nails", name: "Nails" },
    ],
    "Health & Wellness": [
      { id: "supplements", name: "Supplements" },
      { id: "alternative-medicine", name: "Alternative Medicine" },
      { id: "mental-health", name: "Mental Health" },
    ],
    Fitness: [
      { id: "gym", name: "Gym" },
      { id: "cardio", name: "Cardio" },
      { id: "crossfit", name: "CrossFit" },
      { id: "personal-training", name: "Personal Training" },
    ],
    "Yoga & Meditation": [
      { id: "hatha", name: "Hatha" },
      { id: "vinyasa", name: "Vinyasa" },
      { id: "mindfulness", name: "Mindfulness" },
      { id: "breathwork", name: "Breathwork" },
    ],
    "Nutrition & Diet": [
      { id: "meal-planning", name: "Meal Planning" },
      { id: "supplements", name: "Supplements" },
      { id: "specialty-diets", name: "Specialty Diets" },
    ],
    "Home Decor": [
      { id: "wall-art", name: "Wall Art" },
      { id: "textiles", name: "Textiles" },
      { id: "lighting", name: "Lighting" },
      { id: "accessories", name: "Accessories" },
    ],
    "Furniture & Interior": [
      { id: "living-room", name: "Living Room" },
      { id: "bedroom", name: "Bedroom" },
      { id: "kitchen", name: "Kitchen" },
      { id: "office", name: "Office" },
    ],
    Gardening: [
      { id: "indoor-plants", name: "Indoor Plants" },
      { id: "outdoor-plants", name: "Outdoor Plants" },
      { id: "tools", name: "Tools" },
      { id: "planters", name: "Planters" },
    ],
    "Smart Home": [
      { id: "security", name: "Security" },
      { id: "lighting", name: "Lighting" },
      { id: "entertainment", name: "Entertainment" },
      { id: "automation", name: "Automation" },
    ],
  };

  // Get current subcategories based on active category
  const currentSubcategories = activeCategory
    ? subcategoriesMap[activeCategory] || []
    : [];

  // Category component for the swiper with non-wrapping text
  const CategoryComponent = ({ item }) => (
    <div
      onClick={() => {
        if (activeCategory === item.name) {
          // If clicking the same category, deselect it
          setActiveCategory(null);
          setActiveSubcategory(null);
        } else {
          // If clicking a different category, select it and its first subcategory
          setActiveCategory(item.name);
          // Get the subcategories for this category
          const subCategories = subcategoriesMap[item.name] || [];
          // Select the first subcategory if available
          if (subCategories.length > 0) {
            setActiveSubcategory(subCategories[0].name);
          } else {
            setActiveSubcategory(null);
          }
        }
      }}
      className={`cursor-pointer px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-200 inline-block
        ${
          activeCategory === item.name
            ? "bg-primary text-white shadow-md"
            : "bg-white text-gray-700 hover:bg-gray-100"
        }`}
    >
      {item.name}
    </div>
  );

  // Subcategory component for the swiper
  const SubcategoryComponent = ({ item }) => (
    <div
      onClick={() =>
        setActiveSubcategory(activeSubcategory === item.name ? null : item.name)
      }
      className="cursor-pointer px-3 py-2 text-sm font-medium transition-all duration-200 relative"
    >
      <span
        className={`${
          activeSubcategory === item.name
            ? "text-primary font-medium"
            : "text-gray-600"
        }`}
      >
        {item.name}
      </span>
      {activeSubcategory === item.name && (
        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-full" />
      )}
    </div>
  );

  return (
    <div>

      {/* Category tabs with sliding indicator using SlidingButtons component */}
      {(pathname === "/discover" || pathname === "/") && (
        <div className="mb-2">
          <SlidingButtons
            buttons={tabData}
            activeButton={activeTab}
            setActiveButton={(tabId) => {
              setActiveTab(tabId);
              setExpandedSection(null);
            }}
          />
        </div>
      )}

      {/* List of categories using ReusableSwiper */}
      {pathname === "/discover" && (
        <div className="py-4 w-[95%] mx-auto">
          <ReusableSwiper
            data={categories}
            Component={CategoryComponent}
            slidesPerView="auto"
            spaceBetween={12}
            id="categories"
            className="categories-swiper"
            noWrap={true}
          />
        </div>
      )}

      {/* Subcategories swiper - only appears when a category is selected */}
      {activeCategory && currentSubcategories.length > 0 && (
        <div className="pb-4 pt-1 w-[95%] mx-auto">
          <ReusableSwiper
            data={currentSubcategories}
            Component={SubcategoryComponent}
            slidesPerView="auto"
            spaceBetween={10}
            id="subcategories"
            className="subcategories-swiper"
            noWrap={true}
          />
        </div>
      )}

      
      {showAds && (
        <div className="mb-4">
          <Advertisement
            // ads={yourAdsData}
            autoplayInterval={5000}
            // className="your-additional-classes"
          />
        </div>
      )}

      {/* Dynamically render DisplayCards based on activeTab */}
      <DisplayCards
        sections={
          activeTab === "stores"
            ? sections.stores || sections
            : activeTab === "services"
            ? sections.services || sections
            : sections.sales || sections
        }
        breakpoints={breakpoints}
        activeTab={activeTab}
        expandedSection={expandedSection}
        setExpandedSection={setExpandedSection}
        followings={followings}
        // Services infinite scroll props
        fetchMoreServices={fetchMoreServices}
        hasNextPageServices={hasNextPageServices}
        isFetchingNextPageServices={isFetchingNextPageServices}
        // Providers infinite scroll props
        fetchMoreProviders={fetchMoreProviders}
        hasNextPageProviders={hasNextPageProviders}
        isFetchingNextPageProviders={isFetchingNextPageProviders}
      />
    </div>
  );
};

export default Discover;
