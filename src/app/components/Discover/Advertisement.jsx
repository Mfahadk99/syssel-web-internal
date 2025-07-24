'use client';

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";

// Working ad data with real image URLs
const sampleAds = [
  {
    id: 1,
    discount: "50%",
    title: "På Portrettfoto",
    vendor: "Amundsen Elektro",
    distance: "200m",
    bgColor: "bg-amber-200",
    tagColor: "bg-red-500",
    imageUrl: "https://via.placeholder.com/800x400?text=Ad+1",
  },
  {
    id: 2,
    discount: "25%",
    title: "På Elektronik",
    vendor: "TechStore",
    distance: "500m",
    bgColor: "bg-blue-200",
    tagColor: "bg-blue-500",
    imageUrl: "https://via.placeholder.com/800x400?text=Ad+2",
  },
  {
    id: 3,
    discount: "40%",
    title: "På Möbler",
    vendor: "HomeDesign",
    distance: "1.2km",
    bgColor: "bg-green-200",
    tagColor: "bg-green-500",
    imageUrl: "https://via.placeholder.com/800x400?text=Ad+3",
  },
  {
    id: 4,
    discount: "60%",
    title: "På Kläder",
    vendor: "Fashion World",
    distance: "350m",
    bgColor: "bg-purple-200",
    tagColor: "bg-purple-500",
    imageUrl: "https://via.placeholder.com/800x400?text=Ad+4",
  },
];

const AdCarousel = ({
  ads = sampleAds,
  autoplayInterval = 5000,
  className = "",
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    let intervalId;
    if (isAutoPlaying) {
      intervalId = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % ads.length);
      }, autoplayInterval);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isAutoPlaying, ads.length, autoplayInterval]);

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + ads.length) % ads.length);
    pauseAutoplay();
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % ads.length);
    pauseAutoplay();
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
    pauseAutoplay();
  };

  const pauseAutoplay = () => {
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000); // resume after 10s
  };

  return (
    <div className={`relative overflow-hidden rounded-lg shadow-md ${className}`}>
      {/* Featured Label */}
      <div className="absolute top-0 left-0 z-10 bg-white px-4 py-1 text-blue-600 font-bold text-lg rounded-br-lg">
        Featured
      </div>

      {/* Carousel Container */}
      <div className="relative w-full h-64">
        {ads.map((ad, index) => (
          <div
            key={ad.id}
            className={`absolute inset-0 w-full h-full transition-opacity duration-500 ${
              index === currentIndex ? "opacity-100" : "opacity-0"
            }`}
          >
            {/* Background Color Overlay */}
            <div className={`absolute inset-0 ${ad.bgColor}`} />

            {/* Background Image */}
            <Image
              src={ad.imageUrl}
              alt={ad.title}
              fill
              className="object-cover opacity-30"
              priority={index === 0}
            />

            {/* Ad Content */}
            <div className="absolute inset-0 flex flex-col justify-center px-6">
              <div className="flex items-start">
                <div className="flex-1">
                  <h2 className="text-6xl font-bold text-white mb-2">
                    {ad.discount}
                  </h2>
                  <h3 className="text-3xl font-bold text-white">{ad.title}</h3>
                </div>
                <div
                  className={`${ad.tagColor} text-white p-2 rounded flex flex-col items-center justify-center`}
                >
                  <span className="font-bold text-sm">BLACK</span>
                  <span className="font-bold text-sm">FRIDAY</span>
                  <span className="font-bold text-lg">{ad.discount}</span>
                  <span className="text-xs">DISCOUNT</span>
                </div>
              </div>

              {/* Vendor Info */}
              <div className="flex items-center mt-4">
                <div className="w-8 h-8 bg-gray-300 rounded-full overflow-hidden relative">
                  <Image
                    src="https://via.placeholder.com/32"
                    alt={ad.vendor}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="ml-2">
                  <p className="font-semibold text-white">{ad.vendor}</p>
                  <p className="text-sm text-white">{ad.distance}</p>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Arrows */}
        <button
          onClick={goToPrevious}
          className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white p-1 rounded-full shadow-lg transition-colors"
          aria-label="Previous ad"
        >
          <ChevronLeft size={24} />
        </button>
        <button
          onClick={goToNext}
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white p-1 rounded-full shadow-lg transition-colors"
          aria-label="Next ad"
        >
          <ChevronRight size={24} />
        </button>

        {/* Dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
          {ads.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentIndex ? "bg-white" : "bg-white/50"
              }`}
              aria-label={`Go to ad ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdCarousel;
