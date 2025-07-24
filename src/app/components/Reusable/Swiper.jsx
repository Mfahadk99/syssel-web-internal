"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import SkeletonCard from "./SkeletonCard";
import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import SimpleLogoLoader from "@/app/components/Loader/Loader";

const ReusableSwiper = ({
  data,
  routePrefix,
  Component,
  slidesPerView = 5,
  spaceBetween = 20,
  navigation = true,
  className = "",
  id = "",
  noWrap = false,
  followings,
  onReachEnd,
  hasNextPage,
  isFetchingNextPage,
  breakpoints = {
    320: { slidesPerView: 1, spaceBetween: 10 },
    640: { slidesPerView: 2, spaceBetween: 15 },
    768: { slidesPerView: 3, spaceBetween: 15 },
    1024: { slidesPerView: 4, spaceBetween: 20 },
  },
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [uniqueId] = useState(`swiper-${id || Math.random().toString(36).substr(2, 9)}`);
  const swiperRef = useRef(null);

  useEffect(() => {
    if (data) {
      setIsLoading(false);
    }
  }, [data]);

  const handleSlideChange = (swiper) => {
    const { activeIndex, slides } = swiper;
    const slidesPerView = swiper.params.slidesPerView;
    
    if (
      onReachEnd && 
      hasNextPage && 
      !isFetchingNextPage && 
      activeIndex >= slides.length - slidesPerView - 2
    ) {
      onReachEnd();
    }
  };

  if (isLoading) {
    return (
      <div className="relative">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, index) => (
            <SkeletonCard key={index} />
          ))}
        </div>
      </div>
    );
  }

  if (!data?.length) return null;

  return (
    <div className="relative">
      {navigation && (
        <>
          <button
            className={`${uniqueId}-prev absolute left-[-30px] sm:left-[-40px] top-1/2 z-10 -translate-y-1/2 
                        p-2 transition-colors text-gray-400 hover:text-gray-700
                        disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
          <button
            className={`${uniqueId}-next absolute right-[-30px] sm:right-[-40px] top-1/2 z-10 -translate-y-1/2 
                        p-2 transition-colors text-gray-400 hover:text-gray-700
                        disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </>
      )}

      <Swiper
        ref={swiperRef}
        modules={[Navigation]}
        navigation={{
          prevEl: `.${uniqueId}-prev`,
          nextEl: `.${uniqueId}-next`,
          hideOnClick: false,
        }}
        spaceBetween={spaceBetween}
        slidesPerView={slidesPerView === "auto" ? "auto" : slidesPerView}
        breakpoints={slidesPerView === "auto" ? undefined : breakpoints}
        className={`mySwiper ${className} ${uniqueId}-swiper ${noWrap ? "items-center" : ""}`}
        onSlideChange={handleSlideChange}
        onReachEnd={() => {
          if (onReachEnd && hasNextPage && !isFetchingNextPage) {
            onReachEnd();
          }
        }}
      >
        {data.map((item, index) => (
          <SwiperSlide
            key={item._id || index}
            className={noWrap ? "p-1 w-auto !whitespace-nowrap !width-auto flex-shrink-0 flex-grow-0" : ""}
            style={noWrap ? { width: "auto", maxWidth: "fit-content" } : {}}
          >
            <Component item={item} routePrefix={routePrefix} followings={followings} />
          </SwiperSlide>
        ))}
        
        {isFetchingNextPage && hasNextPage && (
          // <SwiperSlide>
          //   <div className="flex justify-center items-center h-64">
          //     <div className="flex items-center space-x-2">
          //       <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          //       <span className="text-gray-500">Loading more...</span>
          //     </div>
          //   </div>
          // </SwiperSlide>
          <SimpleLogoLoader/>
        )}
      </Swiper>
    </div>
  );
};

export default ReusableSwiper;
